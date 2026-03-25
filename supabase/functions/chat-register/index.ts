import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COLOR_PRESETS = [
  { name: '검정', hex: '#333333' },
  { name: '흰색', hex: '#FFFFFF' },
  { name: '회색', hex: '#808080' },
  { name: '네이비', hex: '#1E3A8A' },
  { name: '베이지', hex: '#F5E6D3' },
  { name: '브라운', hex: '#4B3621' },
  { name: '민트', hex: '#34D399' },
  { name: '빨강', hex: '#FF4444' },
  { name: '주황', hex: '#FF8844' },
  { name: '노랑', hex: '#FFCC00' },
  { name: '초록', hex: '#44BB44' },
  { name: '파랑', hex: '#4488FF' },
  { name: '분홍', hex: '#FF88AA' },
];

function buildSystemPrompt(categories: any[]): string {
  const categoryList = categories.map(c =>
    `- id: "${c.id}", name: "${c.name}", type: "${c.type}", icon: "${c.icon}"`
  ).join('\n');

  const colorList = COLOR_PRESETS.map(c =>
    `- name: "${c.name}", hex: "${c.hex}"`
  ).join('\n');

  return `너는 옷 등록 도우미 AI다. 사용자가 자연어로 옷을 설명하면 카테고리와 색상을 파싱하여 구조화된 JSON으로 응답해.

## 유효 카테고리 목록 (반드시 이 중에서만 매칭)
${categoryList}

## 유효 색상 프리셋 (우선 매칭, 없으면 가장 가까운 프리셋 제안)
${colorList}

## 응답 규칙
1. 사용자 입력에서 옷 아이템(카테고리 + 색상)을 추출
2. 복수 아이템 동시 파싱 가능
3. 카테고리를 특정할 수 없으면 needsClarification: true + suggestions에 후보 카테고리 제시
4. 색상을 특정할 수 없으면 needsClarification: true로 되물어봐
5. 카테고리 목록에 없는 옷이면 가장 유사한 카테고리를 suggestions로 제안
6. 옷 등록과 무관한 입력이면 부드럽게 옷 등록 안내로 유도
7. message는 항상 친근한 한국어로

## 응답 JSON 형식 (반드시 이 형식으로만 응답)
{
  "message": "사용자에게 보여줄 친근한 메시지",
  "items": [
    { "categoryId": "uuid", "categoryName": "카테고리명", "categoryIcon": "이모지", "color": "#hex", "colorName": "색상명" }
  ],
  "needsClarification": false,
  "suggestions": []
}

- items: 파싱 성공한 아이템 배열 (없으면 빈 배열)
- needsClarification: 되물어야 하면 true
- suggestions: 되물을 때 선택지 배열 (문자열). 예: ["🧥 코트", "👕 니트", "🧶 가디건"]`;
}

function toGeminiContents(systemPrompt: string, messages: any[]) {
  const contents = [];

  // 첫 번째 user 메시지에 system prompt를 합침
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const role = msg.role === 'assistant' ? 'model' : 'user';

    let text = msg.content;
    if (i === 0 && role === 'user') {
      text = `${systemPrompt}\n\n---\n사용자 입력: ${text}`;
    }

    contents.push({ role, parts: [{ text }] });
  }

  return contents;
}

async function callGemini(systemPrompt: string, messages: any[]): Promise<any> {
  const contents = toGeminiContents(systemPrompt, messages);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
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
    // 인증
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('인증 필요');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('인증 실패');

    // 요청 바디 파싱
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('messages 배열이 필요합니다');
    }

    // 카테고리 목록 조회
    const { data: categories, error: catError } = await supabase
      .from('clothing_categories')
      .select('id, name, type, icon')
      .order('sort_order');

    if (catError) throw catError;

    // Gemini 호출
    const systemPrompt = buildSystemPrompt(categories ?? []);
    const result = await callGemini(systemPrompt, messages);

    return new Response(JSON.stringify(result), {
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
