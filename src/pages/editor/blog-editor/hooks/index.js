import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { parseHtmlToBlocks, insertBlockAtPosition, deleteBlockById, serializeBlocksToHtml, updateBlockHtml, buildBlockMetaMap, replaceBlocksRange } from '../utils';
import { useBlogEditorStore } from '../stores/blogEditorStore';

export function useHtmlBlockEditor() {
  const { inputHtml, blocks, setInputHtml, setBlocks } = useBlogEditorStore();
  const [insertModal, setInsertModal] = useState({ open: false, targetId: null, insertType: 'inside' });
  const [editModal, setEditModal] = useState({ open: false, targetId: null, initialHtml: '', blockTag: null, innerHtml: '', originalOuterHtml: '' });
  const [selectedBlockIds, setSelectedBlockIds] = useState([]);
  const [groupedBlockSets, setGroupedBlockSets] = useState([]);
  const [groupEditModal, setGroupEditModal] = useState({
    open: false,
    groupIndex: null,
    parentId: null,
    startIndex: 0,
    deleteCount: 0,
    initialHtml: '',
  });

  const safeBlocks = Array.isArray(blocks) ? blocks : [];
  const blockMetaMap = useMemo(() => buildBlockMetaMap(safeBlocks), [safeBlocks]);

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
    setSelectedBlockIds([]);
    setGroupedBlockSets([]);
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

  const handleToggleBlockSelection = useCallback((blockId) => {
    setSelectedBlockIds((prev) => {
      if (prev.includes(blockId)) {
        return prev.filter((id) => id !== blockId);
      }
      return [...prev, blockId];
    });
  }, []);

  const handleGroupSelectedBlocks = useCallback(() => {
    if (selectedBlockIds.length < 2) {
      toast.warning('Chọn ít nhất 2 block để nhóm', { position: 'top-right', autoClose: 2000 });
      return;
    }

    const metas = selectedBlockIds
      .map((id) => ({ id, meta: blockMetaMap[id] }))
      .filter((item) => item.meta);

    if (metas.length !== selectedBlockIds.length) {
      toast.error('Một số block không tồn tại, hãy thử lại', { position: 'top-right', autoClose: 2000 });
      return;
    }

    const firstParentId = metas[0].meta.parentId || null;
    const hasDifferentParent = metas.some((item) => (item.meta.parentId || null) !== firstParentId);
    if (hasDifferentParent) {
      toast.error('Chỉ có thể nhóm các block cùng cấp', { position: 'top-right', autoClose: 2000 });
      return;
    }

    const ordered = [...metas].sort((a, b) => a.meta.index - b.meta.index);

    const isContiguous = ordered.every((item, idx) => {
      if (idx === 0) {
        return true;
      }
      return item.meta.index === ordered[idx - 1].meta.index + 1;
    });

    if (!isContiguous) {
      toast.error('Không thể nhóm các block không liền kề', { position: 'top-right', autoClose: 2000 });
      return;
    }

    const groupedIds = ordered.map((item) => item.id);

    setGroupedBlockSets((prev) => {
      const filteredPrev = prev
        .map((group) => group.filter((id) => !groupedIds.includes(id)))
        .filter((group) => group.length > 1);
      return [...filteredPrev, groupedIds];
    });
    setSelectedBlockIds([]);
    toast.success(`Đã nhóm ${groupedIds.length} block`, { position: 'top-right', autoClose: 2000 });
  }, [selectedBlockIds, blockMetaMap]);

  const handleClearGroupedBlocks = useCallback(() => {
    if (groupedBlockSets.length === 0) {
      toast.info('Chưa có nhóm nào để xóa', { position: 'top-right', autoClose: 2000 });
      return;
    }
    setGroupedBlockSets([]);
    toast.success('Đã xóa tất cả nhóm', { position: 'top-right', autoClose: 2000 });
  }, [groupedBlockSets]);

  useEffect(() => {
    const validIds = new Set(Object.keys(blockMetaMap));
    setSelectedBlockIds((prev) => prev.filter((id) => validIds.has(id)));
    setGroupedBlockSets((prev) =>
      prev
        .map((group) => group.filter((id) => validIds.has(id)))
        .filter((group) => group.length > 1)
    );
  }, [blockMetaMap]);

  const groupedBlockMeta = useMemo(() => {
    return groupedBlockSets.reduce((acc, group, groupIndex) => {
      group.forEach((id, index) => {
        acc[id] = {
          groupIndex,
          position: index === 0 ? 'start' : index === group.length - 1 ? 'end' : 'middle',
          memberIds: group,
          groupSize: group.length,
        };
      });
      return acc;
    }, {});
  }, [groupedBlockSets]);

  const handleCopyGroupHtml = useCallback(async (groupIndex) => {
    const targetGroup = groupedBlockSets[groupIndex];
    if (!targetGroup || targetGroup.length === 0) {
      toast.info('Nhóm này hiện trống', { position: 'top-right', autoClose: 2000 });
      return;
    }

    const htmlChunks = targetGroup
      .map((id) => blockMetaMap[id]?.block?.outerHtml || '')
      .filter((chunk) => chunk.trim().length > 0);

    if (htmlChunks.length === 0) {
      toast.warning('Không có HTML hợp lệ trong nhóm', { position: 'top-right', autoClose: 2000 });
      return;
    }

    try {
      await navigator.clipboard.writeText(htmlChunks.join('\n'));
      toast.success('Đã copy HTML của nhóm', { position: 'top-right', autoClose: 2000 });
    } catch (error) {
      console.error('Copy group html failed:', error);
      toast.error('Copy thất bại, hãy thử lại', { position: 'top-right', autoClose: 2000 });
    }
  }, [groupedBlockSets, blockMetaMap]);

  const handleUngroupGroup = useCallback((groupIndex) => {
    setGroupedBlockSets((prev) => prev.filter((_, idx) => idx !== groupIndex));
  }, []);

  const handleOpenGroupEditModal = useCallback((groupIndex) => {
    const group = groupedBlockSets[groupIndex];
    if (!group || group.length === 0) {
      toast.info('Nhóm này đang trống', { position: 'top-right', autoClose: 2000 });
      return;
    }

    const metas = group.map((id) => blockMetaMap[id]).filter(Boolean);
    if (metas.length !== group.length) {
      toast.error('Không thể tìm thấy block trong nhóm', { position: 'top-right', autoClose: 2000 });
      return;
    }

    const parentId = metas[0].parentId || null;
    const startIndex = Math.min(...metas.map((meta) => meta.index));
    const deleteCount = group.length;
    const initialHtml = group
      .map((id) => blockMetaMap[id]?.block?.outerHtml || '')
      .filter((html) => html.trim().length > 0)
      .join('\n');

    if (!initialHtml) {
      toast.warning('Không có HTML hợp lệ để chỉnh sửa', { position: 'top-right', autoClose: 2000 });
      return;
    }

    setGroupEditModal({
      open: true,
      groupIndex,
      parentId,
      startIndex,
      deleteCount,
      initialHtml,
    });
  }, [groupedBlockSets, blockMetaMap]);

  const handleCloseGroupEditModal = useCallback(() => {
    setGroupEditModal({
      open: false,
      groupIndex: null,
      parentId: null,
      startIndex: 0,
      deleteCount: 0,
      initialHtml: '',
    });
  }, []);

  const handleUpdateGroupHtml = useCallback((newHtml) => {
    if (!groupEditModal.open || !groupEditModal.deleteCount) {
      return;
    }

    const parsedBlocks = parseHtmlToBlocks(newHtml);
    if (parsedBlocks.length === 0) {
      toast.error('HTML nhóm không hợp lệ', { position: 'top-right', autoClose: 2000 });
      return;
    }

    setBlocks((prevBlocks) => {
      const safePrevBlocks = Array.isArray(prevBlocks) ? prevBlocks : [];
      return replaceBlocksRange(
        safePrevBlocks,
        groupEditModal.parentId,
        groupEditModal.startIndex,
        groupEditModal.deleteCount,
        parsedBlocks
      );
    });

    setGroupedBlockSets((prev) => prev.filter((_, idx) => idx !== groupEditModal.groupIndex));
    setSelectedBlockIds([]);
    handleCloseGroupEditModal();
    toast.success('Đã cập nhật HTML nhóm', { position: 'top-right', autoClose: 2000 });
  }, [groupEditModal, setBlocks, handleCloseGroupEditModal]);

  return {
    blocks: safeBlocks,
    inputHtml: inputHtml || '',
    insertModal,
    editModal,
    groupEditModal,
    selectedBlockIds,
    groupedBlockMeta,
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
    handleToggleBlockSelection,
    handleGroupSelectedBlocks,
    handleClearGroupedBlocks,
    handleCopyGroupHtml,
    handleUngroupGroup,
    handleOpenGroupEditModal,
    handleCloseGroupEditModal,
    handleUpdateGroupHtml,
  };
}

