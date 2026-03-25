import { createStore } from './create-store.js';

export const chatStore = createStore(
  {
    messages: [],   // [{ role: 'user'|'assistant', content, items?, suggestions?, needsClarification? }]
    loading: false,
  },
  (set, get) => ({
    addUserMessage: (content) => set({
      messages: [...get().messages, { role: 'user', content }],
    }),
    addAssistantMessage: ({ message, items, suggestions, needsClarification }) => set({
      messages: [...get().messages, {
        role: 'assistant',
        content: message,
        items: items ?? [],
        suggestions: suggestions ?? [],
        needsClarification: needsClarification ?? false,
      }],
    }),
    setLoading: (loading) => set({ loading }),
    reset: () => set({ messages: [], loading: false }),
  })
);
