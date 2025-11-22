import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { cloneVariantDefaults, VARIANT_DEFAULTS, buildButtonMarkup, DEFAULT_PREVIEW_TEXT } from '../utils';

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

export function useBlogButtonGenerator() {
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [variantSettings, setVariantSettings] = useState(() => cloneVariantDefaults());

  const currentVariantConfig = useMemo(() => {
    return variantSettings[formValues.variant] || VARIANT_DEFAULTS.jwl;
  }, [formValues.variant, variantSettings]);

  const buttonMarkup = useMemo(() => {
    return buildButtonMarkup(formValues, currentVariantConfig);
  }, [formValues, currentVariantConfig]);

  const previewMarkup = useMemo(() => {
    return `
      <div class="preview-block">
        <p class="preview-text">${DEFAULT_PREVIEW_TEXT}</p>
        ${buttonMarkup}
        <p class="preview-text">
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
  };

  const handleResetForm = () => {
    setFormValues(INITIAL_FORM);
    setVariantSettings(cloneVariantDefaults());
  };

  const handleCopyMarkup = async () => {
    try {
      await navigator.clipboard.writeText(buttonMarkup.trim());
      toast.success('Đã copy button HTML vào clipboard', { position: 'top-right', autoClose: 2000 });
    } catch (error) {
      console.error(error);
      toast.error('Copy thất bại, hãy thử lại', { position: 'top-right', autoClose: 2000 });
    }
  };

  return {
    formValues,
    variantSettings,
    currentVariantConfig,
    buttonMarkup,
    previewMarkup,
    handleInputChange,
    handleCheckboxChange,
    handleVariantFieldChange,
    handleResetVariant,
    handleLoadSample,
    handleResetForm,
    handleCopyMarkup,
  };
}
