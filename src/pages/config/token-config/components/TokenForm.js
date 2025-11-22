import { useState } from 'react';
import styles from './TokenForm.module.css';

function TokenForm({ githubToken, isLoading, onGithubTokenChange, onSave, onReset }) {
  const [showToken, setShowToken] = useState(false);

  const toggleShowToken = () => {
    setShowToken((prev) => !prev);
  };

  return (
    <form className={styles.form}>
      <label className={styles.field}>
        <span>GitHub Token</span>
        <div className={styles.inputWrapper}>
          <input
            type={showToken ? 'text' : 'password'}
            name="githubToken"
            value={githubToken}
            onChange={onGithubTokenChange}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={toggleShowToken}
            disabled={isLoading}
            aria-label={showToken ? 'Ẩn token' : 'Hiển thị token'}
          >
            {showToken ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        <small>Nhập GitHub personal access token để sử dụng API.</small>
      </label>

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={`${styles.primary} ${isLoading ? styles.loading : ''}`}
          onClick={onSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} />
              Loading...
            </>
          ) : (
            'Save'
          )}
        </button>
        <button
          type="button"
          className={styles.ghost}
          onClick={onReset}
          disabled={isLoading}
        >
          Reset
        </button>
      </div>
    </form>
  );
}

export default TokenForm;

