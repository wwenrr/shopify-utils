import { useEffect, useMemo, useState } from 'react';
import commitTypeMap from '../../../shared/config/commitTypes.json';
import styles from './DashboardPage.module.css';

function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [commits, setCommits] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      setStatus('loading');
      try {
        const response = await fetch(`/feature-stats.json?ts=${Date.now()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Không thể tải file feature-stats.json');
        }
        const data = await response.json();
        setStats(Array.isArray(data.features) ? data.features : []);
        setCommits(Array.isArray(data.commits) ? data.commits : []);
        setGeneratedAt(data.generatedAt || null);
        setStatus('success');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
          setStatus('error');
        }
      }
    }

    fetchStats();
    return () => controller.abort();
  }, []);

  const latestUpdateDate = useMemo(() => {
    if (commits.length > 0 && commits[0]?.date) {
      return commits[0].date;
    }
    return generatedAt;
  }, [commits, generatedAt]);

  const commitTable = useMemo(() => {
    if (status === 'loading') {
      return null;
    }

    if (status === 'error') {
      return null;
    }

    if (commits.length === 0) {
      return <p className={styles.state}>Chưa có lịch sử commit.</p>;
    }

    const rows = commits.slice(0, 10);

    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Hash</th>
              <th>Type</th>
              <th>Author</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((commit, index) => (
              <tr key={commit.hash}>
                <td data-label="#">{index + 1}</td>
                <td data-label="Hash" className={styles.hashCell}>
                  {shortHash(commit.hash)}
                </td>
                <td data-label="Type">
                  <span
                    className={styles.typeBadge}
                    style={getTypeStyle(commit.type)}
                  >
                    {getTypeLabel(commit.type)}
                  </span>
                </td>
                <td data-label="Author">{commit.author}</td>
                <td data-label="Date">{formatAbsoluteTimestamp(commit.date)}</td>
                <td data-label="Description" className={styles.messageCell}>
                  {commit.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [commits, status]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Shopify Utils</p>
        <h1>Dashboard tổng quan</h1>
        <p>
          Theo dõi lịch sử cập nhật cho từng feature, xem nhanh commit gần nhất và chuẩn bị các
          công cụ hỗ trợ nhập liệu.
        </p>
        <div className={styles.heroMeta}>
          <span>
            Cập nhật: {formatRelativeTimestamp(latestUpdateDate)}
            <span className={styles.metaMuted}> ({formatAbsoluteTimestamp(latestUpdateDate)})</span>
          </span>
        </div>
      </section>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div>
            <p className={styles.eyebrow}>Commit log</p>
            <h2>Lịch sử commit mới nhất</h2>
          </div>
          <span className={styles.metaBadge}>Hiển thị 10 bản ghi</span>
        </header>
        {commitTable}
      </section>
    </div>
  );
}

function shortHash(hash) {
  return hash ? hash.slice(0, 7) : '—';
}

function getTypeMeta(type) {
  return commitTypeMap[type] || commitTypeMap.other;
}

function getTypeLabel(type) {
  return getTypeMeta(type).label;
}

function getTypeStyle(type) {
  const meta = getTypeMeta(type);
  return {
    color: meta.color,
    backgroundColor: meta.background,
  };
}

function formatRelativeTimestamp(isoString) {
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

function formatAbsoluteTimestamp(isoString) {
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

export default DashboardPage;

