import { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import styles from './AuthorGenerator.module.css';
import AUTHOR_PRESETS from '../../utils/authorPresets';
import 'react-toastify/dist/ReactToastify.css';

function AuthorGenerator() {
  const [formData, setFormData] = useState(getInitialState());
  const [copyStatus, setCopyStatus] = useState('idle');
  const [selectedPreset, setSelectedPreset] = useState('');
  const template = useMemo(() => buildTemplate(formData), [formData]);
  const hasContent = useMemo(() => hasUserInput(formData), [formData]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleLoadSample = () => {
    setFormData(getSampleState());
  };

  const handleClear = () => {
    setFormData(getInitialState());
  };

  const handlePresetChange = (event) => {
    const presetId = event.target.value;
    setSelectedPreset(presetId);
    if (!presetId) return;
    const preset = AUTHOR_PRESETS.find((item) => item.id === presetId);
    if (preset) {
      setFormData(preset.formData);
    }
  };

  const copyTemplateToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(template);
      setCopyStatus('success');
      toast.success('Đã lưu HTML vào clipboard', { position: 'top-right', autoClose: 1800 });
    } catch (error) {
      console.error(error);
      setCopyStatus('error');
      toast.error('Copy HTML thất bại, hãy thử lại.', { position: 'top-right', autoClose: 2200 });
    }
  };

  const handleCopy = () => {
    if (!hasContent) return;
    copyTemplateToClipboard();
  };

  useEffect(() => {
    if (!hasContent) return;
    copyTemplateToClipboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);

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
          <h3>Thông tin author</h3>
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
          <div className={styles.previewHeader}>
            <h3>Preview</h3>
            <div className={styles.previewActions}>
              <button type="button" className={styles.copyButton} onClick={handleCopy}>
                Copy HTML
              </button>
            </div>
          </div>
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
      <ToastContainer />
    </section>
  );
}

function getInitialState() {
  return {
    authorName: '',
    authorImageUrl: '',
    authorDescription: '',
    authorTagUrl: '',
  };
}

function getSampleState() {
  return AUTHOR_PRESETS[0]?.formData || getInitialState();
}

function buildTemplate(data) {
  const safe = {
    authorName: fallback(data.authorName, '{{ authorName }}'),
    authorImageUrl: fallback(data.authorImageUrl, '{{ authorImageUrl }}'),
    authorDescription: fallback(data.authorDescription, '{{ authorDescription }}'),
    authorTagUrl: fallback(data.authorTagUrl, '{{ authorTagUrl }}'),
  };

  return `<div
  style="
    display:flex;
    gap:24px;
    align-items:flex-start;
    border:1px solid #e5e5e5;
    border-radius:16px;
    padding:24px;
    background-color:#ffffff;
  "
>
  <div style="flex:0 0 96px; width:96px; height:96px;">
    <img
      src="${safe.authorImageUrl}"
      alt="${safe.authorName}"
      style="
        width:96px;
        height:96px;
        border-radius:50%;
        object-fit:cover;
        display:block;
      "
      loading="lazy"
    />
  </div>
  <div style="flex:1; min-width:0;">
    <p style="margin:0 0 8px;">
      <b>${safe.authorName}</b> 
    </p>
    <div style="margin:0 0 16px;">
      <p style="margin:0;">
        ${safe.authorDescription}
      </p>
    </div>
    <a
      target="_blank"
      href="${safe.authorTagUrl}"
      style="
        display:inline-flex;
        align-items:center;
        gap:6px;
        text-decoration:none;
      "
    >
      <span>View articles by ${safe.authorName}</span>
      <span aria-hidden="true">→</span>
    </a>
  </div>
</div>`;
}

function fallback(value, placeholder) {
  const trimmed = value.trim();
  return trimmed ? trimmed : placeholder;
}

function hasUserInput(data) {
  return (
    data.authorName.trim() ||
    data.authorImageUrl.trim() ||
    data.authorDescription.trim() ||
    data.authorTagUrl.trim()
  );
}

export default AuthorGenerator;

