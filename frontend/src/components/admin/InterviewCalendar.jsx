import { useEffect, useState } from 'react';
import api from '../../api';

export default function InterviewCalendar() {
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/api/interviews');
        setInterviews(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load interviews');
      }
    };
    fetchInterviews();
  }, []);

  return (
    <div style={{ padding: 32, color: '#fff' }}>
      <h3 style={{ marginBottom: 16 }}>Scheduled Interviews</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {interviews.map(i => (
          <li key={i.id} style={{ marginBottom: 8 }}>
            {new Date(i.scheduled_at).toLocaleString()} - {i.location}
          </li>
        ))}
      </ul>
    </div>
  );
}
