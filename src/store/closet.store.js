import { createStore } from './create-store.js';

export const closetStore = createStore(
  {
    categories: [],
    clothes: [],
    loading: false,
    error: null,
    groupBy: 'category', // 'category' | 'color'
  },
  (set, get) => ({
    setCategories: (categories) => set({ categories }),
    setClothes: (clothes) => set({ clothes }),
    addItem: (item) => set({ clothes: [item, ...get().clothes] }),
    removeItem: (id) => set({ clothes: get().clothes.filter((c) => c.id !== id) }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setGroupBy: (groupBy) => set({ groupBy }),
  })
);
