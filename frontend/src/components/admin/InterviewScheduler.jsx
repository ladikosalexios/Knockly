import { useEffect, useState } from 'react';
import api from '../../api';

export default function InterviewScheduler({ jobApplicationId }) {
  const [interviews, setInterviews] = useState([]);
  const [form, setForm] = useState({ id: null, scheduled_at: '', location: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobApplicationId) return;
    const fetchInterviews = async () => {
      try {
        const res = await api.get(`/api/interviews?job_application_id=${jobApplicationId}`);
        setInterviews(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch interviews');
      }
    };
    fetchInterviews();
  }, [jobApplicationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        const res = await api.put(`/api/interviews/${form.id}`, { interview: form });
        setInterviews(prev => prev.map(i => i.id === res.data.id ? res.data : i));
      } else {
        const payload = { ...form, job_application_id: jobApplicationId };
        const res = await api.post('/api/interviews', { interview: payload });
        setInterviews(prev => [...prev, res.data]);
      }
      setForm({ id: null, scheduled_at: '', location: '', notes: '' });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to save interview');
    }
  };

  const toLocalInput = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0,16);
  };

  const startEdit = (interview) => {
    setForm({
      id: interview.id,
      scheduled_at: toLocalInput(interview.scheduled_at),
      location: interview.location || '',
      notes: interview.notes || ''
    });
  };

  return (
    <div style={{ padding: 32, color: '#fff' }}>
      <h3 style={{ marginBottom: 16 }}>Interview Scheduler</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <input
          type="datetime-local"
          value={form.scheduled_at}
          onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
          required
        />
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
        />
        <button type="submit">{form.id ? 'Update' : 'Create'}</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {interviews.map(i => (
          <li key={i.id} style={{ marginBottom: 16, border: '1px solid #444', padding: 12, borderRadius: 8 }}>
            <div><strong>{new Date(i.scheduled_at).toLocaleString()}</strong> @ {i.location}</div>
            {i.notes && <div style={{ marginTop: 4 }}>{i.notes}</div>}
            <button onClick={() => startEdit(i)} style={{ marginTop: 8 }}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
