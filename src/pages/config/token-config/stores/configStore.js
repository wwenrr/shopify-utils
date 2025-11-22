import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialState = {
  githubToken: '',
  isValidated: false,
  gists: [],
};

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export const useConfigStore = create(
  persist(
    (set) => ({
      ...initialState,
      setGithubToken: (value) => set({ githubToken: value || '' }),
      setIsValidated: (value) => set({ isValidated: value }),
      setGists: (value) => set({ gists: ensureArray(value) }),
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'token-config-store',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.githubToken = state.githubToken || '';
          state.isValidated = state.isValidated || false;
          state.gists = ensureArray(state.gists);
        }
      },
    }
  )
);

