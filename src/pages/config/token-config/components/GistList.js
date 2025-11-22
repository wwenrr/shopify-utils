import styles from './GistList.module.css';

function GistList({ gists, isLoading, onDelete }) {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <span className={styles.spinner} />
          <span>Đang tải danh sách gist...</span>
        </div>
      </div>
    );
  }

  if (!gists || gists.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>Chưa có gist nào</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileCount = (files) => {
    return Object.keys(files || {}).length;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Danh sách Gist ({gists.length})</h3>
      </div>
      <div className={styles.list}>
        {gists.map((gist) => (
          <div key={gist.id} className={styles.gistItem}>
            <div className={styles.gistHeader}>
              <a
                href={gist.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.gistTitle}
              >
                {gist.description || gist.id}
              </a>
              <span className={styles.gistMeta}>
                {getFileCount(gist.files)} file(s)
              </span>
            </div>
            <div className={styles.gistFooter}>
              <span className={styles.gistDate}>
                Cập nhật: {formatDate(gist.updated_at)}
              </span>
              <div className={styles.gistActions}>
                <a
                  href={gist.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.gistLink}
                >
                  Xem trên GitHub →
                </a>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => onDelete(gist.id)}
                  aria-label="Xóa gist"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GistList;

