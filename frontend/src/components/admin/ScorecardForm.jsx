import { useEffect, useState } from 'react';
import api from '../../api';

export default function ScorecardForm({ interviewId, onSubmitted }) {
  const [template, setTemplate] = useState(null);
  const [responses, setResponses] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await api.get(`/api/interviews/${interviewId}`);
        const tpl = res.data.interview_template;
        setTemplate(tpl);
        const initial = {};
        (tpl?.questions || []).forEach((q, idx) => {
          initial[idx] = '';
        });
        setResponses(initial);
      } catch (err) {
        console.error(err);
        setError('Failed to load template');
      }
    };
    fetchTemplate();
  }, [interviewId]);

  const handleChange = (idx, value) => {
    setResponses(prev => ({ ...prev, [idx]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/scorecards', {
        scorecard: {
          interview_id: interviewId,
          interview_template_id: template.id,
          responses
        }
      });
      onSubmitted && onSubmitted();
    } catch (err) {
      console.error(err);
      setError('Failed to submit scorecard');
    }
  };

  if (!template) return <p style={{ color: '#fff' }}>Loading...</p>;

  return (
    <div style={{ padding: 32, color: '#fff' }}>
      <h3>Scorecard for {template.title}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(template.questions || []).map((q, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
            <label>{q}</label>
            <textarea
              value={responses[idx] || ''}
              onChange={e => handleChange(idx, e.target.value)}
              required
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
