import { authStore } from '../store/auth.store.js';

/**
 * Supabase Auth 이벤트를 구독하여 authStore에 반영
 */
export function initAuth(supabase) {
  // 현재 세션 확인
  supabase.auth.getSession().then(({ data: { session } }) => {
    authStore.actions.setSession(session);
  });

  // 세션 변경 감지
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    authStore.actions.setSession(session);
  });

  return subscription;
}

export async function signInWithGoogle(supabase) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  if (error) console.error('[DC] Google 로그인 실패:', error.message);
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

export async function signOut(supabase) {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('[DC] 로그아웃 실패:', error.message);
}
