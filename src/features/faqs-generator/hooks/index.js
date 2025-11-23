import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
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
  const [lastFaqData, setLastFaqData] = useState(null);

  const handleScan = (rawInput) => {
    const raw = rawInput.trim();
    if (!raw) {
      toast.warning('Vui lòng nhập HTML FAQs trước khi scan.', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    const normalized = normalizeInput(raw);
    if (!isLikelyHtml(normalized)) {
      toast.error('Nội dung phải là HTML hợp lệ (có thẻ).', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    const doc = parseHtml(normalized);
    if (!doc) {
      toast.error('Không thể đọc HTML. Vui lòng kiểm tra lại.', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    const faqData = extractFaqData(doc);
    if (!faqData || faqData.questions.length === 0) {
      toast.error('Không tìm thấy thẻ h3 cho câu hỏi. Vui lòng kiểm tra HTML.', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    const html = buildFaqTemplate(faqData);
    setLastFaqData(faqData);
    setPreviewHtml(html);
    setOutputHtml(html);
    toast.success('Đã tạo FAQs preview thành công.', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_HTML);
    handleScan(SAMPLE_HTML);
    toast.success('Đã load sample FAQs.', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleClearInput = () => {
    setInput('');
    setPreviewHtml('');
    setOutputHtml('');
    setLastFaqData(null);
    toast.success('Đã xóa nội dung.', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleCopyHtml = async () => {
    if (!outputHtml.trim()) {
      toast.warning('Chưa có HTML để copy.', {
        position: 'top-right',
        autoClose: 2000,
      });
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
      toast.success('Đã copy FAQs HTML.', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (error) {
      console.error(error);
      toast.error('Không thể copy. Vui lòng thử lại.', {
        position: 'top-right',
        autoClose: 2000,
      });
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
    handleInputChange,
    handlePaste,
    handleScanClick,
    handleLoadSample,
    handleClearInput,
    handleCopyHtml,
  };
}
