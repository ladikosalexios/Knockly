import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

export default function JobMatches() {
  const { jobId } = useParams();
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get(`/api/jobs/${jobId}/matches`);
        setMatches(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load matches');
      }
    };
    fetchMatches();
  }, [jobId]);

  return (
    <div style={{ padding: 32, color: '#fff' }}>
      <h2 style={{ marginBottom: 24 }}>Top Matches for Job #{jobId}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {matches.map((m, idx) => (
            <div key={m.applicant_profile.id} style={{
              background: '#222',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #444'
            }}>
              <strong>{idx + 1}. {m.applicant_profile.name}</strong>
              <span style={{ marginLeft: 8 }}>Score: {m.score.toFixed ? m.score.toFixed(2) : m.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
