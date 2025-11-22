import { useState, useEffect } from 'react';
import styles from './CreateGistModal.module.css';

function CreateGistModal({ isOpen, onClose, onCreate, isLoading }) {
  const [gistName, setGistName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGistName('');
    }
  }, [isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (gistName.trim()) {
      onCreate(gistName.trim());
    }
  };

  const handleCancel = () => {
    setGistName('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Tạo Gist Mới</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleCancel}
            aria-label="Đóng"
            disabled={isLoading}
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
            <span>Tên gist</span>
            <input
              type="text"
              value={gistName}
              onChange={(e) => setGistName(e.target.value)}
              placeholder="Nhập tên gist..."
              className={styles.input}
              disabled={isLoading}
              autoFocus
            />
            <small>Gist sẽ được tạo với quyền riêng tư (private)</small>
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!gistName.trim() || isLoading}
            >
              {isLoading ? 'Đang tạo...' : 'Tạo gist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGistModal;

