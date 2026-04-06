const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function getWeather() {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/weather`, {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
}

export async function getRecommendation(supabase) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { data: null, error: { message: '인증 필요' } };

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/recommend`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
}

export async function getGeneralRecommendation() {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/recommend-general`, {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
}

export async function getGeneralRecommendationWithRefresh() {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/recommend-general?refresh=true`, {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
}

export async function getRecommendationWithRefresh(supabase) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { data: null, error: { message: '인증 필요' } };

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/recommend?refresh=true`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
}
