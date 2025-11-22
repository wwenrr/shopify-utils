import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCommitStatsByPeriod } from '../utils';
import styles from './CommitChart.module.css';

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Trong tuần' },
  { value: 'month', label: 'Trong tháng' },
  { value: 'year', label: 'Trong năm' },
  { value: 'custom', label: 'Tùy chỉnh' },
];

function getDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}

function getDefaultEndDate() {
  return new Date().toISOString().split('T')[0];
}

function CommitChart({ commits }) {
  const [period, setPeriod] = useState('week');
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  
  const chartData = useMemo(() => {
    if (period === 'custom') {
      return getCommitStatsByPeriod(commits, period, startDate, endDate);
    }
    return getCommitStatsByPeriod(commits, period);
  }, [commits, period, startDate, endDate]);
  
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setStartDate(getDefaultStartDate());
      setEndDate(getDefaultEndDate());
    }
  };
  
  if (commits.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Chưa có dữ liệu để hiển thị</p>
      </div>
    );
  }
  
  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <div>
          <p className={styles.eyebrow}>Thống kê</p>
          <h3 className={styles.title}>Số lượng commit theo thời gian</h3>
        </div>
        <div className={styles.controls}>
          <div className={styles.periodSelector}>
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.periodButton} ${period === option.value ? styles.periodButtonActive : ''}`}
                onClick={() => handlePeriodChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <div className={styles.dateRange}>
              <div className={styles.dateInputGroup}>
                <label className={styles.dateLabel} htmlFor="startDate">
                  Từ ngày
                </label>
                <input
                  id="startDate"
                  type="date"
                  className={styles.dateInput}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </div>
              <div className={styles.dateInputGroup}>
                <label className={styles.dateLabel} htmlFor="endDate">
                  Đến ngày
                </label>
                <input
                  id="endDate"
                  type="date"
                  className={styles.dateInput}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={getDefaultEndDate()}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{
                color: '#1f2937',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '4px',
              }}
              itemStyle={{
                color: '#40c57c',
                fontSize: '14px',
                fontWeight: 600,
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#40c57c"
              strokeWidth={2}
              dot={{ fill: '#40c57c', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CommitChart;

