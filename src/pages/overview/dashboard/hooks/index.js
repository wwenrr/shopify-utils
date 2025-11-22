import { useEffect, useMemo, useState } from 'react';

const STATS_ENDPOINT = `${process.env.PUBLIC_URL}/feature-stats.json`;

export function useDashboardStats() {
  const [stats, setStats] = useState([]);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [commits, setCommits] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      setStatus('loading');
      try {
        const response = await fetch(`${STATS_ENDPOINT}?ts=${Date.now()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Không thể tải file feature-stats.json');
        }
        const data = await response.json();
        setStats(Array.isArray(data.features) ? data.features : []);
        const allCommits = Array.isArray(data.commits) ? data.commits : [];
        const filteredCommits = allCommits.filter(
          (commit) => commit.author && !commit.author.includes('github-actions[bot]')
        );
        setCommits(filteredCommits);
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

  return {
    stats,
    commits,
    status,
    latestUpdateDate,
  };
}

