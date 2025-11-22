import AUTHOR_PRESETS from './authorPresets';

export { AUTHOR_PRESETS };

export function getInitialState() {
  return {
    authorName: '',
    authorImageUrl: '',
    authorDescription: '',
    authorTagUrl: '',
  };
}

export function getSampleState() {
  return AUTHOR_PRESETS[0]?.formData || getInitialState();
}

export function buildTemplate(data) {
  const safe = {
    authorName: fallback(data.authorName, '{{ authorName }}'),
    authorImageUrl: fallback(data.authorImageUrl, '{{ authorImageUrl }}'),
    authorDescription: fallback(data.authorDescription, '{{ authorDescription }}'),
    authorTagUrl: fallback(data.authorTagUrl, '{{ authorTagUrl }}'),
  };

  return `<div
  style="
    display:flex;
    gap:24px;
    align-items:flex-start;
    border:1px solid #e5e5e5;
    border-radius:16px;
    padding:24px;
    background-color:#ffffff;
  "
>
  <div style="flex:0 0 96px; width:96px; height:96px;">
    <img
      src="${safe.authorImageUrl}"
      alt="${safe.authorName}"
      style="
        width:96px;
        height:96px;
        border-radius:50%;
        object-fit:cover;
        display:block;
      "
      loading="lazy"
    />
  </div>
  <div style="flex:1; min-width:0;">
    <p style="margin:0 0 8px;">
      <b>${safe.authorName}</b> 
    </p>
    <div style="margin:0 0 16px;">
      <p style="margin:0;">
        ${safe.authorDescription}
      </p>
    </div>
    <a
      target="_blank"
      href="${safe.authorTagUrl}"
      style="
        display:inline-flex;
        align-items:center;
        gap:6px;
        text-decoration:none;
      "
    >
      <span>View articles by ${safe.authorName}</span>
      <span aria-hidden="true">→</span>
    </a>
  </div>
</div>`;
}

export function fallback(value, placeholder) {
  const trimmed = value.trim();
  return trimmed ? trimmed : placeholder;
}

export function hasUserInput(data) {
  return (
    data.authorName.trim() ||
    data.authorImageUrl.trim() ||
    data.authorDescription.trim() ||
    data.authorTagUrl.trim()
  );
}
