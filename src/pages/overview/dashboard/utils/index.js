import commitTypeMap from '@/constants/config/commitTypes.json';
import { AUTHOR_AVATARS } from '@/constants/config/authorAvatars';

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

export function formatTimeOnly(isoString) {
  if (!isoString) {
    return '—';
  }

  try {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    return isoString;
  }
}

export function getAuthorAvatar(authorName) {
  if (!authorName) return null;
  return AUTHOR_AVATARS[authorName] || null;
}

function getDateKey(dateString) {
  if (!dateString) return 'unknown';
  
  const date = new Date(dateString);
  const dateStr = date.toDateString();
  return dateStr;
}

function formatDayGroupLabel(dateString) {
  if (!dateString) return 'Không xác định';
  
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateStr = date.toDateString();
  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();
  
  const dayOfWeek = date.getDay();
  const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const dayName = dayNames[dayOfWeek];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  if (dateStr === todayStr) {
    return `Hôm nay - ${dayName}, ${day} thg ${month}, ${year}`;
  }
  if (dateStr === yesterdayStr) {
    return `Hôm qua - ${dayName}, ${day} thg ${month}, ${year}`;
  }
  
  return `${dayName}, ${day} thg ${month}, ${year}`;
}

export function groupCommitsByDay(commits) {
  const groups = {};
  
  commits.forEach((commit) => {
    const key = getDateKey(commit.date);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(commit);
  });
  
  const sortedGroups = Object.entries(groups).map(([key, items]) => ({
    key,
    label: formatDayGroupLabel(items[0]?.date),
    date: items[0]?.date,
    commits: items,
  }));
  
  sortedGroups.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date) - new Date(a.date);
  });
  
  return sortedGroups;
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const startOfWeek = new Date(d);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

function getStartOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfYear(date) {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatChartDate(date, period) {
  const d = new Date(date);
  if (period === 'week') {
    const day = d.getDate();
    const month = d.getMonth() + 1;
    return `${day}/${month}`;
  }
  if (period === 'month') {
    const day = d.getDate();
    return `${day}`;
  }
  if (period === 'year') {
    const month = d.getMonth() + 1;
    return `Tháng ${month}`;
  }
  return '';
}

export function getCommitStatsByPeriod(commits, period, customStartDate = null, customEndDate = null) {
  const now = new Date();
  let startDate;
  let endDate = now;
  let dateKeyFn;
  let formatFn;
  
  if (period === 'custom' && customStartDate && customEndDate) {
    startDate = new Date(customStartDate);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(customEndDate);
    endDate.setHours(23, 59, 59, 999);
    
    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      dateKeyFn = (date) => {
        const d = new Date(date);
        return d.toDateString();
      };
      formatFn = (date) => formatChartDate(date, 'week');
    } else if (diffDays <= 31) {
      dateKeyFn = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      };
      formatFn = (date) => formatChartDate(date, 'month');
    } else {
      dateKeyFn = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${d.getMonth()}`;
      };
      formatFn = (date) => formatChartDate(date, 'year');
    }
  } else if (period === 'week') {
    startDate = getStartOfWeek(now);
    dateKeyFn = (date) => {
      const d = new Date(date);
      return d.toDateString();
    };
    formatFn = (date) => formatChartDate(date, 'week');
  } else if (period === 'month') {
    startDate = getStartOfMonth(now);
    dateKeyFn = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    };
    formatFn = (date) => formatChartDate(date, 'month');
  } else {
    startDate = getStartOfYear(now);
    dateKeyFn = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    };
    formatFn = (date) => formatChartDate(date, 'year');
  }
  
  const stats = {};
  
  commits.forEach((commit) => {
    if (!commit.date) return;
    
    const commitDate = new Date(commit.date);
    if (commitDate < startDate || commitDate > endDate) return;
    
    const key = dateKeyFn(commit.date);
    if (!stats[key]) {
      stats[key] = {
        date: commit.date,
        count: 0,
        label: formatFn(commit.date),
      };
    }
    stats[key].count += 1;
  });
  
  const result = Object.values(stats);
  result.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return result;
}

