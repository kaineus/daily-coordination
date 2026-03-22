import { createStore } from './create-store.js';

export const authStore = createStore(
  { user: null, session: null, loading: true, error: null },
  (set) => ({
    setSession: (session) =>
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        error: null,
      }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
    clear: () => set({ user: null, session: null, loading: false, error: null }),
  })
);
