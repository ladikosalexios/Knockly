import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

export default function JobMatches() {
  const { id: jobId } = useParams();
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get(`/api/jobs/${jobId}/matches`);
        setMatches(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch job matches');
      }
    };
    if (jobId) {
      fetchMatches();
    }
  }, [jobId]);

  if (!jobId) return null;

  return (
    <div style={{ padding: 32, color: '#fff' }}>
      <h2>Top Candidates</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {matches.map(m => (
          <li key={m.id} style={{ marginBottom: 12 }}>
            <strong>{m.name}</strong> – {(m.score * 100).toFixed(1)}%
          </li>
        ))}
      </ul>
    </div>
  );
}
