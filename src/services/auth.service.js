/**
 * Supabase Auth 이벤트를 구독하여 콜백으로 세션 변경 전달
 */
export function initAuth(supabase, onSessionChange) {
  // 현재 세션 확인
  supabase.auth.getSession().then(({ data: { session } }) => {
    onSessionChange(session);
  });

  // 세션 변경 감지
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    onSessionChange(session);
  });

  return subscription;
}

export async function signInWithGoogle(supabase) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  return { error };
}

export async function signUpWithEmail(supabase, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + window.location.pathname,
    },
  });
  return { data, error };
}

export async function signInWithEmail(supabase, email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function fetchUserRole(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'user';
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (error) {
    console.error('[DC] role fetch 실패:', error.message);
    return 'user';
  }
  return data.role;
}

export async function signOut(supabase) {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('[DC] 로그아웃 실패:', error.message);
}
