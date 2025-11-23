import { useState, useEffect, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useHtmlBlockEditor } from './hooks';
import BlockView from './components/BlockView';
import InsertModal from './components/InsertModal';
import styles from './index.module.css';

function EditorPage() {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const contextMenuRef = useRef(null);
  const {
    blocks,
    inputHtml,
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
    handleGroupH2,
    handleSplitBlock,
    isH2Grouped,
    handleClear,
  } = useHtmlBlockEditor();

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
    if (action === 'groupH2') {
      handleGroupH2();
    } else if (action === 'copyAll') {
      handleCopyAllBlocks();
    } else if (action === 'clear') {
      handleClear();
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

      <article className={styles.card}>
        <div className={styles.blocksHeader}>
          <h2>Blocks ({Array.isArray(blocks) ? blocks.length : 0})</h2>
          {Array.isArray(blocks) && blocks.length > 0 && (
            <>
              <button
                type="button"
                className={`${styles.groupH2Button} ${isH2Grouped ? styles.groupH2ButtonActive : ''}`}
                onClick={handleGroupH2}
                aria-label="Nhóm h2"
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
                <span>Nhóm h2</span>
              </button>
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
            </>
          )}
        </div>
        <div className={styles.blocksContainer}>
          {!Array.isArray(blocks) || blocks.length === 0 ? (
            <p className={styles.empty}>Chưa có block nào. Hãy nhập HTML và bấm Parse.</p>
          ) : (
            blocks.map((block) => (
              <BlockView
                key={block.id}
                block={block}
                onInsert={handleOpenInsertModal}
                onInsertAfter={handleOpenInsertModal}
                onDelete={handleDeleteBlock}
                onCopy={handleCopyBlock}
                onEdit={handleOpenEditModal}
                onSplit={handleSplitBlock}
              />
            ))
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
          <button
            type="button"
            className={styles.contextMenuItem}
            onClick={() => handleContextMenuAction('groupH2')}
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
            <span>{isH2Grouped ? 'Bỏ nhóm h2' : 'Nhóm h2'}</span>
          </button>
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
