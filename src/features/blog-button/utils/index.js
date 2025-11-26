export const VARIANT_DEFAULTS = {
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

export const VARIANT_FIELDS = [
  { id: 'backgroundColor', label: 'Nền', type: 'color' },
  { id: 'textColor', label: 'Màu chữ', type: 'color' },
  { id: 'borderColor', label: 'Màu viền', type: 'color' },
  { id: 'borderRadius', label: 'Bo góc', type: 'text', placeholder: 'Ví dụ: 999px' },
  { id: 'fontFamily', label: 'Font family', type: 'text', placeholder: "'Inter',sans-serif" },
  { id: 'hoverBackgroundColor', label: 'Hover nền', type: 'color' },
  { id: 'hoverTextColor', label: 'Hover chữ', type: 'color' },
  { id: 'hoverBorderColor', label: 'Hover viền', type: 'color' },
];

export const DEFAULT_PREVIEW_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.';

export function cloneVariantDefaults() {
  return JSON.parse(JSON.stringify(VARIANT_DEFAULTS));
}

export function buildButtonMarkup(values, variantConfig) {
  const targetAttr = values.target ? ' target="_blank" rel="noopener noreferrer"' : '';
  const buttonStyle = [
    'display:inline-flex',
    'align-items:center',
    'justify-content:center',
    'text-align:center',
    'padding:14px 32px',
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
