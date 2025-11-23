import { useState, useEffect } from 'react';
import styles from './InsertModal.module.css';

function formatHtml(html) {
  if (!html || !html.trim()) {
    return '';
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html.trim(), 'text/html');
    
    if (doc.querySelector('parsererror')) {
      return html;
    }

    function formatElement(element, indent = 0) {
      const indentStr = '  '.repeat(indent);
      const tagName = element.tagName.toLowerCase();
      const attributes = Array.from(element.attributes)
        .map(attr => `${attr.name}="${attr.value}"`)
        .join(' ');
      const attrsStr = attributes ? ` ${attributes}` : '';
      
      if (element.children.length === 0) {
        const text = element.textContent?.trim() || '';
        if (text) {
          return `${indentStr}<${tagName}${attrsStr}>${text}</${tagName}>`;
        } else {
          return `${indentStr}<${tagName}${attrsStr} />`;
        }
      }

      let result = `${indentStr}<${tagName}${attrsStr}>\n`;
      
      const children = Array.from(element.childNodes);
      for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          result += formatElement(child, indent + 1) + '\n';
        } else if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent?.trim();
          if (text) {
            result += '  '.repeat(indent + 1) + text + '\n';
          }
        }
      }
      
      result += `${indentStr}</${tagName}>`;
      return result;
    }

    const body = doc.body;
    if (!body || body.children.length === 0) {
      return html;
    }

    const formatted = Array.from(body.children)
      .map(child => formatElement(child, 0))
      .join('\n');

    return formatted;
  } catch (error) {
    console.error('Error formatting HTML:', error);
    return html;
  }
}

function InsertModal({ isOpen, onClose, onInsert, mode = 'insert', initialValue = '' }) {
  const [htmlInput, setHtmlInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialValue) {
        const formatted = formatHtml(initialValue);
        setHtmlInput(formatted);
      } else {
        setHtmlInput('');
      }
    }
  }, [isOpen, mode, initialValue]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (htmlInput.trim()) {
      onInsert(htmlInput.trim());
      setHtmlInput('');
    }
  };

  const handleCancel = () => {
    setHtmlInput('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={`${styles.modal} ${mode === 'edit' ? styles.modalLarge : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{mode === 'edit' ? 'Chỉnh sửa HTML Block' : 'Chèn HTML Block Mới'}</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleCancel}
            aria-label="Đóng"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            <span>Nhập HTML để chèn:</span>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              onPaste={(e) => {
                const pastedText = e.clipboardData.getData('text');
                if (pastedText) {
                  e.preventDefault();
                  const formatted = formatHtml(pastedText);
                  setHtmlInput(formatted);
                }
              }}
              className={`${styles.textarea} ${mode === 'edit' ? styles.textareaLarge : ''}`}
              rows={mode === 'edit' ? 20 : 12}
              placeholder="<div>Nội dung HTML...</div>"
              autoFocus
              spellCheck={false}
            />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={handleCancel}>
              Hủy
            </button>
            <button type="submit" className={styles.submitButton} disabled={!htmlInput.trim()}>
              {mode === 'edit' ? 'Lưu' : 'Chèn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InsertModal;

