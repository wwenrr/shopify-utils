import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFaqsGenerator } from './hooks';
import styles from './index.module.css';

function FaqsGenerator() {
  const {
    input,
    outputHtml,
    previewHtml,
    handleInputChange,
    handlePaste,
    handleScanClick,
    handleLoadSample,
    handleClearInput,
    handleCopyHtml,
  } = useFaqsGenerator();

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Generator</p>
        <h1>FAQs Template</h1>
        <p>
          Dán HTML (h2/h3/p) từ bài viết, công cụ sẽ parse và tạo lại block FAQs chuẩn với style inline,
          preview trực tiếp kèm khả năng copy HTML sạch.
        </p>
      </section>

      <div className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Nhập HTML FAQs</h2>
            <div className={styles.headerActions}>
              <button type="button" className={styles.copyButton} onClick={handleCopyHtml}>
                Copy
              </button>
            </div>
          </div>
          <label className={styles.field}>
            <span>Dán nội dung FAQs (HTML)</span>
            <textarea
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
              rows={18}
              placeholder="Nhập HTML FAQs tại đây"
            />
          </label>
          <div className={styles.buttonRow}>
            <button type="button" className={styles.primary} onClick={handleScanClick}>
              Scan HTML
            </button>
            <button type="button" className={styles.ghost} onClick={handleLoadSample}>
              Load sample
            </button>
            <button type="button" className={styles.ghost} onClick={handleClearInput}>
              Xóa input
            </button>
          </div>
        </article>

        <article className={styles.card}>
          <h2>Preview</h2>
          <div className={styles.preview}>
            {previewHtml ? (
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <p className={styles.previewEmpty}>Nhập HTML bên trái rồi bấm Scan để xem preview.</p>
            )}
          </div>
        </article>
      </div>

      <article className={`${styles.card} ${styles.fullWidth}`}>
        <h2>Output HTML</h2>
        <pre className={styles.output}>{outputHtml}</pre>
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
    </div>
  );
}

export default FaqsGenerator;