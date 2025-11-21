import { useEffect, useRef, useState } from 'react';
import styles from './FaqsGenerator.module.css';
import { DEFAULT_TEMPLATE, SAMPLE_HTML, TEMPLATE_CONFIG } from './FaqsGenerator.constants';

function FaqsGenerator() {
  const [input, setInput] = useState('');
  const [outputHtml, setOutputHtml] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [inlineAlert, setInlineAlert] = useState({ message: '', type: 'error', visible: false });
  const [templateType, setTemplateType] = useState(DEFAULT_TEMPLATE);
  const [lastFaqData, setLastFaqData] = useState(null);
  const alertTimeoutRef = useRef(null);
  const showAlert = (message, type = 'error') => {
    setInlineAlert({ message, type, visible: true });
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    alertTimeoutRef.current = setTimeout(() => {
      setInlineAlert((previous) => ({ ...previous, visible: false }));
    }, 2800);
  };

  useEffect(() => {
    setInput(SAMPLE_HTML);
    handleScan(SAMPLE_HTML);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanClick = () => {
    handleScan(input, templateType);
  };

  const handleScan = (rawInput, type = DEFAULT_TEMPLATE) => {
    const raw = rawInput.trim();
    if (!raw) {
      showAlert('Vui lòng nhập HTML FAQs trước khi scan.');
      return;
    }

    const normalized = normalizeInput(raw);
    if (!isLikelyHtml(normalized)) {
      showAlert('Nội dung phải là HTML hợp lệ (có thẻ).');
      return;
    }

    const doc = parseHtml(normalized);
    if (!doc) {
      showAlert('Không thể đọc HTML. Vui lòng kiểm tra lại.');
      return;
    }

    const faqData = extractFaqData(doc);
    if (!faqData || faqData.questions.length === 0) {
      showAlert('Không tìm thấy thẻ h3 cho câu hỏi. Vui lòng kiểm tra HTML.');
      return;
    }

    const html = buildFaqTemplate(faqData, type);
    setLastFaqData(faqData);
    setPreviewHtml(html);
    setOutputHtml(html);
    showAlert('Đã tạo FAQs preview thành công.', 'success');
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_HTML);
    handleScan(SAMPLE_HTML, templateType);
    showAlert('Đã load sample FAQs.', 'success');
  };

  const handleClearInput = () => {
    setInput('');
    setPreviewHtml('');
    setOutputHtml('');
    setLastFaqData(null);
    showAlert('Đã xóa nội dung.', 'success');
  };

  const handleCopyHtml = async () => {
    if (!outputHtml.trim()) {
      showAlert('Chưa có HTML để copy.');
      return;
    }

    const htmlString = outputHtml.trim();
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const data = {
          'text/html': new Blob([htmlString], { type: 'text/html' }),
          'text/plain': new Blob([htmlString], { type: 'text/plain' }),
        };
        await navigator.clipboard.write([new ClipboardItem(data)]);
      } else {
        await navigator.clipboard.writeText(htmlString);
      }
      showAlert('Đã copy FAQs HTML.', 'success');
    } catch (error) {
      console.error(error);
      showAlert('Không thể copy. Vui lòng thử lại.');
    }
  };

  const handlePaste = (event) => {
    const clipboard = event.clipboardData;
    if (!clipboard) return;
    const htmlData = clipboard.getData('text/html');
    if (!htmlData) return;
    event.preventDefault();
    setInput(htmlData);
  };

  useEffect(() => {
    if (!lastFaqData) return;
    const rebuiltHtml = buildFaqTemplate(lastFaqData, templateType);
    setPreviewHtml(rebuiltHtml);
    setOutputHtml(rebuiltHtml);
  }, [templateType, lastFaqData]);

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
          <h2>Nhập HTML FAQs</h2>
          <label className={styles.field}>
            <span>Dán nội dung FAQs (HTML)</span>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onPaste={handlePaste}
              rows={18}
              placeholder="Nhập HTML FAQs tại đây"
            />
          </label>
          <label className={styles.field}>
            <span>Chọn kiểu template</span>
            <select value={templateType} onChange={(event) => setTemplateType(event.target.value)}>
              <option value="jwl">JWL</option>
              <option value="jf">JF</option>
              <option value="kichiin">Kichiin</option>
            </select>
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
        <div className={styles.outputHeader}>
          <h2>Output HTML</h2>
          <button type="button" className={styles.primary} onClick={handleCopyHtml}>
            Copy HTML
          </button>
        </div>
        <pre className={styles.output}>{outputHtml}</pre>
      </article>

      <div
        className={`${styles.inlineAlert} ${
          inlineAlert.visible ? styles.visible : ''
        } ${inlineAlert.type === 'success' ? styles.success : styles.error}`}
        role="status"
        aria-live="polite"
      >
        {inlineAlert.message}
      </div>
    </div>
  );
}

function normalizeInput(content) {
  if (/&lt;|&gt;|&amp;|&quot;|&#39;/i.test(content)) {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = content;
    return decoder.value;
  }
  return content;
}

