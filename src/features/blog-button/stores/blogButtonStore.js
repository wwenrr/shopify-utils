import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

const initialState = {
  savedConfigs: [],
};

export const useBlogButtonStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      saveConfig: (name, formValues, variantSettings) => {
        const configs = ensureArray(get().savedConfigs);
        const newConfig = {
          id: Date.now().toString(),
          name,
          formValues,
          variantSettings,
          createdAt: new Date().toISOString(),
        };
        const updatedConfigs = [...configs, newConfig];
        set({ savedConfigs: updatedConfigs });
        return newConfig.id;
      },
      loadConfig: (id) => {
        const configs = ensureArray(get().savedConfigs);
        return configs.find((config) => config.id === id) || null;
      },
      deleteConfig: (id) => {
        const configs = ensureArray(get().savedConfigs);
        const updatedConfigs = configs.filter((config) => config.id !== id);
        set({ savedConfigs: updatedConfigs });
      },
      getAllConfigs: () => {
        return ensureArray(get().savedConfigs);
      },
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'blog-button-store',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.savedConfigs = ensureArray(state.savedConfigs);
        }
      },
    }
  )
);

