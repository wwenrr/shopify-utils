import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const dragSelectionRef = useRef({
    active: false,
    mode: 'select',
    processed: new Set(),
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

  const applySelectionChange = useCallback((blockId, mode) => {
    setSelectedBlockIds((prev) => {
      const exists = prev.includes(blockId);
      if (mode === 'select') {
        if (exists) {
          return prev;
        }
        return [...prev, blockId];
      }
      if (!exists) {
        return prev;
      }
      return prev.filter((id) => id !== blockId);
    });
  }, []);

  const handleToggleBlockSelection = useCallback((blockId) => {
    setSelectedBlockIds((prev) => {
      if (prev.includes(blockId)) {
        return prev.filter((id) => id !== blockId);
      }
      return [...prev, blockId];
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedBlockIds([]);
  }, []);

  const handleSelectionDragStart = useCallback((blockId) => {
    const alreadySelected = selectedBlockIds.includes(blockId);
    const mode = alreadySelected ? 'deselect' : 'select';
    dragSelectionRef.current = {
      active: true,
      mode,
      processed: new Set([blockId]),
    };
    setIsDragSelecting(true);
    applySelectionChange(blockId, mode);
  }, [selectedBlockIds, applySelectionChange]);

  const handleSelectionDragEnter = useCallback((blockId) => {
    if (!dragSelectionRef.current.active) {
      return;
    }
    if (dragSelectionRef.current.processed.has(blockId)) {
      return;
    }
    dragSelectionRef.current.processed.add(blockId);
    applySelectionChange(blockId, dragSelectionRef.current.mode);
  }, [applySelectionChange]);

  const handleSelectionDragEnd = useCallback(() => {
    if (!dragSelectionRef.current.active) {
      return;
    }
    dragSelectionRef.current = {
      active: false,
      mode: 'select',
      processed: new Set(),
    };
    setIsDragSelecting(false);
  }, []);

  const buildSpecialH2Groups = useCallback(() => {
    if (!Array.isArray(safeBlocks) || safeBlocks.length === 0) {
      return [];
    }
    const groups = [];
    for (let i = 0; i < safeBlocks.length; i += 1) {
      const block = safeBlocks[i];
      if (block && block.tag === 'h2') {
        const memberIds = [block.id];
        let j = i + 1;
        while (j < safeBlocks.length && safeBlocks[j] && safeBlocks[j].tag !== 'h2') {
          memberIds.push(safeBlocks[j].id);
          j += 1;
        }
        groups.push(memberIds);
        i = j - 1;
      }
    }
    return groups;
  }, [safeBlocks]);

  const applySpecialH2Groups = useCallback((groups) => {
    setGroupedBlockSets((prev) => {
      const manualGroups = prev.filter((group) => group.type !== 'special');
      const specialGroups = groups
        .filter((ids) => Array.isArray(ids) && ids.length > 0)
        .map((ids) => ({
          memberIds: ids,
          type: 'special',
          immutable: true,
        }));
      if (specialGroups.length === 0 && manualGroups.length === prev.length) {
        return manualGroups;
      }
      return [...manualGroups, ...specialGroups];
    });
  }, []);

  const handleAutoGroupH2 = useCallback(() => {
    const groups = buildSpecialH2Groups();
    if (groups.length === 0) {
      setGroupedBlockSets((prev) => prev.filter((group) => group.type !== 'special'));
      toast.info('Không tìm thấy H2 để nhóm', { position: 'top-right', autoClose: 2000 });
      return;
    }
    applySpecialH2Groups(groups);
    toast.success(`Đã nhóm ${groups.length} đoạn H2`, { position: 'top-right', autoClose: 2000 });
  }, [buildSpecialH2Groups, applySpecialH2Groups]);

  const handleClearSpecialH2Groups = useCallback(() => {
    const specialGroups = groupedBlockSets.filter((group) => group.type === 'special');
    if (specialGroups.length === 0) {
      toast.info('Không có nhóm H2 tự động để xóa', { position: 'top-right', autoClose: 2000 });
      return;
    }
    setGroupedBlockSets((prev) => prev.filter((group) => group.type !== 'special'));
    toast.success('Đã xóa tất cả nhóm H2 tự động', { position: 'top-right', autoClose: 2000 });
  }, [groupedBlockSets]);

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
        .map((group) => ({
          ...group,
          memberIds: group.memberIds.filter((id) => !groupedIds.includes(id)),
        }))
        .filter((group) => group.memberIds.length > 1 || group.type === 'special');

      return [
        ...filteredPrev,
        {
          memberIds: groupedIds,
          type: 'manual',
          immutable: false,
        },
      ];
    });
    setSelectedBlockIds([]);
    toast.success(`Đã nhóm ${groupedIds.length} block`, { position: 'top-right', autoClose: 2000 });
  }, [selectedBlockIds, blockMetaMap]);

  const handleClearGroupedBlocks = useCallback(() => {
    const manualGroups = groupedBlockSets.filter((group) => group.type !== 'special');
    if (manualGroups.length === 0) {
      toast.info('Không có nhóm tùy chỉnh để xóa', { position: 'top-right', autoClose: 2000 });
      return;
    }
    setGroupedBlockSets((prev) => prev.filter((group) => group.type === 'special'));
    toast.success('Đã xóa các nhóm tùy chỉnh', { position: 'top-right', autoClose: 2000 });
  }, [groupedBlockSets]);

  useEffect(() => {
    const validIds = new Set(Object.keys(blockMetaMap));
    setSelectedBlockIds((prev) => prev.filter((id) => validIds.has(id)));
    setGroupedBlockSets((prev) =>
      prev
        .map((group) => ({
          ...group,
          memberIds: group.memberIds.filter((id) => validIds.has(id)),
        }))
        .filter((group) => (group.type === 'special' ? group.memberIds.length > 0 : group.memberIds.length > 1))
    );
  }, [blockMetaMap]);

  useEffect(() => {
    const groups = buildSpecialH2Groups();
    applySpecialH2Groups(groups);
  }, [safeBlocks, buildSpecialH2Groups, applySpecialH2Groups]);

  const groupedBlockMeta = useMemo(() => {
    return groupedBlockSets.reduce((acc, group, groupIndex) => {
      group.memberIds.forEach((id, index) => {
        acc[id] = {
          groupIndex,
          position: index === 0 ? 'start' : index === group.memberIds.length - 1 ? 'end' : 'middle',
          memberIds: group.memberIds,
          groupSize: group.memberIds.length,
          type: group.type,
          immutable: group.immutable,
        };
      });
      return acc;
    }, {});
  }, [groupedBlockSets]);

  const handleCopyGroupHtml = useCallback(async (groupIndex) => {
    const targetGroup = groupedBlockSets[groupIndex];
    if (!targetGroup || targetGroup.memberIds.length === 0) {
      toast.info('Nhóm này hiện trống', { position: 'top-right', autoClose: 2000 });
      return;
    }

    const htmlChunks = targetGroup.memberIds
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
    const targetGroup = groupedBlockSets[groupIndex];
    if (!targetGroup) {
      return;
    }
    if (targetGroup.immutable) {
      toast.info('Nhóm này không thể bỏ', { position: 'top-right', autoClose: 2000 });
      return;
    }
    setGroupedBlockSets((prev) => prev.filter((_, idx) => idx !== groupIndex));
  }, [groupedBlockSets]);

  const handleOpenGroupEditModal = useCallback((groupIndex) => {
    const group = groupedBlockSets[groupIndex];
    if (!group || group.memberIds.length === 0) {
      toast.info('Nhóm này đang trống', { position: 'top-right', autoClose: 2000 });
      return;
    }

    if (group.immutable) {
      toast.info('Nhóm này không thể chỉnh sửa', { position: 'top-right', autoClose: 2000 });
      return;
    }

    const metas = group.memberIds.map((id) => blockMetaMap[id]).filter(Boolean);
    if (metas.length !== group.memberIds.length) {
      toast.error('Không thể tìm thấy block trong nhóm', { position: 'top-right', autoClose: 2000 });
      return;
    }

    const parentId = metas[0].parentId || null;
    const startIndex = Math.min(...metas.map((meta) => meta.index));
    const deleteCount = group.memberIds.length;
    const initialHtml = group.memberIds
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
    handleSelectionDragStart,
    handleSelectionDragEnter,
    handleSelectionDragEnd,
    isDragSelecting,
    handleClearSelection,
    handleAutoGroupH2,
    handleClearSpecialH2Groups,
  };
}