function isLikelyHtml(content) {
  return /<([a-z][\s\S]*?)>/i.test(content);
}

function parseHtml(content) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  if (doc.querySelector('parsererror')) {
    return null;
  }
  return doc;
}

function extractFaqData(doc) {
  const h2 = doc.querySelector('h2');
  const title = h2 ? h2.textContent.trim() : 'FAQs';

  const introNodes = [];
  let node = h2 ? h2.nextSibling : doc.body.firstChild;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'h3') {
      break;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      introNodes.push(node.outerHTML);
    }
    node = node.nextSibling;
  }

  const questions = [];
  const h3List = doc.querySelectorAll('h3');
  h3List.forEach((h3) => {
    const question = h3.textContent.trim();
    const answers = [];
    let sibling = h3.nextSibling;
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName.toLowerCase() === 'h3') {
        break;
      }
      if (sibling.nodeType === Node.ELEMENT_NODE) {
        answers.push(sibling.outerHTML);
      }
      sibling = sibling.nextSibling;
    }
    questions.push({
      question,
      answer: answers.join('\n') || '<p>Nội dung đang cập nhật.</p>',
    });
  });

  return { title, intro: introNodes.join('\n'), questions };
}

function buildFaqTemplate(data, templateType = DEFAULT_TEMPLATE) {
  const config = TEMPLATE_CONFIG[templateType] ?? TEMPLATE_CONFIG[DEFAULT_TEMPLATE];
  const introStyle = styleToString(config.introDiv);
  const itemsStyle = styleToString(config.itemsDiv);
  const detailsStyle = styleToString(config.details);
  const summaryStyle = styleToString(config.summary);
  const h3Style = styleToString(config.h3);
  const iconStyle = styleToString(config.span);
  const answerStyle = styleToString(config.answerDiv);
  const paragraphStyle = styleToString(config.p);
  const headingStyle = styleToString(config.h2);
  const introBlock = data.intro ? wrapIntroBlock(data.intro, introStyle) : '';

  const items = data.questions
    .map((item, index) => {
      const openAttr = index === 0 ? ' open' : '';
      const styledAnswer = applyParagraphStyles(item.answer, paragraphStyle);
      const detailsAttr = styleAttr(detailsStyle);
      const summaryAttr = styleAttr(summaryStyle);
      const headingAttr = styleAttr(h3Style);
      const iconAttr = styleAttr(iconStyle);
      const answerAttr = styleAttr(answerStyle);
      return `<details${detailsAttr}${openAttr}>
  <summary${summaryAttr}>
    <h3${headingAttr}>${item.question}</h3>
    <span${iconAttr}>▾</span>
  </summary>
  <div${answerAttr}>
    ${styledAnswer}
  </div>
</details>`;
    })
    .join('\n');

  const headingAttr = styleAttr(headingStyle);
  const itemsAttr = styleAttr(itemsStyle);
  const content = `<h2${headingAttr}>${data.title}</h2>
${introBlock}
<div${itemsAttr}>
  ${items}
</div>`;

  return content;
}

function wrapIntroBlock(html, baseStyle) {
  const trimmed = html.trim();
  if (!trimmed) return '';
  if (!baseStyle) {
    return /^<div/i.test(trimmed) ? trimmed : `<div>${html}</div>`;
  }
  if (/^<div/i.test(trimmed) && /style="/i.test(trimmed)) {
    return trimmed.replace(/style="([^"]*)"/i, (_, existing) => {
      const merged = mergeInlineStyles(existing, baseStyle);
      return `style="${merged}"`;
    });
  }
  if (/^<div/i.test(trimmed)) {
    return trimmed.replace('<div', `<div style="${baseStyle}"`);
  }
  return `<div${styleAttr(baseStyle)}>${html}</div>`;
}

function mergeInlineStyles(existing, addition) {
  if (!existing && !addition) return '';
  if (existing && !addition) return existing;
  if (!existing && addition) return addition;
  const normalizedExisting = existing.trim().replace(/;?\s*$/, ';');
  return `${normalizedExisting}${addition}`;
}

function applyParagraphStyles(html, paragraphStyle) {
  if (!html) return html;
  if (!paragraphStyle) return html;
  return html.replace(/<p([^>]*)>/gi, (match, attrs) => {
    if (/style="/i.test(attrs)) {
      return match.replace(/style="([^"]*)"/i, (styleMatch, existingStyle) => {
        const merged = mergeInlineStyles(existingStyle, paragraphStyle);
        return `style="${merged}"`;
      });
    }
    return `<p style="${paragraphStyle}"${attrs}>`;
  });
}

function styleToString(style) {
  if (!style) return '';
  if (typeof style === 'string') return style;
  return Object.entries(style)
    .map(([property, value]) => `${camelToKebab(property)}:${value}`)
    .join(';');
}

function camelToKebab(value) {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function styleAttr(style) {
  if (!style) return '';
  return ` style="${style}"`;
}

export default FaqsGenerator;
