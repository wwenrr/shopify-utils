import { useState, useEffect } from 'react';
import styles from './InsertModal.module.css';

function InsertModal({ isOpen, onClose, onInsert, mode = 'insert', initialValue = '' }) {
  const [htmlInput, setHtmlInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialValue) {
        setHtmlInput(initialValue);
      } else {
        setHtmlInput('');
      }
    }
  }, [isOpen, mode, initialValue]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (htmlInput.trim()) {
      onInsert(htmlInput.trim());
      setHtmlInput('');
    }
  };

  const handleCancel = () => {
    setHtmlInput('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{mode === 'edit' ? 'Chỉnh sửa HTML Block' : 'Chèn HTML Block Mới'}</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleCancel}
            aria-label="Đóng"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            <span>Nhập HTML để chèn:</span>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              className={styles.textarea}
              rows={12}
              placeholder="<div>Nội dung HTML...</div>"
              autoFocus
            />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={handleCancel}>
              Hủy
            </button>
            <button type="submit" className={styles.submitButton} disabled={!htmlInput.trim()}>
              {mode === 'edit' ? 'Lưu' : 'Chèn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InsertModal;

