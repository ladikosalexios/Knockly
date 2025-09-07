import { useEffect, useState } from 'react';
import api from '../../api';

export default function InterviewTemplateManager({ jobId, jobs: initialJobs = [] }) {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ title: '', questions: '', jobId: jobId || initialJobs[0]?.id || '' });
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState(initialJobs);

  useEffect(() => {
    const loadJobs = async () => {
      if (jobId || jobs.length) return;
      try {
        const res = await api.get('/api/admin/dashboard');
        setJobs(res.data);
        if (res.data[0]) {
          setForm(f => ({ ...f, jobId: res.data[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadJobs();
  }, [jobId, jobs.length]);

  useEffect(() => {
    if (!jobId && initialJobs.length) {
      setForm(f => ({ ...f, jobId: initialJobs[0].id }));
    }
  }, [initialJobs, jobId]);

  const fetchTemplates = async () => {
    try {
      const params = form.jobId ? { params: { job_id: form.jobId } } : undefined;
      const res = await api.get('/api/interview_templates', params);
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load templates');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [form.jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/interview_templates', {
        interview_template: {
          title: form.title,
          questions: form.questions.split('\n'),
          job_id: form.jobId
        }
      });
      setForm(f => ({ ...f, title: '', questions: '' }));
      fetchTemplates();
    } catch (err) {
      console.error(err);
      setError('Failed to save template');
    }
  };

  return (
    <div style={{ padding: 32, color: '#fff' }}>
      <h3>Interview Templates</h3>
      {jobs.length > 0 && !jobId && (
        <select
          value={form.jobId}
          onChange={e => setForm({ ...form, jobId: e.target.value })}
          style={{ marginBottom: 16 }}
        >
          {jobs.map(j => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
      )}
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
        <button type="submit" disabled={!form.jobId}>Create</button>
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
