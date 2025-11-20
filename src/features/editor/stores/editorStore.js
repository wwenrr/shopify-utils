import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialState = {
  title: '',
  subtitle: '',
  base64Content: null,
  htmlMeta: null,
};

export const useEditorStore = create(
  persist(
    (set) => ({
      ...initialState,
      hydrated: false,
      setTitle: (value) => set({ title: value }),
      setSubtitle: (value) => set({ subtitle: value }),
      setBase64Content: (value) => set({ base64Content: value }),
      setHtmlMeta: (value) => set({ htmlMeta: value }),
      reset: () => set({ ...initialState }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'shopify-editor-base64',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          state?.setHydrated?.();
        }
      },
    }
  )
);

