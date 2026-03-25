import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function todayKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

async function fetchWeather(): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/weather`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('날씨 정보 조회 실패');
  return res.json();
}

async function callGemini(weather: any, clothes: any[]): Promise<any> {
  const clothesList = clothes.map(c =>
    `- ${c.category.type} > ${c.category.name} (${c.color_name}, ${c.color})`
  ).join('\n');

  const prompt = `너는 한국의 패션 코디네이터 AI다.
오늘 날씨:
- 위치: ${weather.location}
- 기온: ${weather.temp}°C (최저 ${weather.tempMin}°C / 최고 ${weather.tempMax}°C)
- 날씨: ${weather.condition}
- 강수확률: ${weather.precipitation}%
- 풍속: ${weather.windSpeed}m/s

사용자 옷장:
${clothesList}

위 옷장에서만 선택하여 오늘 날씨에 맞는 코디를 추천해줘.
색상 조합을 고려하고, 친근하게 추천 이유를 설명해줘.

반드시 아래 JSON 형식으로만 응답:
{
  "items": [
    { "type": "아우터", "category": "코트", "color": "#D2B48C", "colorName": "베이지", "reason": "설명" }
  ],
  "accessories": [
    { "type": "액세서리", "category": "모자", "color": "#333333", "colorName": "검정", "reason": "설명" }
  ],
  "summary": "전체 코디 요약",
  "tip": "추가 팁"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API 오류: ${err}`);
  }

  const geminiRes = await res.json();
  const text = geminiRes?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini 응답 없음');

  return JSON.parse(text);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('인증 필요');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('인증 실패');

    const url = new URL(req.url);
    const refresh = url.searchParams.get('refresh') === 'true';
    const today = todayKST();

    // 캐시 확인
    if (!refresh) {
      const { data: cached } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cached) {
        return new Response(JSON.stringify({
          weather: cached.weather_data,
          recommendation: cached.a2ui_json,
          cached: true,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 날씨 조회
    const weather = await fetchWeather();

    // 옷장 조회
    const { data: clothes, error: clothesError } = await supabase
      .from('user_clothes')
      .select(`
        id, color, color_name,
        category:clothing_categories (id, name, type, icon)
      `)
      .eq('user_id', user.id);

    if (clothesError) throw clothesError;
    if (!clothes || clothes.length === 0) {
      return new Response(JSON.stringify({
        error: '옷장에 등록된 옷이 없습니다',
        code: 'EMPTY_CLOSET',
        weather,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Gemini 호출
    const recommendation = await callGemini(weather, clothes);

    // 저장
    await supabase.from('recommendations').insert({
      user_id: user.id,
      date: today,
      weather_data: weather,
      a2ui_json: recommendation,
    });

    return new Response(JSON.stringify({
      weather,
      recommendation,
      cached: false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const status = error.message?.includes('인증') ? 401 : 500;
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
