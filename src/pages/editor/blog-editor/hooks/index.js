import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { parseHtmlToBlocks, insertBlockAtPosition, deleteBlockById, serializeBlocksToHtml, updateBlockHtml } from '../utils';
import { useBlogEditorStore } from '../stores/blogEditorStore';

export function useHtmlBlockEditor() {
  const { inputHtml, blocks, setInputHtml, setBlocks } = useBlogEditorStore();
  const [insertModal, setInsertModal] = useState({ open: false, targetId: null, insertType: 'inside' });
  const [editModal, setEditModal] = useState({ open: false, targetId: null, initialHtml: '' });

  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  useEffect(() => {
    if (inputHtml && safeBlocks.length === 0) {
      const parsed = parseHtmlToBlocks(inputHtml);
      if (parsed.length > 0) {
        setBlocks(parsed);
      }
    }
  }, []);

  const handleInputChange = useCallback((event) => {
    const value = event.target.value;
    setInputHtml(value);
  }, [setInputHtml]);

  const handleParseHtml = useCallback(() => {
    if (!inputHtml.trim()) {
      return;
    }
    const parsed = parseHtmlToBlocks(inputHtml);
    setBlocks(parsed);
  }, [inputHtml, setBlocks]);

  const handlePaste = useCallback((event) => {
    const pastedText = event.clipboardData.getData('text');
    if (pastedText) {
      setInputHtml(pastedText);
      setTimeout(() => {
        const parsed = parseHtmlToBlocks(pastedText);
        setBlocks(parsed);
      }, 0);
    }
  }, [setInputHtml, setBlocks]);

  const handleOpenInsertModal = useCallback((targetId, insertType = 'inside') => {
    setInsertModal({ open: true, targetId, insertType });
  }, []);

  const handleCloseInsertModal = useCallback(() => {
    setInsertModal({ open: false, targetId: null, insertType: 'inside' });
  }, []);

  const handleOpenEditModal = useCallback((targetId, currentHtml) => {
    setEditModal({ open: true, targetId, initialHtml: currentHtml });
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModal({ open: false, targetId: null, initialHtml: '' });
  }, []);

  const handleInsertBlock = useCallback((newHtml) => {
    if (!newHtml.trim() || !insertModal.targetId) {
      return;
    }

    setBlocks((prevBlocks) => {
      const safePrevBlocks = Array.isArray(prevBlocks) ? prevBlocks : [];
      return insertBlockAtPosition(safePrevBlocks, insertModal.targetId, newHtml, insertModal.insertType);
    });

    handleCloseInsertModal();
  }, [insertModal.targetId, insertModal.insertType, setBlocks, handleCloseInsertModal]);

  const handleDeleteBlock = useCallback((blockId) => {
    setBlocks((prevBlocks) => {
      const safePrevBlocks = Array.isArray(prevBlocks) ? prevBlocks : [];
      return deleteBlockById(safePrevBlocks, blockId);
    });
  }, [setBlocks]);

  const handleCopyBlock = useCallback(async (blockHtml) => {
    try {
      await navigator.clipboard.writeText(blockHtml);
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  }, []);

  const handleClear = useCallback(() => {
    setInputHtml('');
    setBlocks([]);
  }, [setInputHtml, setBlocks]);

  const handleUpdateBlock = useCallback((newHtml) => {
    if (!newHtml.trim() || !editModal.targetId) {
      return;
    }

    setBlocks((prevBlocks) => {
      const safePrevBlocks = Array.isArray(prevBlocks) ? prevBlocks : [];
      return updateBlockHtml(safePrevBlocks, editModal.targetId, newHtml);
    });

    handleCloseEditModal();
    toast.success('Đã cập nhật block thành công', { position: 'top-right', autoClose: 2000 });
  }, [editModal.targetId, setBlocks, handleCloseEditModal]);

  const handleCopyAllBlocks = useCallback(async () => {
    if (safeBlocks.length === 0) {
      toast.warning('Chưa có block nào để copy', { position: 'top-right', autoClose: 2000 });
      return;
    }

    try {
      const allHtml = serializeBlocksToHtml(safeBlocks);
      await navigator.clipboard.writeText(allHtml);
      toast.success(`Đã copy ${safeBlocks.length} block(s) vào clipboard`, {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Copy all blocks failed:', error);
      toast.error('Copy thất bại, hãy thử lại', { position: 'top-right', autoClose: 2000 });
    }
  }, [safeBlocks]);

  return {
    blocks: safeBlocks,
    inputHtml: inputHtml || '',
    insertModal,
    editModal,
    handleInputChange,
    handleParseHtml,
    handlePaste,
    handleOpenInsertModal,
    handleCloseInsertModal,
    handleOpenEditModal,
    handleCloseEditModal,
    handleInsertBlock,
    handleUpdateBlock,
    handleDeleteBlock,
    handleCopyBlock,
    handleCopyAllBlocks,
    handleClear,
  };
}

