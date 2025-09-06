import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../api';

export default function InterviewScheduler({ jobApplicationId, jobId, applicantName = '', onScheduled }) {
  const [interviews, setInterviews] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ id: null, scheduled_at: null, location: '', notes: '', interview_template_id: '' });
  const [error, setError] = useState('');

  const fetchInterviews = async () => {
    if (!jobApplicationId) return;
    try {
      const res = await api.get(`/api/interviews?job_application_id=${jobApplicationId}`);
      setInterviews(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch interviews');
    }
  };

  const fetchTemplates = async () => {
    if (!jobId) return;
    try {
      const res = await api.get('/api/interview_templates', { params: { job_id: jobId } });
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [jobApplicationId]);

  useEffect(() => {
    fetchTemplates();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        const payload = { ...form, scheduled_at: form.scheduled_at?.toISOString() };
        await api.put(`/api/interviews/${form.id}`, { interview: payload });
        await fetchInterviews();
      } else {
        const payload = {
          ...form,
          scheduled_at: form.scheduled_at?.toISOString(),
          job_application_id: jobApplicationId
        };
        await api.post('/api/interviews', { interview: payload });
        await fetchInterviews();
        onScheduled && onScheduled();
        window.dispatchEvent(new Event('interviewScheduled'));
      }
      setForm({ id: null, scheduled_at: null, location: '', notes: '', interview_template_id: '' });
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
      notes: interview.notes || '',
      interview_template_id: interview.interview_template?.id || ''
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
        <select
          value={form.interview_template_id}
          onChange={e => setForm({ ...form, interview_template_id: e.target.value })}
          required
        >
          <option value="">Select Template</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
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
            {i.interview_template && (
              <div style={{ marginTop: 4 }}>
                Template: {i.interview_template.title}
              </div>
            )}
            {i.notes && <div style={{ marginTop: 4 }}>{i.notes}</div>}
            <button onClick={() => startEdit(i)} style={{ marginTop: 8 }}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
