import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY') ?? '';
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

function weatherHash(date: string, weather: any): string {
  return `${date}_${weather.temp}_${weather.condition}`;
}

async function fetchWeather(): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/weather`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('날씨 정보 조회 실패');
  return res.json();
}

async function searchImage(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY) {
    console.error('[Pexels] PEXELS_API_KEY env var missing');
    return null;
  }
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!res.ok) {
      const body = await res.text();
      console.error(`[Pexels] ${res.status} for "${query}":`, body.slice(0, 200));
      return null;
    }
    const data = await res.json();
    const photos = data.photos ?? [];
    if (photos.length === 0) {
      console.warn(`[Pexels] no photo for "${query}"`);
      return null;
    }
    const portraitPhoto = photos.find((p: any) => p.height > p.width);
    return (portraitPhoto ?? photos[0]).src.medium;
  } catch (err) {
    console.error(`[Pexels] fetch error for "${query}":`, err.message);
    return null;
  }
}

async function callGemini(weather: any): Promise<any> {
  const prompt = `너는 한국의 패션 코디네이터 AI다.
오늘 날씨:
- 위치: ${weather.location}
- 기온: ${weather.temp}°C (최저 ${weather.tempMin}°C / 최고 ${weather.tempMax}°C)
- 날씨: ${weather.condition}
- 강수확률: ${weather.precipitation}%
- 풍속: ${weather.windSpeed}m/s

한국 패션 트렌드를 반영하여 오늘 날씨에 어울리는 코디를 추천해줘.
구체적인 아이템명과 색상을 포함하고, 친근하게 추천 이유를 설명해줘.
각 아이템에 Pexels 이미지 검색용 searchQuery도 포함해줘 (반드시 영어로, 예: "beige trench coat fashion").

반드시 아래 JSON 형식으로만 응답:
{
  "items": [
    { "type": "아우터", "category": "트렌치코트", "color": "#D2B48C", "colorName": "베이지", "reason": "설명", "searchQuery": "beige trench coat fashion" }
  ],
  "accessories": [
    { "type": "액세서리", "category": "토트백", "color": "#4B3621", "colorName": "브라운", "reason": "설명", "searchQuery": "brown tote bag outfit" }
  ],
  "summary": "전체 코디 요약 한 줄",
  "tip": "추가 스타일링 팁"
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
          temperature: 0.9,
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

async function enrichWithImages(recommendation: any): Promise<any> {
  const enrichItems = async (items: any[]) => {
    if (!items) return [];
    return Promise.all(
      items.map(async (item: any) => {
        if (item.imageUrl) return item;
        const imageUrl = item.searchQuery
          ? await searchImage(item.searchQuery)
          : null;
        return { ...item, imageUrl };
      })
    );
  };

  const [items, accessories] = await Promise.all([
    enrichItems(recommendation.items),
    enrichItems(recommendation.accessories),
  ]);

  return { ...recommendation, items, accessories };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const url = new URL(req.url);
    const refresh = url.searchParams.get('refresh') === 'true';
    const today = todayKST();

    // 날씨 조회
    const weather = await fetchWeather();
    const hash = weatherHash(today, weather);

    // 캐시 확인
    if (!refresh) {
      const { data: cached } = await supabase
        .from('general_recommendations')
        .select('*')
        .eq('date', today)
        .eq('weather_hash', hash)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cached) {
        let rec = cached.recommendation;

        // 이미지 누락 아이템이 있으면 이미지만 재검색
        const hasNullImage = [
          ...(rec.items ?? []),
          ...(rec.accessories ?? []),
        ].some((item: any) => item.searchQuery && !item.imageUrl);

        if (hasNullImage) {
          rec = await enrichWithImages(rec);
          await supabase.from('general_recommendations').update({
            recommendation: rec,
          }).eq('id', cached.id);
        }

        return new Response(JSON.stringify({
          weather: cached.weather_data,
          recommendation: rec,
          cached: true,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Gemini 호출
    const rawRecommendation = await callGemini(weather);

    // Pexels 이미지 검색으로 보강
    const recommendation = await enrichWithImages(rawRecommendation);

    // 캐시 저장 (upsert)
    await supabase.from('general_recommendations').upsert({
      date: today,
      weather_hash: hash,
      weather_data: weather,
      recommendation,
    }, { onConflict: 'date,weather_hash' });

    return new Response(JSON.stringify({
      weather,
      recommendation,
      cached: false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
