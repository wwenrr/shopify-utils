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
  "

  class="custom-author-generator"
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
        font-style:italic;
      "
    >
      <span>View articles by ${safe.authorName}</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:16px;height:16px;display:block;flex-shrink:0;" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
      </svg>
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
