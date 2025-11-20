import { useMemo, useState } from 'react';
import styles from './AuthorGenerator.module.css';

function AuthorGenerator() {
  const [formData, setFormData] = useState(getInitialState());
  const [copyStatus, setCopyStatus] = useState('idle');
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error(error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

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
          {copyStatus === 'success' && <span className={styles.statusSuccess}>Đã copy</span>}
          {copyStatus === 'error' && <span className={styles.statusError}>Copy lỗi</span>}
        </div>
        <pre className={styles.code}>{template}</pre>
        <button type="button" className={styles.copyButton} onClick={handleCopy}>
          Copy HTML
        </button>
      </article>
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
  return {
    authorName: 'Yuzuki Tsukihana',
    authorImageUrl:
      'https://cdn.shopify.com/s/files/1/0512/5429/6766/files/author-yuzuki-tsukihana-2_1000x.png?v=1751427548',
    authorDescription:
      'Yuzuki Tsukihana là beauty editor đến từ Tokyo với hơn 10 năm nghiên cứu da nhạy cảm. Cô nổi tiếng với các bài viết giàu dữ liệu và routine tối giản.',
    authorTagUrl: 'https://example.com/tagged/author-yuzuki-tsukihana',
  };
}

function buildTemplate(data) {
  const safe = {
    authorName: fallback(data.authorName, '{{ authorName }}'),
    authorImageUrl: fallback(data.authorImageUrl, '{{ authorImageUrl }}'),
    authorDescription: fallback(data.authorDescription, '{{ authorDescription }}'),
    authorTagUrl: fallback(data.authorTagUrl, '{{ authorTagUrl }}'),
  };

  return `<div style="display: flex; gap: 15px;">
  <div style="flex: 0 0 20%; align-self: flex-start;">
    <img width="150" height="150" style="width: 100%; height: auto; margin-top: 2rem;" src="${safe.authorImageUrl}" alt="author ${safe.authorName}">
  </div>

  <div style="flex: 1; word-wrap: break-word; overflow-wrap: break-word;">
    <p style="font-size: 1.75rem; font-weight: 600;">${safe.authorName}</p>

    <div>
      <p style="white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${safe.authorDescription}</p>
    </div>

    <a target="_blank" href="${safe.authorTagUrl}">
      View articles by ${safe.authorName}
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

