import { useMemo } from 'react';
import { useDashboardStats } from './hooks';
import { shortHash, getTypeLabel, getTypeStyle, formatRelativeTimestamp, formatAbsoluteTimestamp } from './utils';
import styles from './index.module.css';

function DashboardPage() {
  const { commits, status, latestUpdateDate } = useDashboardStats();

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

    const rows = commits;

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
          <span className={styles.metaBadge}>{commits.length} bản ghi</span>
        </header>
        {commitTable}
      </section>
    </div>
  );
}

export default DashboardPage;
