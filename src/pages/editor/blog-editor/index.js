import { Editor } from 'react-draft-wysiwyg';
import { Copy, RefreshCw, Upload } from 'lucide-react';
import { useBlogEditor } from './hooks';
import styles from './index.module.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

function EditorPage() {
  const {
    editorState,
    statusMessage,
    fileInputRef,
    stats,
    toolbar,
    rawContentPreview,
    handleEditorChange,
    handleClear,
    handleCopyRaw,
    handleImportClick,
    handleImportFile,
    handleEditorPaste,
    handleCopyHtml,
  } = useBlogEditor();

  return (
    <div className={styles.root}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>WYSIWYG editor</p>
          <h1 className={styles.title}>Blog Editor</h1>
          <p className={styles.subtitle}>
            Sử dụng trình soạn thảo để tạo nội dung có định dạng, xuất bản nhanh mà vẫn đảm bảo cấu
            trúc chuẩn.
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={`${styles.actionButton} ${styles.secondary}`} onClick={handleImportClick}>
            <Upload size={16} aria-hidden="true" />
            Nhập từ HTML
          </button>
          <button type="button" className={`${styles.actionButton} ${styles.secondary}`} onClick={handleCopyHtml}>
            <Copy size={16} aria-hidden="true" />
            Sao chép HTML
          </button>
          <button type="button" className={`${styles.actionButton} ${styles.secondary}`} onClick={handleClear}>
            <RefreshCw size={16} aria-hidden="true" />
            Làm mới
          </button>
          <button type="button" className={`${styles.actionButton} ${styles.primary}`} onClick={handleCopyRaw}>
            <Copy size={16} aria-hidden="true" />
            Sao chép JSON
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,text/html"
          onChange={handleImportFile}
          className={styles.fileInput}
        />
      </header>

      <section className={styles.editorCard}>
        <div className={styles.editorWrapper}>
          <Editor
            editorState={editorState}
            onEditorStateChange={handleEditorChange}
            handlePastedText={handleEditorPaste}
            toolbarClassName={styles.toolbar}
            wrapperClassName={styles.wrapper}
            editorClassName={styles.editor}
            placeholder="Bắt đầu viết nội dung của bạn..."
            toolbar={toolbar}
          />
        </div>
      </section>

      <section className={styles.detailsGrid}>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Thống kê</p>
          <div className={styles.statRow}>
            <div>
              <p className={styles.statValue}>{stats.words}</p>
              <p className={styles.statCaption}>Tổng số từ</p>
            </div>
            <div>
              <p className={styles.statValue}>{stats.characters}</p>
              <p className={styles.statCaption}>Ký tự</p>
            </div>
            <div>
              <p className={styles.statValue}>{stats.readingTime} phút</p>
              <p className={styles.statCaption}>Thời gian đọc</p>
            </div>
          </div>
        </article>

        <article className={styles.jsonCard}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>Nội dung JSON</p>
            <button type="button" className={styles.textButton} onClick={handleCopyRaw}>
              <Copy size={16} aria-hidden="true" />
              Sao chép
            </button>
          </div>
          <pre className={styles.codeBlock} aria-live="polite">
            {rawContentPreview}
          </pre>
        </article>
      </section>

      {statusMessage && <p className={styles.feedback}>{statusMessage}</p>}
    </div>
  );
}

export default EditorPage;