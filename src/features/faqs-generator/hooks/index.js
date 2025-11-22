import { useEffect, useRef, useState } from 'react';
import {
  SAMPLE_HTML,
  normalizeInput,
  isLikelyHtml,
  parseHtml,
  extractFaqData,
  buildFaqTemplate,
} from '@/features/faqs-generator/utils';

export function useFaqsGenerator() {
  const [input, setInput] = useState('');
  const [outputHtml, setOutputHtml] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [inlineAlert, setInlineAlert] = useState({ message: '', type: 'error', visible: false });
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

  const handleScan = (rawInput) => {
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

    const html = buildFaqTemplate(faqData);
    setLastFaqData(faqData);
    setPreviewHtml(html);
    setOutputHtml(html);
    showAlert('Đã tạo FAQs preview thành công.', 'success');
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_HTML);
    handleScan(SAMPLE_HTML);
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

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleScanClick = () => {
    handleScan(input);
  };

  useEffect(() => {
    setInput(SAMPLE_HTML);
    handleScan(SAMPLE_HTML);
  }, []);

  return {
    input,
    outputHtml,
    previewHtml,
    inlineAlert,
    handleInputChange,
    handlePaste,
    handleScanClick,
    handleLoadSample,
    handleClearInput,
    handleCopyHtml,
  };
}
