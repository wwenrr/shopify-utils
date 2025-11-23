import { ToastContainer } from 'react-toastify';
import { useAuthorGenerator } from './hooks';
import { AUTHOR_PRESETS } from './utils';
import styles from './index.module.css';
import 'react-toastify/dist/ReactToastify.css';

function AuthorGenerator() {
  const {
    formData,
    copyStatus,
    selectedPreset,
    template,
    hasContent,
    handleInputChange,
    handleLoadSample,
    handleClear,
    handlePresetChange,
    handleCopy,
  } = useAuthorGenerator();

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Generator</p>
          <h2>HTML template cho author</h2>
          <p>
            Nhập dữ liệu tại form, xem preview ngay bên cạnh và copy HTML chuẩn để dán vào bài viết
            Shopify.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Thông tin author</h3>
            <div className={styles.headerActions}>
              <button type="button" className={styles.copyButton} onClick={handleCopy}>
                Copy
              </button>
            </div>
          </div>
          <form className={styles.form}>
            <label className={styles.field}>
              <span>Nạp author có sẵn</span>
              <select
                value={selectedPreset}
                onChange={handlePresetChange}
                className={styles.select}
              >
                <option value="">Chọn author...</option>
                {AUTHOR_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Tên Author</span>
              <input
                type="text"
                name="authorName"
                placeholder="Ví dụ: Yuzuki Tsukihana"
                value={formData.authorName}
                onChange={handleInputChange}
              />
            </label>
            <label className={styles.field}>
              <span>URL hình ảnh</span>
              <input
                type="url"
                name="authorImageUrl"
                placeholder="https://example.com/image.png"
                value={formData.authorImageUrl}
                onChange={handleInputChange}
              />
            </label>
            <label className={styles.field}>
              <span>Mô tả</span>
              <textarea
                name="authorDescription"
                rows="5"
                placeholder="Mô tả ngắn gọn về tác giả..."
                value={formData.authorDescription}
                onChange={handleInputChange}
              />
            </label>
            <label className={styles.field}>
              <span>URL tag</span>
              <input
                type="url"
                name="authorTagUrl"
                placeholder="https://example.com/tagged/author"
                value={formData.authorTagUrl}
                onChange={handleInputChange}
              />
            </label>
            <div className={styles.buttonRow}>
              <button type="button" onClick={handleLoadSample}>
                Load dữ liệu mẫu
              </button>
              <button type="button" className={styles.ghost} onClick={handleClear}>
                Xóa form
              </button>
            </div>
          </form>
        </article>

        <article className={styles.card}>
          <h3>Preview</h3>
          <div className={styles.preview}>
            {hasContent ? (
              <div dangerouslySetInnerHTML={{ __html: template }} />
            ) : (
              <p>Điền thông tin vào form để xem preview.</p>
            )}
          </div>
        </article>
      </div>

      <article className={`${styles.card} ${styles.output}`}>
        <div className={styles.outputHeader}>
          <h3>HTML Output</h3>
          {copyStatus === 'success' && <span className={styles.statusSuccess}>Đã copy clipboard</span>}
          {copyStatus === 'error' && <span className={styles.statusError}>Copy lỗi</span>}
        </div>
        <pre className={styles.code}>{template}</pre>
      </article>
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
    </section>
  );
}

export default AuthorGenerator;