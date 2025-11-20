import { useMemo, useState } from 'react';
import styles from './BlogButtonGenerator.module.css';

const VARIANT_DEFAULTS = {
  jwl: {
    backgroundColor: '#3F3E3D',
    borderColor: '#3F3E3D',
    borderRadius: '999px',
    fontFamily: "'Inter',sans-serif",
    textColor: '#FFFFFF',
    hoverBackgroundColor: '#FFFFFF',
    hoverTextColor: '#3F3E3D',
    hoverBorderColor: '#3F3E3D',
  },
  jf: {
    backgroundColor: '#0D0C0C',
    borderColor: '#0D0C0C',
    borderRadius: '5px',
    fontFamily: "'Nunito Sans',sans-serif",
    textColor: '#FFFFFF',
    hoverBackgroundColor: '#FFFFFF',
    hoverTextColor: '#0D0C0C',
    hoverBorderColor: '#0D0C0C',
  },
};

const VARIANT_FIELDS = [
  { id: 'backgroundColor', label: 'Nền', type: 'color' },
  { id: 'textColor', label: 'Màu chữ', type: 'color' },
  { id: 'borderColor', label: 'Màu viền', type: 'color' },
  { id: 'borderRadius', label: 'Bo góc', type: 'text', placeholder: 'Ví dụ: 999px' },
  { id: 'fontFamily', label: 'Font family', type: 'text', placeholder: "'Inter',sans-serif" },
  { id: 'hoverBackgroundColor', label: 'Hover nền', type: 'color' },
  { id: 'hoverTextColor', label: 'Hover chữ', type: 'color' },
  { id: 'hoverBorderColor', label: 'Hover viền', type: 'color' },
];

const INITIAL_FORM = {
  text: 'Đọc thêm bài viết',
  url: 'https://example.com/bai-viet',
  variant: 'jwl',
  description: '',
  target: false,
};

const SAMPLE_FORM = {
  text: 'Khám phá thêm',
  url: 'https://example.com/blog/cau-chuyen',
  variant: 'jwl',
  description: 'Tổng hợp insight & case study chi tiết.',
  target: true,
};

const DEFAULT_PREVIEW_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.';

const cloneVariantDefaults = () => JSON.parse(JSON.stringify(VARIANT_DEFAULTS));

function BlogButtonGenerator() {
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [variantSettings, setVariantSettings] = useState(() => cloneVariantDefaults());
  const [copyState, setCopyState] = useState('idle');

  const currentVariantConfig = useMemo(() => {
    return variantSettings[formValues.variant] || VARIANT_DEFAULTS.jwl;
  }, [formValues.variant, variantSettings]);

  const buttonMarkup = useMemo(() => {
    return buildButtonMarkup(formValues, currentVariantConfig);
  }, [formValues, currentVariantConfig]);

  const previewMarkup = useMemo(() => {
    return `
      <div class="${styles.previewBlock}">
        <p class="${styles.previewText}">${DEFAULT_PREVIEW_TEXT}</p>
        ${buttonMarkup}
        <p class="${styles.previewText}">
          Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus.
        </p>
      </div>
    `;
  }, [buttonMarkup]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));
    if (name === 'variant') {
      setCopyState('idle');
    }
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFormValues((previous) => ({
      ...previous,
      [name]: checked,
    }));
  };

  const handleVariantFieldChange = (field, value) => {
    setVariantSettings((previous) => {
      const next = { ...previous };
      const variantKey = formValues.variant;
      const currentConfig = next[variantKey] ? { ...next[variantKey] } : { ...VARIANT_DEFAULTS.jwl };
      currentConfig[field] = value;
      next[variantKey] = currentConfig;
      return next;
    });
  };

  const handleResetVariant = () => {
    setVariantSettings((previous) => ({
      ...previous,
      [formValues.variant]: { ...VARIANT_DEFAULTS[formValues.variant] },
    }));
  };

  const handleLoadSample = () => {
    setFormValues(SAMPLE_FORM);
    setVariantSettings((previous) => ({
      ...previous,
      [SAMPLE_FORM.variant]: { ...VARIANT_DEFAULTS[SAMPLE_FORM.variant] },
    }));
    setCopyState('idle');
  };

  const handleResetForm = () => {
    setFormValues(INITIAL_FORM);
    setVariantSettings(cloneVariantDefaults());
    setCopyState('idle');
  };

  const handleCopyMarkup = async () => {
    try {
      await navigator.clipboard.writeText(buttonMarkup.trim());
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (error) {
      console.error(error);
      setCopyState('error');
    }
  };

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
          <h2>Cấu hình button</h2>
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
        <div className={styles.outputHeader}>
          <h2>Button HTML</h2>
          {copyState === 'copied' && <span className={styles.statusSuccess}>Đã copy</span>}
          {copyState === 'error' && <span className={styles.statusError}>Copy lỗi</span>}
        </div>
        <pre className={styles.output}>{buttonMarkup.trim()}</pre>
        <button type="button" className={styles.primary} onClick={handleCopyMarkup}>
          Copy button
        </button>
      </article>
    </div>
  );
}

function buildButtonMarkup(values, variantConfig) {
  const targetAttr = values.target ? ' target="_blank" rel="noopener noreferrer"' : '';
  const buttonStyle = [
    'display:inline-flex',
    'align-items:center',
    'justify-content:center',
    'padding:14px 32px',
    'height:44px',
    'font-weight:600',
    `font-family:${variantConfig.fontFamily}`,
    "font-size:max(clamp(12px,calc(0.347vw + 10.333px),13px),clamp(13px,calc(1.171875vw + 4px),16px))",
    'text-decoration:none',
    `color:${variantConfig.textColor}`,
    `background-color:${variantConfig.backgroundColor}`,
    `border:1px solid ${variantConfig.borderColor}`,
    `border-radius:${variantConfig.borderRadius}`,
    'transition:all 0.2s ease',
  ].join(';');

  const hoverIn = [
    `this.style.color='${variantConfig.hoverTextColor}'`,
    `this.style.backgroundColor='${variantConfig.hoverBackgroundColor}'`,
    `this.style.borderColor='${variantConfig.hoverBorderColor}'`,
  ].join(';');

  const hoverOut = [
    `this.style.color='${variantConfig.textColor}'`,
    `this.style.backgroundColor='${variantConfig.backgroundColor}'`,
    `this.style.borderColor='${variantConfig.borderColor}'`,
  ].join(';');

  const containerStyle = [
    'margin:32px 0',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'gap:12px',
    'min-height:clamp(40px,calc(2vw + 24px),44px)',
  ].join(';');

  const descriptionBlock = values.description
    ? `<p style="text-align:center;color:#757575;font-size:14px;margin:0;">${values.description}</p>`
    : '';

  return `<div style="${containerStyle}">
  <a href="${values.url}"${targetAttr} style="${buttonStyle}" onmouseenter="${hoverIn}" onmouseleave="${hoverOut}">${values.text}</a>
  ${descriptionBlock}
</div>`;
}

export default BlogButtonGenerator;

