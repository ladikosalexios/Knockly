import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../api';

export default function InterviewScheduler({ jobApplicationId, applicantName = '', onScheduled }) {
  const [interviews, setInterviews] = useState([]);
  const [form, setForm] = useState({ id: null, scheduled_at: null, location: '', notes: '' });
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
        const payload = { ...form, scheduled_at: form.scheduled_at?.toISOString() };
        const res = await api.put(`/api/interviews/${form.id}`, { interview: payload });
        setInterviews(prev => prev.map(i => i.id === res.data.id ? res.data : i));
      } else {
        const payload = {
          ...form,
          scheduled_at: form.scheduled_at?.toISOString(),
          job_application_id: jobApplicationId
        };
        const res = await api.post('/api/interviews', { interview: payload });
        setInterviews(prev => [...prev, res.data]);
        onScheduled && onScheduled();
      }
      setForm({ id: null, scheduled_at: null, location: '', notes: '' });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to save interview');
    }
  };

  const startEdit = (interview) => {
    setForm({
      id: interview.id,
      scheduled_at: new Date(interview.scheduled_at),
      location: interview.location || '',
      notes: interview.notes || ''
    });
  };

  return (
    <div style={{ padding: 32, color: '#fff' }}>
      <h3 style={{ marginBottom: 16 }}>Interview Scheduler</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <DatePicker
          selected={form.scheduled_at}
          onChange={date => setForm({ ...form, scheduled_at: date })}
          showTimeSelect
          timeIntervals={30}
          dateFormat="Pp"
          placeholderText="Select date and time"
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
            <div>
              <strong>{new Date(i.scheduled_at).toLocaleString()}</strong> @ {i.location}
            </div>
            <div style={{ marginTop: 4 }}>
              With {applicantName || i.job_application?.name || 'applicant'}
            </div>
            {i.notes && <div style={{ marginTop: 4 }}>{i.notes}</div>}
            <button onClick={() => startEdit(i)} style={{ marginTop: 8 }}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
