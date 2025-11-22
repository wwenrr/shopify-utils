import commitTypeMap from '@/constants/config/commitTypes.json';

export function shortHash(hash) {
  return hash ? hash.slice(0, 7) : '—';
}

export function getTypeMeta(type) {
  return commitTypeMap[type] || commitTypeMap.other;
}

export function getTypeLabel(type) {
  return getTypeMeta(type).label;
}

export function getTypeStyle(type) {
  const meta = getTypeMeta(type);
  return {
    color: meta.color,
    backgroundColor: meta.background,
  };
}

export function formatRelativeTimestamp(isoString) {
  if (!isoString) {
    return '—';
  }

  const target = new Date(isoString);
  const now = new Date();
  const diffSeconds = Math.max(0, Math.floor((now.getTime() - target.getTime()) / 1000));

  if (diffSeconds < 60) {
    return `${diffSeconds} giây trước`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} ngày trước`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} tháng trước`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} năm trước`;
}

export function formatAbsoluteTimestamp(isoString) {
  if (!isoString) {
    return '—';
  }

  try {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day} thg ${month}, ${year}`;
  } catch (error) {
    return isoString;
  }
}

