import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const KMA_API_KEY = Deno.env.get('KMA_API_KEY') ?? '';
const KMA_BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getBaseDateTime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  const baseTimes = ['2300', '2000', '1700', '1400', '1100', '0800', '0500', '0200'];
  const hour = kst.getUTCHours();
  const minute = kst.getUTCMinutes();
  const currentHHMM = String(hour).padStart(2, '0') + String(minute).padStart(2, '0');

  let baseDate = kst.toISOString().slice(0, 10).replace(/-/g, '');
  let baseTime = '0200';

  for (const bt of baseTimes) {
    const btPlus10 = String(parseInt(bt) + 10).padStart(4, '0');
    if (currentHHMM >= btPlus10) {
      baseTime = bt;
      break;
    }
  }

  if (baseTime === '2300' && currentHHMM < '2310') {
    const yesterday = new Date(kst.getTime() - 24 * 60 * 60 * 1000);
    baseDate = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
  }

  return { baseDate, baseTime };
}

function mapCondition(pty: string, sky?: string): { condition: string; type: string } {
  switch (pty) {
    case '1': case '4': return { condition: '비', type: 'rainy' };
    case '2': case '6': return { condition: '비/눈', type: 'rainy' };
    case '3': case '7': return { condition: '눈', type: 'snowy' };
    default:
      if (sky === '1') return { condition: '맑음', type: 'sunny' };
      if (sky === '3') return { condition: '구름많음', type: 'cloudy' };
      if (sky === '4') return { condition: '흐림', type: 'cloudy' };
      return { condition: '맑음', type: 'sunny' };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { baseDate, baseTime } = getBaseDateTime();

    const params = new URLSearchParams({
      serviceKey: decodeURIComponent(KMA_API_KEY),
      pageNo: '1',
      numOfRows: '300',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: '60',
      ny: '127',
    });

    const url = `${KMA_BASE_URL}?${params.toString()}`;
    const response = await fetch(url);
    const json = await response.json();

    const items = json?.response?.body?.items?.item;
    if (!items || !Array.isArray(items)) {
      throw new Error('기상청 API 응답 형식 오류');
    }

    let temp = 0;
    let tempMin = 99;
    let tempMax = -99;
    let pop = '0';
    let pty = '0';
    let sky = '1';
    let wsd = '0';

    for (const item of items) {
      switch (item.category) {
        case 'TMP': temp = parseInt(item.fcstValue); break;
        case 'TMN': tempMin = Math.min(tempMin, parseInt(item.fcstValue)); break;
        case 'TMX': tempMax = Math.max(tempMax, parseInt(item.fcstValue)); break;
        case 'POP': pop = item.fcstValue; break;
        case 'PTY': if (item.fcstValue !== '0') pty = item.fcstValue; break;
        case 'SKY': sky = item.fcstValue; break;
        case 'WSD': wsd = item.fcstValue; break;
      }
    }

    if (tempMin === 99) tempMin = temp - 3;
    if (tempMax === -99) tempMax = temp + 3;

    const { condition, type } = mapCondition(pty, sky);

    const weatherData = {
      location: '서울',
      temp,
      tempMin,
      tempMax,
      condition,
      precipitation: parseInt(pop),
      windSpeed: parseFloat(wsd),
      type,
    };

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
