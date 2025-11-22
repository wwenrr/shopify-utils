import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getInitialState, getSampleState, buildTemplate, hasUserInput, AUTHOR_PRESETS } from '../utils';

export function useAuthorGenerator() {
  const [formData, setFormData] = useState(getInitialState);
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
  }, [template]);

  return {
    formData,
    copyStatus,
    selectedPreset,
    template,
    hasContent,
    handleInputChange,
    handleLoadSample,
    handleClear,
    handlePresetChange,
    handleCopy,
  };
}
