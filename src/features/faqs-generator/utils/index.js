import { TEMPLATE_CONFIG } from './constants';

export { SAMPLE_HTML, TEMPLATE_CONFIG } from './constants';

export function normalizeInput(content) {
  if (/&lt;|&gt;|&amp;|&quot;|&#39;/i.test(content)) {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = content;
    return decoder.value;
  }
  return content;
}

export function isLikelyHtml(content) {
  return /<([a-z][\s\S]*?)>/i.test(content);
}

export function parseHtml(content) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  if (doc.querySelector('parsererror')) {
    return null;
  }
  return doc;
}

export function extractFaqData(doc) {
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

export function buildFaqTemplate(data) {
  const config = TEMPLATE_CONFIG;
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