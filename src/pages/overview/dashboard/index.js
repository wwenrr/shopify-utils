import React, { useMemo, useState } from 'react';
import { useDashboardStats } from './hooks';
import { shortHash, getTypeLabel, getTypeStyle, formatRelativeTimestamp, formatAbsoluteTimestamp, formatTimeOnly, getAuthorAvatar, groupCommitsByDay } from './utils';
import LimitSelect from './components/LimitSelect';
import CommitChart from './components/CommitChart';
import styles from './index.module.css';

const DEFAULT_LIMIT = 10;

function DashboardPage() {
  const { commits, status, latestUpdateDate } = useDashboardStats();
  const [limit, setLimit] = useState(String(DEFAULT_LIMIT));

  const displayedCommits = useMemo(() => {
    if (limit === 'all') {
      return commits;
    }
    const limitNum = parseInt(limit, 10);
    return commits.slice(0, limitNum);
  }, [commits, limit]);

  const commitGroups = useMemo(() => {
    return groupCommitsByDay(displayedCommits);
  }, [displayedCommits]);

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

    let rowIndex = 0;

    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Hash</th>
              <th>Type</th>
              <th>Author</th>
              <th>Time</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {commitGroups.map((group) => (
              <React.Fragment key={group.key}>
                <tr className={styles.dayGroupHeader}>
                  <td colSpan="6" className={styles.dayGroupCell}>
                    {group.label}
                  </td>
                </tr>
                {group.commits.map((commit) => {
                  rowIndex += 1;
                  return (
                    <tr key={commit.hash}>
                      <td data-label="#">{rowIndex}</td>
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
                      <td data-label="Author" className={styles.authorCell}>
                        {getAuthorAvatar(commit.author) ? (
                          <img
                            src={getAuthorAvatar(commit.author)}
                            alt={commit.author}
                            className={styles.authorAvatar}
                          />
                        ) : (
                          <span>{commit.author}</span>
                        )}
                      </td>
                      <td data-label="Time">{formatTimeOnly(commit.date)}</td>
                      <td data-label="Description" className={styles.messageCell}>
                        {commit.message}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [commitGroups, status, commits.length]);

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
        <CommitChart commits={commits} />
      </section>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div>
            <p className={styles.eyebrow}>Commit log</p>
            <h2>Lịch sử commit mới nhất</h2>
          </div>
          <div className={styles.headerActions}>
            <LimitSelect value={limit} onChange={setLimit} />
            <span className={styles.metaBadge}>
              {displayedCommits.length} / {commits.length} bản ghi
            </span>
          </div>
        </header>
        {commitTable}
      </section>
    </div>
  );
}

export default DashboardPage;
