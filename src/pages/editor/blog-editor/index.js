import { useState, useEffect, useRef, useCallback } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useHtmlBlockEditor } from './hooks';
import BlockView from './components/BlockView';
import InsertModal from './components/InsertModal';
import styles from './index.module.css';

function EditorPage() {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const contextMenuRef = useRef(null);
  const blocksContainerRef = useRef(null);
  const blocksCardRef = useRef(null);
  const [blocksCardEl, setBlocksCardEl] = useState(null);
  const [dragOverlay, setDragOverlay] = useState({ active: false, start: 0, end: 0 });
  const [expandedH2Groups, setExpandedH2Groups] = useState(new Set());
  const {
    blocks,
    inputHtml,
    insertModal,
    editModal,
    groupEditModal,
    selectedBlockIds,
    groupedBlockMeta,
    isDragSelecting,
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
    handleClearSelection,
    handleAutoGroupH2,
    handleClearSpecialH2Groups,
  } = useHtmlBlockEditor();

  const getRelativeY = useCallback((clientY) => {
    if (!blocksContainerRef.current) {
      return 0;
    }
    const rect = blocksContainerRef.current.getBoundingClientRect();
    const scrollTop = blocksContainerRef.current.scrollTop || 0;
    const paddingTop = parseFloat(getComputedStyle(blocksContainerRef.current).paddingTop || '0');
    return clientY - rect.top + scrollTop - paddingTop;
  }, []);

  const beginOverlay = useCallback((clientY) => {
    const pos = Math.max(0, getRelativeY(clientY));
    setDragOverlay({ active: true, start: pos, end: pos });
  }, [getRelativeY]);

  const updateOverlay = useCallback((clientY) => {
    setDragOverlay((prev) => {
      if (!prev.active) {
        return prev;
      }
      return { ...prev, end: Math.max(0, getRelativeY(clientY)) };
    });
  }, [getRelativeY]);

  const stopOverlay = useCallback(() => {
    setDragOverlay({ active: false, start: 0, end: 0 });
  }, []);

  const handleToggleH2Group = useCallback((groupIndex) => {
    setExpandedH2Groups((prev) => {
      const next = new Set(prev);
      if (next.has(groupIndex)) {
        next.delete(groupIndex);
      } else {
        next.add(groupIndex);
      }
      return next;
    });
  }, []);

  const getBlockIdFromEvent = useCallback((event) => {
    if (!event || !blocksContainerRef.current) {
      return null;
    }

    const targetElement = event.target instanceof Element ? event.target : document.elementFromPoint(event.clientX, event.clientY);
    const direct = targetElement ? targetElement.closest('[data-block-root="true"]') : null;
    if (direct) {
      return direct.getAttribute('data-block-id');
    }

    const blockElements = blocksContainerRef.current.querySelectorAll('[data-block-root="true"]');
    if (!blockElements || blockElements.length === 0) {
      return null;
    }

    const { clientY } = event;
    let closestId = null;

    for (const element of blockElements) {
      const rect = element.getBoundingClientRect();
      const blockId = element.getAttribute('data-block-id');
      if (clientY <= rect.top) {
        return blockId;
      }
      if (clientY >= rect.top && clientY <= rect.bottom) {
        return blockId;
      }
      closestId = blockId;
    }

    return closestId;
  }, []);

  const handleBlocksMouseDown = useCallback((event) => {
    if (event.button !== 0) {
      return;
    }
    if (
      event.target.closest('button') ||
      event.target.closest('input') ||
      event.target.closest('textarea')
    ) {
      return;
    }
    const blockId = getBlockIdFromEvent(event);
    if (!blockId) {
      return;
    }
    event.preventDefault();
    handleSelectionDragStart(blockId);
    beginOverlay(event.clientY);
  }, [getBlockIdFromEvent, handleSelectionDragStart, beginOverlay]);

  useEffect(() => {
    const handleMouseUp = () => {
      handleSelectionDragEnd();
      stopOverlay();
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleSelectionDragEnd, stopOverlay]);

  useEffect(() => {
    if (!blocksCardEl) {
      return undefined;
    }

    const handleMouseDown = (event) => {
      handleBlocksMouseDown(event);
    };

    blocksCardEl.addEventListener('mousedown', handleMouseDown, true);
    return () => {
      blocksCardEl.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [blocksCardEl, handleBlocksMouseDown]);

  useEffect(() => {
    if (!dragOverlay.active) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      updateOverlay(event.clientY);
      const blockId = getBlockIdFromEvent(event);
      if (blockId) {
        handleSelectionDragEnter(blockId);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dragOverlay.active, updateOverlay, getBlockIdFromEvent, handleSelectionDragEnter]);

  const renderBlockList = (blockList) => {
    if (!Array.isArray(blockList) || blockList.length === 0) {
      return null;
    }

    const renderSingleBlock = (block) => (
      <BlockView
        key={block.id}
        block={block}
        onInsert={handleOpenInsertModal}
        onInsertAfter={handleOpenInsertModal}
        onDelete={handleDeleteBlock}
        onCopy={handleCopyBlock}
        onEdit={handleOpenEditModal}
        selectedBlockIds={selectedBlockIds}
        onToggleSelect={handleToggleBlockSelection}
        childrenContent={renderBlockList(block.children)}
      />
    );

    const nodes = [];
    let idx = 0;

    while (idx < blockList.length) {
      const block = blockList[idx];
      const meta = groupedBlockMeta ? groupedBlockMeta[block.id] : null;

      if (meta && meta.position === 'start' && Array.isArray(meta.memberIds) && (meta.memberIds.length > 1 || meta.type === 'special')) {
        const groupSize = meta.memberIds.length;
        const groupBlocks = blockList.slice(idx, idx + groupSize);

        if (groupBlocks.length === groupSize) {
          const isSpecialGroup = meta.type === 'special';
          const groupClassName = `${styles.groupWrapper} ${isSpecialGroup ? styles.specialGroupWrapper : ''}`;
          const isExpanded = isSpecialGroup ? expandedH2Groups.has(meta.groupIndex) : true;
          
          let h2Title = '';
          if (isSpecialGroup && groupBlocks.length > 0) {
            const firstBlock = groupBlocks[0];
            if (firstBlock.tag === 'h2') {
              const parser = new DOMParser();
              const doc = parser.parseFromString(firstBlock.innerHtml, 'text/html');
              h2Title = doc.body.textContent?.trim() || '';
            }
          }
          
          nodes.push(
            <div key={`group-${meta.groupIndex}-${block.id}`} className={groupClassName}>
              <div className={styles.groupHeader}>
                <div className={styles.groupInfo}>
                  {isSpecialGroup && (
                    <button
                      type="button"
                      className={styles.expandButton}
                      onClick={() => handleToggleH2Group(meta.groupIndex)}
                      aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      >
                        <path
                          d="M6 4L10 8L6 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                  <div>
                    <span className={styles.groupLabel}>
                      {isSpecialGroup ? (h2Title ? `H2: ${h2Title}` : 'Nhóm H2 tự động') : 'Nhóm block'}
                    </span>
                    <span className={styles.groupCount}>{groupSize} block</span>
                  </div>
                </div>
                {isSpecialGroup ? (
                  <div className={styles.groupActions}>
                    <span className={styles.groupHint}>Không thể chỉnh sửa</span>
                  </div>
                ) : (
                  <div className={styles.groupActions}>
                    <button
                      type="button"
                      className={styles.groupActionButton}
                      onClick={() => handleOpenGroupEditModal(meta.groupIndex)}
                    >
                      Sửa HTML
                    </button>
                    <button
                      type="button"
                      className={styles.groupActionButton}
                      onClick={() => handleCopyGroupHtml(meta.groupIndex)}
                    >
                      Copy nhóm
                    </button>
                    <button
                      type="button"
                      className={styles.groupActionButton}
                      onClick={() => handleUngroupGroup(meta.groupIndex)}
                    >
                      Bỏ nhóm
                    </button>
                  </div>
                )}
              </div>
              {isExpanded && (
                <div className={styles.groupContent}>
                  {groupBlocks.map((groupBlock) => renderSingleBlock(groupBlock))}
                </div>
              )}
            </div>
          );
          idx += groupSize;
          continue;
        }
      }

      nodes.push(renderSingleBlock(block));
      idx += 1;
    }

    return nodes;
  };

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu({ visible: false, x: 0, y: 0 });
      }
    };

    const pageElement = document.querySelector(`.${styles.page}`);
    if (pageElement) {
      pageElement.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      if (pageElement) {
        pageElement.removeEventListener('contextmenu', handleContextMenu);
      }
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleContextMenuAction = (action) => {
    setContextMenu({ visible: false, x: 0, y: 0 });
    if (action === 'groupSelected') {
      handleGroupSelectedBlocks();
    } else if (action === 'copyAll') {
      handleCopyAllBlocks();
    } else if (action === 'clear') {
      handleClear();
    } else if (action === 'clearGroups') {
      handleClearGroupedBlocks();
    } else if (action === 'clearSelection') {
      handleClearSelection();
    } else if (action === 'autoGroupH2') {
      handleAutoGroupH2();
    } else if (action === 'clearSpecialH2Groups') {
      handleClearSpecialH2Groups();
    }
  };

  return (
    <div className={styles.page} onContextMenu={(e) => e.preventDefault()}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Editor</p>
        <h1>HTML Block Editor</h1>
        <p>
          Dán HTML vào ô input, công cụ sẽ parse và hiển thị theo từng block. Click nút + để chèn
          block mới, click copy để sao chép block.
        </p>
      </section>

      <article
        className={styles.card}
        ref={(node) => {
          blocksCardRef.current = node;
          setBlocksCardEl(node);
        }}
      >
        <div className={styles.blocksHeader}>
          <h2>Blocks ({Array.isArray(blocks) ? blocks.length : 0})</h2>
          {Array.isArray(blocks) && blocks.length > 0 && (
            <button
              type="button"
              className={styles.copyAllButton}
              onClick={handleCopyAllBlocks}
              aria-label="Copy tất cả blocks"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 3.5H3.5C2.94772 3.5 2.5 3.94772 2.5 4.5V12.5C2.5 13.0523 2.94772 13.5 3.5 13.5H11.5C12.0523 13.5 12.5 13.0523 12.5 12.5V10.5M5.5 3.5C5.5 2.94772 5.94772 2.5 6.5 2.5H12.5C13.0523 2.5 13.5 2.94772 13.5 3.5V9.5C13.5 10.0523 13.0523 10.5 12.5 10.5H6.5C5.94772 10.5 5.5 10.0523 5.5 9.5V3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Copy tất cả</span>
            </button>
          )}
        </div>
        <div
          className={`${styles.blocksContainer} ${isDragSelecting ? styles.dragging : ''}`}
          ref={blocksContainerRef}
        >
          {dragOverlay.active && (
            <div
              className={styles.selectionOverlay}
              style={{
                top: `${Math.min(dragOverlay.start, dragOverlay.end)}px`,
                height: `${Math.abs(dragOverlay.end - dragOverlay.start)}px`,
              }}
            />
          )}
          {!Array.isArray(blocks) || blocks.length === 0 ? (
            <p className={styles.empty}>Chưa có block nào. Hãy nhập HTML và bấm Parse.</p>
          ) : (
            renderBlockList(blocks)
          )}
        </div>
      </article>

      <article className={styles.card}>
        <h2>Nhập HTML</h2>
        <label className={styles.field}>
          <span>Dán HTML vào đây</span>
          <textarea
            value={inputHtml}
            onChange={handleInputChange}
            onPaste={handlePaste}
            rows={20}
            placeholder="Dán HTML vào đây..."
            className={styles.textarea}
          />
        </label>
        <div className={styles.buttonRow}>
          <button type="button" className={styles.primary} onClick={handleParseHtml}>
            Parse HTML
          </button>
          <button type="button" className={styles.ghost} onClick={handleClear}>
            Xóa
          </button>
        </div>
      </article>

      <InsertModal
        isOpen={insertModal.open}
        onClose={handleCloseInsertModal}
        onInsert={handleInsertBlock}
        mode="insert"
      />

      <InsertModal
        isOpen={editModal.open}
        onClose={handleCloseEditModal}
        onInsert={handleUpdateBlock}
        mode="edit"
        initialValue={editModal.blockTag === 'section' && editModal.innerHtml ? editModal.innerHtml : editModal.initialHtml}
      />

      <InsertModal
        isOpen={groupEditModal.open}
        onClose={handleCloseGroupEditModal}
        onInsert={handleUpdateGroupHtml}
        mode="group-edit"
        initialValue={groupEditModal.initialHtml}
      />

      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.contextMenuSection}>
            <span className={styles.contextMenuLabel}>Chọn lựa</span>
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => handleContextMenuAction('clearSelection')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 4H13M4 8H12M6 12H10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Bỏ chọn tất cả</span>
            </button>
          </div>

          <div className={styles.contextMenuDivider} />

          <div className={styles.contextMenuSection}>
            <span className={styles.contextMenuLabel}>Nhóm</span>
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => handleContextMenuAction('groupSelected')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 4H13M3 8H13M3 12H13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Nhóm block đã chọn</span>
            </button>
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => handleContextMenuAction('autoGroupH2')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 4H13M4 8H12M5 12H11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>Nhóm H2 tự động</span>
            </button>
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => handleContextMenuAction('clearSpecialH2Groups')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 4H13M4 8H12M5 12H11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Bỏ nhóm H2 tự động</span>
            </button>
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => handleContextMenuAction('clearGroups')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 8H13.5M8 2.5V13.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>Bỏ tất cả nhóm</span>
            </button>
          </div>

          <div className={styles.contextMenuDivider} />

          <div className={styles.contextMenuSection}>
            <span className={styles.contextMenuLabel}>Hành động</span>
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => handleContextMenuAction('copyAll')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 3.5H3.5C2.94772 3.5 2.5 3.94772 2.5 4.5V12.5C2.5 13.0523 2.94772 13.5 3.5 13.5H11.5C12.0523 13.5 12.5 13.0523 12.5 12.5V10.5M5.5 3.5C5.5 2.94772 5.94772 2.5 6.5 2.5H12.5C13.0523 2.5 13.5 2.94772 13.5 3.5V9.5C13.5 10.0523 13.0523 10.5 12.5 10.5H6.5C5.94772 10.5 5.5 10.0523 5.5 9.5V3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Copy tất cả HTML</span>
            </button>
            <button
              type="button"
              className={styles.contextMenuItem}
              onClick={() => handleContextMenuAction('clear')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Xóa HTML</span>
            </button>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        newestOnTop={false}
        theme="light"
      />
    </div>
  );
}

export default EditorPage;
