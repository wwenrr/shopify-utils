import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { parseHtmlToBlocks, insertBlockAtPosition, deleteBlockById, serializeBlocksToHtml, updateBlockHtml, groupH2Blocks, ungroupH2Blocks, isH2Grouped, closeAllParentsAndSplit } from '../utils';
import { useBlogEditorStore } from '../stores/blogEditorStore';

export function useHtmlBlockEditor() {
  const { inputHtml, blocks, setInputHtml, setBlocks } = useBlogEditorStore();
  const [insertModal, setInsertModal] = useState({ open: false, targetId: null, insertType: 'inside' });
  const [editModal, setEditModal] = useState({ open: false, targetId: null, initialHtml: '', blockTag: null, innerHtml: '', originalOuterHtml: '' });

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

  const handleOpenEditModal = useCallback((targetId, currentHtml, blockTag, innerHtml) => {
    setEditModal({ open: true, targetId, initialHtml: currentHtml, blockTag, innerHtml, originalOuterHtml: currentHtml });
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModal({ open: false, targetId: null, initialHtml: '', blockTag: null, innerHtml: '', originalOuterHtml: '' });
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

    let finalHtml = newHtml.trim();

    if (editModal.blockTag === 'section' && editModal.originalOuterHtml) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(editModal.originalOuterHtml, 'text/html');
        const originalElement = doc.body.firstElementChild;
        
        if (originalElement && originalElement.tagName.toLowerCase() === 'section') {
          const attributes = Array.from(originalElement.attributes)
            .map(attr => `${attr.name}="${attr.value}"`)
            .join(' ');
          const attrsStr = attributes ? ` ${attributes}` : '';
          finalHtml = `<section${attrsStr}>${newHtml.trim()}</section>`;
        }
      } catch (error) {
        console.error('Error wrapping section:', error);
      }
    }

    setBlocks((prevBlocks) => {
      const safePrevBlocks = Array.isArray(prevBlocks) ? prevBlocks : [];
      return updateBlockHtml(safePrevBlocks, editModal.targetId, finalHtml);
    });

    handleCloseEditModal();
    toast.success('Đã cập nhật block thành công', { position: 'top-right', autoClose: 2000 });
  }, [editModal.targetId, editModal.blockTag, editModal.originalOuterHtml, setBlocks, handleCloseEditModal]);

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

  const isGrouped = useMemo(() => isH2Grouped(safeBlocks), [safeBlocks]);

  const handleGroupH2 = useCallback(() => {
    if (safeBlocks.length === 0) {
      toast.warning('Chưa có block nào để nhóm', { position: 'top-right', autoClose: 2000 });
      return;
    }

    if (isGrouped) {
      const ungroupedBlocks = ungroupH2Blocks(safeBlocks);
      setBlocks(ungroupedBlocks);
      toast.success('Đã bỏ nhóm h2', { position: 'top-right', autoClose: 2000 });
    } else {
      const h2Count = safeBlocks.filter(block => {
        function countH2(b) {
          if (b.tag === 'h2') return 1;
          if (b.children && b.children.length > 0) {
            return b.children.reduce((sum, child) => sum + countH2(child), 0);
          }
          return 0;
        }
        return countH2(block);
      }).reduce((sum, count) => sum + count, 0);

      if (h2Count === 0) {
        toast.warning('Không tìm thấy thẻ h2 nào', { position: 'top-right', autoClose: 2000 });
        return;
      }

      const groupedBlocks = groupH2Blocks(safeBlocks);
      setBlocks(groupedBlocks);
      
      const groupedCount = groupedBlocks.filter(block => block.tag === 'section' && block.outerHtml?.includes('h2-group')).length;
      toast.success(`Đã nhóm ${groupedCount} nhóm h2`, { position: 'top-right', autoClose: 2000 });
    }
  }, [safeBlocks, isGrouped, setBlocks]);

  const handleSplitBlock = useCallback((blockId) => {
    if (!blockId) {
      return;
    }

    setBlocks((prevBlocks) => {
      const safePrevBlocks = Array.isArray(prevBlocks) ? prevBlocks : [];
      const splitBlocks = closeAllParentsAndSplit(safePrevBlocks, blockId);
      return splitBlocks;
    });

    toast.success('Đã cắt và đóng tất cả thẻ cha', { position: 'top-right', autoClose: 2000 });
  }, [setBlocks]);

  return {
    blocks: safeBlocks,
    inputHtml: inputHtml || '',
    insertModal,
    editModal,
    isH2Grouped: isGrouped,
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
    handleGroupH2,
    handleSplitBlock,
    handleClear,
  };
}

