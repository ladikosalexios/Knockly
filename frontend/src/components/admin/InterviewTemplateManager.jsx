import { useEffect, useState } from 'react';
import api from '../../api';

export default function InterviewTemplateManager({ jobId }) {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ title: '', questions: '' });
  const [error, setError] = useState('');

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/api/interview_templates', { params: { job_id: jobId } });
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load templates');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/interview_templates', {
        interview_template: {
          title: form.title,
          questions: form.questions.split('\n'),
          job_id: jobId
        }
      });
      setForm({ title: '', questions: '' });
      fetchTemplates();
    } catch (err) {
      console.error(err);
      setError('Failed to save template');
    }
  };

  return (
    <div style={{ padding: 32, color: '#fff' }}>
      <h3>Interview Templates</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Questions (one per line)"
          value={form.questions}
          onChange={e => setForm({ ...form, questions: e.target.value })}
        />
        <button type="submit">Create</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {templates.map(t => (
          <li key={t.id} style={{ marginBottom: 16, border: '1px solid #444', padding: 12, borderRadius: 8 }}>
            <strong>{t.title}</strong>
            {t.questions && t.questions.length > 0 && (
              <ol style={{ marginTop: 8 }}>
                {t.questions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
