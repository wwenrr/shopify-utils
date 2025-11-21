import { useEffect, useRef, useState } from 'react';
import styles from './FaqsGenerator.module.css';

const SAMPLE_HTML = `<h2>5. FAQs - People also asked about best sleeves for Pokémon cards</h2>
<p>Before wrapping up, let’s answer some common questions collectors and players ask about the best sleeves for Pokémon cards.</p>
<h3>5.1 Which sleeves to use for Pokémon cards?</h3>
<p>Pokémon cards fit standard-size sleeves, typically 63.5mm x 88mm. Choose high-quality brands like Dragon Shield or KMC for maximum protection.</p>
<h3>5.2 Are official Pokémon sleeves better?</h3>
<p>Official Pokémon sleeves are attractive but not the most durable. We would consider them weaker than premium brands, so they are best for casual use or display.</p>
<h3>5.3 What are the rules for Pokémon card sleeves?</h3>
<p>Tournament rules require sleeves to be uniform, opaque, and free from markings. Clear sleeves are allowed for storage, but competitive play usually demands consistency.</p>
<h3>5.4 Should I double penny sleeve Pokémon cards?</h3>
<p>Yes, double-sleeving with penny sleeves inside and a durable outer sleeve provides maximum protection against dirt, moisture, and bending.</p>
<h3>5.5 Why are Dragon Shield sleeves the best?</h3>
<p>Dragon Shield sleeves are 120 microns thick, making them the thickest on the market. Their durability and shuffle feel make them a favorite among competitive players.</p>`;

const DEFAULT_TEMPLATE = 'jwl';

const TEMPLATE_CONFIG = {
  jwl: {
    heading: "font-size:1.5rem;font-weight:600;font-family:'Inter',sans-serif;color:#2B2B2B;margin:0;",
    intro:
      "color:#666666;font-size:16px;line-height:1.7;margin:0;padding-bottom:18px;font-family:'Inter',sans-serif;border-bottom:1px solid #DCDCDC;",
    items: 'display:flex;flex-direction:column;margin:0;padding:0;',
    details: 'border-bottom:1px solid #DCDCDC;padding:18px 0;',
    summary: 'list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;',
    question: "font-size:18px;font-weight:700;font-family:'Inter',sans-serif;color:#333333;margin:0;",
    icon: 'font-size:18px;color:#777777;line-height:1;display:inline-flex;align-items:center;justify-content:center;transition:transform 0.2s ease;',
    answer: "margin-top:12px;color:#555555;line-height:1.7;font-size:16px;font-family:'Inter',sans-serif;",
    paragraph: "font-weight:400;font-family:'Inter',sans-serif;",
    wrapper: '',
  },
  jf: {
    heading:
      "font-size:1.875rem;font-weight:600;letter-spacing:-0.03rem;font-family:'Sofia Sans Semi Condensed',sans-serif;color:#FFFFFF;margin:0;",
    intro:
      "color:#FFFFFF;font-size:16px;line-height:1.7;margin:0;padding-bottom:18px;font-family:'Sofia Sans Semi Condensed',sans-serif;border-bottom:1px solid #FFFFFF;",
    items: 'display:flex;flex-direction:column;margin:0;padding:0;',
    details: 'border-bottom:1px solid #FFFFFF;padding:18px 0;',
    summary:
      "list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;color:#FFFFFF;font-family:'Sofia Sans Semi Condensed',sans-serif;",
    question:
      "font-size:1.125rem;font-weight:400;line-height:1.6;font-family:'Sofia Sans Semi Condensed',sans-serif;color:#FFFFFF;margin:0;",
    icon:
      "font-size:16px;font-weight:400;color:#555555;line-height:1.7;display:inline-flex;align-items:center;justify-content:center;transition:transform 0.2s ease;",
    answer:
      "margin-top:12px;color:#555555;line-height:1.7;font-size:16px;font-family:'Sofia Sans Semi Condensed',sans-serif;",
    paragraph: "font-weight:400;font-family:'Sofia Sans Semi Condensed',sans-serif;color:#555555;line-height:1.7;",
    wrapper: 'background-color:rgb(13,12,12);padding:24px;border-radius:18px;',
  },
};

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
              rows={18}
              placeholder="Nhập HTML FAQs tại đây"
            />
          </label>
          <label className={styles.field}>
            <span>Chọn template</span>
            <select value={templateType} onChange={(event) => setTemplateType(event.target.value)}>
              <option value="jwl">JWL</option>
              <option value="jf">JF</option>
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
  const introBlock = data.intro ? wrapIntroBlock(data.intro, config.intro) : '';

  const items = data.questions
    .map((item, index) => {
      const openAttr = index === 0 ? ' open' : '';
      const detailStyle = config.details;
      const styledAnswer = applyParagraphStyles(item.answer, config.paragraph);
      return `<details style="${detailStyle}"${openAttr}>
  <summary style="${config.summary}">
    <h3 style="${config.question}">${item.question}</h3>
    <span style="${config.icon}">▾</span>
  </summary>
  <div style="${config.answer}">
    ${styledAnswer}
  </div>
</details>`;
    })
    .join('\n');

  const content = `<h2 style="${config.heading}">${data.title}</h2>
${introBlock}
<div style="${config.items}">
  ${items}
</div>`;

  if (config.wrapper) {
    return `<div style="${config.wrapper}">${content}</div>`;
  }

  return content;
}

function wrapIntroBlock(html, baseStyle) {
  const trimmed = html.trim();
  if (!trimmed) return '';
  if (/^<div/i.test(trimmed) && /style="/i.test(trimmed)) {
    return trimmed.replace(/style="([^"]*)"/i, (_, existing) => {
      const merged = mergeInlineStyles(existing, baseStyle);
      return `style="${merged}"`;
    });
  }
  if (/^<div/i.test(trimmed)) {
    return trimmed.replace('<div', `<div style="${baseStyle}"`);
  }
  return `<div style="${baseStyle}">${html}</div>`;
}

function mergeInlineStyles(existing, addition) {
  const normalizedExisting = existing.trim().replace(/;?\s*$/, ';');
  return `${normalizedExisting}${addition}`;
}

function applyParagraphStyles(html, paragraphStyle) {
  if (!html) return html;
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

export default FaqsGenerator;
