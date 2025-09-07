import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../../api';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/analytics');
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load analytics');
      }
    };
    fetchData();
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return <p>Loading...</p>;

  const jobStatusData = Object.entries(data.job_status_distribution).map(([status, count]) => ({ status, count }));
  const appStatusData = Object.entries(data.application_status_distribution).map(([status, count]) => ({ status, count }));
  const funnelData = Object.entries(data.conversion_rates || {}).map(([stage, rate]) => ({
    stage: stage.replace('_to_', '→'),
    rate: (rate * 100).toFixed(2),
  }));
  const timeData = Object.entries(data.median_stage_times || {}).map(([stage, secs]) => ({
    stage,
    hours: (secs / 3600).toFixed(2),
  }));

  return (
    <div style={{ padding: 32, color: '#fff', backgroundColor: '#1e1e1e' }}>
      <h3>Analytics Dashboard</h3>
      <div style={{ marginBottom: 24 }}>
        <p>Users: {data.users_count}</p>
        <p>Companies: {data.companies_count}</p>
        <p>Jobs: {data.jobs_count}</p>
        <p>Applications: {data.job_applications_count}</p>
        <p>
          Avg Job Lifespan: {(data.avg_job_post_lifespan / 86400).toFixed(2)} days
        </p>
        <p>
          Avg Application Processing Time:{' '}
          {(data.avg_application_processing_time / 3600).toFixed(2)} hours
        </p>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ width: 300, height: 300 }}>
          <h4>Job Status Distribution</h4>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={jobStatusData} dataKey="count" nameKey="status" label>
                {jobStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: 400, height: 300 }}>
          <h4>Application Status Distribution</h4>
          <ResponsiveContainer>
            <BarChart data={appStatusData}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
        <div style={{ width: 400, height: 300 }}>
          <h4>Funnel Conversion Rates (%)</h4>
          <ResponsiveContainer>
            <BarChart data={funnelData}>
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rate" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: 400, height: 300 }}>
          <h4>Median Time to Stage (hours)</h4>
          <ResponsiveContainer>
            <BarChart data={timeData}>
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

