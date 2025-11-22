import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialState = {
  inputHtml: '',
  blocks: [],
};

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export const useBlogEditorStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      setInputHtml: (value) => set({ inputHtml: value || '' }),
      setBlocks: (valueOrUpdater) => {
        if (typeof valueOrUpdater === 'function') {
          const currentBlocks = get().blocks;
          const newBlocks = valueOrUpdater(ensureArray(currentBlocks));
          set({ blocks: ensureArray(newBlocks) });
        } else {
          set({ blocks: ensureArray(valueOrUpdater) });
        }
      },
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'blog-editor-store',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.blocks = ensureArray(state.blocks);
          state.inputHtml = state.inputHtml || '';
        }
      },
    }
  )
);

