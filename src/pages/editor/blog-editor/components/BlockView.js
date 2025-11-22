import { useState } from 'react';
import styles from './BlockView.module.css';

function BlockView({ block, onInsert, onInsertAfter, onDelete, onCopy, onEdit }) {
  const hasChildren = block.children && block.children.length > 0;
  const [isExpanded, setIsExpanded] = useState(!hasChildren);

  const indentStyle = {
    marginLeft: `${block.depth * 24}px`,
  };

  const handleInsertInsideClick = (event) => {
    event.stopPropagation();
    onInsert(block.id, 'inside');
  };

  const handleInsertAfterClick = (event) => {
    event.stopPropagation();
    onInsertAfter(block.id, 'after');
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    onDelete(block.id);
  };

  const handleCopyClick = async (event) => {
    event.stopPropagation();
    await onCopy(block.outerHtml);
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    onEdit(block.id, block.outerHtml);
  };

  const handleToggleExpand = (event) => {
    event.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <>
      <div className={styles.block} style={indentStyle}>
        <div className={styles.blockHeader}>
          <div className={styles.headerLeft}>
            {hasChildren && (
              <button
                type="button"
                className={`${styles.collapseButton} ${isExpanded ? styles.expanded : ''}`}
                onClick={handleToggleExpand}
                aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <span className={styles.tagName}>{block.tag}</span>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.insertButton}
              onClick={handleInsertInsideClick}
              aria-label="Chèn block vào trong"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 3V13M3 8H13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={styles.editButton}
              onClick={handleEditClick}
              aria-label="Chỉnh sửa block"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.3333 2.00001C11.5084 1.82491 11.7163 1.68601 11.9444 1.5913C12.1726 1.49659 12.4166 1.448 12.6667 1.448C12.9167 1.448 13.1607 1.49659 13.3889 1.5913C13.617 1.68601 13.8249 1.82491 14 2.00001C14.1751 2.17511 14.314 2.38305 14.4087 2.61115C14.5034 2.83925 14.552 3.08319 14.552 3.33334C14.552 3.58349 14.5034 3.82743 14.4087 4.05553C14.314 4.28363 14.1751 4.49157 14 4.66668L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={styles.copyButton}
              onClick={handleCopyClick}
              aria-label="Copy block"
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
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDeleteClick}
              aria-label="Xóa block"
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
            </button>
          </div>
        </div>
        <div className={styles.blockContent}>
          <div className={styles.htmlPreview} dangerouslySetInnerHTML={{ __html: block.outerHtml }} />
        </div>
        {hasChildren && isExpanded && (
          <div className={styles.children}>
            {block.children.map((child) => (
              <BlockView
                key={child.id}
                block={child}
                onInsert={onInsert}
                onInsertAfter={onInsertAfter}
                onDelete={onDelete}
                onCopy={onCopy}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
      <div className={styles.insertAfterButton} style={indentStyle}>
        <button
          type="button"
          className={styles.insertAfterBtn}
          onClick={handleInsertAfterClick}
          aria-label="Chèn block mới dưới"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 3V13M3 8H13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </>
  );
}

export default BlockView;

