import { useState, useEffect } from 'react';
import styles from './SaveModal.module.css';

function SaveModal({ isOpen, onClose, onSave, isLoading }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const handleCancel = () => {
    setName('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Lưu cấu hình</h3>
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
            <span>Tên cấu hình</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên cấu hình..."
              className={styles.input}
              disabled={isLoading}
              autoFocus
            />
            <small>Tên này sẽ giúp bạn dễ dàng nhận biết khi load lại</small>
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
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SaveModal;

