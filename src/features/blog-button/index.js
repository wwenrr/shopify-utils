import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useBlogButtonGenerator } from './hooks';
import { VARIANT_FIELDS } from './utils';
import SaveModal from './components/SaveModal';
import LoadModal from './components/LoadModal';
import styles from './index.module.css';

function BlogButtonGenerator() {
  const {
    formValues,
    currentVariantConfig,
    buttonMarkup,
    previewMarkup,
    handleInputChange,
    handleCheckboxChange,
    handleVariantFieldChange,
    handleResetVariant,
    handleLoadSample,
    handleResetForm,
    handleCopyMarkup,
    isSaveModalOpen,
    isSaving,
    handleOpenSaveModal,
    handleCloseSaveModal,
    handleSave,
    handleLoad,
    handleDeleteConfig,
    savedConfigs,
  } = useBlogButtonGenerator();

  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Generator</p>
        <h1>Blog Button Template</h1>
        <p>
          Tùy chỉnh CTA button dùng cho nội dung blog. Bạn có thể chọn variant theo thương hiệu,
          chỉnh màu sắc, font, bo góc và xem trước ngay trong bối cảnh bài viết.
        </p>
      </section>

      <div className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Cấu hình button</h2>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.loadButton}
                onClick={() => setIsLoadModalOpen(true)}
                disabled={savedConfigs.length === 0}
              >
                Load
                {savedConfigs.length > 0 && (
                  <span className={styles.badge}>{savedConfigs.length}</span>
                )}
              </button>
              <button type="button" className={styles.saveButton} onClick={handleOpenSaveModal}>
                Save
              </button>
              <button type="button" className={styles.copyButton} onClick={handleCopyMarkup}>
                Copy
              </button>
            </div>
          </div>
          <form className={styles.form}>
            <label className={styles.field}>
              <span>Nội dung button</span>
              <input
                type="text"
                name="text"
                value={formValues.text}
                onChange={handleInputChange}
                placeholder="Ví dụ: Đọc thêm bài viết"
              />
              <small>Button nên ngắn gọn, 2-5 từ.</small>
            </label>

            <label className={styles.field}>
              <span>Đường dẫn</span>
              <input
                type="url"
                name="url"
                value={formValues.url}
                onChange={handleInputChange}
                placeholder="https://example.com/bai-viet"
              />
              <small>Nhập link tuyệt đối để tránh lỗi.</small>
            </label>

            <label className={styles.field}>
              <span>Kiểu button</span>
              <select name="variant" value={formValues.variant} onChange={handleInputChange}>
                <option value="jwl">JWL</option>
                <option value="jf">JF</option>
              </select>
              <small>Chọn style button phù hợp từng thương hiệu.</small>
            </label>

            <label className={styles.field}>
              <span>Mô tả button</span>
              <textarea
                name="description"
                rows={3}
                value={formValues.description}
                onChange={handleInputChange}
                placeholder="Tùy chọn: Giải thích ngắn về hành động của button"
              />
              <small>Hiển thị ngay dưới button, có thể bỏ trống.</small>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="target"
                checked={formValues.target}
                onChange={handleCheckboxChange}
              />
              <span>Mở tab mới</span>
            </label>

            <div className={styles.buttonRow}>
              <button type="button" className={styles.primary} onClick={handleLoadSample}>
                Dữ liệu mẫu
              </button>
              <button type="button" className={styles.ghost} onClick={handleResetForm}>
                Xóa form
              </button>
            </div>
          </form>
        </article>

        <article className={styles.card}>
          <h2>Cấu hình variant · <span className={styles.variantLabel}>{formValues.variant.toUpperCase()}</span></h2>
          <p className={styles.variantNote}>Điều chỉnh màu sắc, bo góc, font và hover state.</p>
          <div className={styles.variantGrid}>
            {VARIANT_FIELDS.map((field) => (
              <label key={field.id} className={styles.field}>
                <span>{field.label}</span>
                {field.type === 'color' ? (
                  <input
                    type="color"
                    value={currentVariantConfig[field.id]}
                    onChange={(event) => handleVariantFieldChange(field.id, event.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    value={currentVariantConfig[field.id]}
                    onChange={(event) => handleVariantFieldChange(field.id, event.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
              </label>
            ))}
          </div>
          <div className={styles.buttonRow}>
            <button type="button" className={styles.ghost} onClick={handleResetVariant}>
              Reset variant
            </button>
          </div>
        </article>
      </div>

      <article className={`${styles.card} ${styles.fullWidth}`}>
        <h2>Preview</h2>
        <div className={styles.preview} dangerouslySetInnerHTML={{ __html: previewMarkup }} />
      </article>

      <article className={`${styles.card} ${styles.fullWidth}`}>
        <h2>Button HTML</h2>
        <pre className={styles.output}>{buttonMarkup.trim()}</pre>
      </article>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={handleCloseSaveModal}
        onSave={handleSave}
        isLoading={isSaving}
      />

      <LoadModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        savedConfigs={savedConfigs}
        onLoad={handleLoad}
        onDelete={handleDeleteConfig}
      />

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

export default BlogButtonGenerator;