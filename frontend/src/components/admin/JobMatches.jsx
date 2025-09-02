import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

export default function JobMatches() {
  const { id: jobId } = useParams();
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <strong style={{ flex: 1 }}>{m.name}</strong>
              <span style={{ marginRight: 8 }}>{m.score?.toFixed ? m.score.toFixed(1) : m.score}%</span>
              <button onClick={() => setOpenId(openId === m.id ? null : m.id)}>
                {openId === m.id ? 'Hide' : 'Details'}
              </button>
            </div>
            {openId === m.id && (
              <div style={{ marginTop: 8, paddingLeft: 16 }}>
                {m.reason && <p><strong>Reason:</strong> {m.reason}</p>}
                {m.breakdown && (
                  <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
                    <li>Skill overlap: {m.breakdown.skill_overlap ?? 'N/A'}%</li>
                    <li>Experience: {m.breakdown.experience ?? 'N/A'}%</li>
                    <li>Location: {m.breakdown.location ?? 'N/A'}%</li>
                  </ul>
                )}
                {m.explanation && <p>{m.explanation}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
