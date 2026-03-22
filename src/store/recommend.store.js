import { createStore } from './create-store.js';

export const recommendStore = createStore(
  {
    weather: null,
    hourly: [],
    recommendation: null,
    loading: false,
    error: null,
  },
  (set) => ({
    setWeather: (weather) => set({ weather, hourly: weather?.hourly ?? [] }),
    setRecommendation: (recommendation) => set({ recommendation }),
    setData: (weather, recommendation) =>
      set({ weather, hourly: weather?.hourly ?? [], recommendation, error: null }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clear: () => set({ weather: null, hourly: [], recommendation: null, loading: false, error: null }),
  })
);
