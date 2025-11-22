import styles from './TokenForm.module.css';

function TokenForm({ githubToken, isLoading, onGithubTokenChange, onSave, onReset }) {
  return (
    <form className={styles.form}>
      <label className={styles.field}>
        <span>GitHub Token</span>
        <input
          type="password"
          name="githubToken"
          value={githubToken}
          onChange={onGithubTokenChange}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          className={styles.input}
          disabled={isLoading}
        />
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

