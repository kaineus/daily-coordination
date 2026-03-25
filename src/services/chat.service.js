const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function sendChatMessage(supabase, messages) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { data: null, error: { message: '인증 필요' } };

  const res = await fetch(`${SUPABASE_URL}/functions/v1/chat-register`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  const data = await res.json();
  if (!res.ok) return { data: null, error: data };
  return { data, error: null };
}
