import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import DatePicker from 'react-datepicker';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import './InterviewCalendar.css';
import api from '../../api';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export const fetchInterviews = async () => {
  const res = await api.get('/api/interviews');
  return res.data;
};

export default function InterviewCalendar() {
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState('');
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [editingEvent, setEditingEvent] = useState(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editNotes, setEditNotes] = useState('');

  const loadInterviews = async () => {
    try {
      const data = await fetchInterviews();
      setInterviews(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load interviews');
    }
  };

  useEffect(() => {
    loadInterviews();
    const handler = () => loadInterviews();
    window.addEventListener('interviewScheduled', handler);
    return () => window.removeEventListener('interviewScheduled', handler);
  }, []);

  const events = interviews.map(i => ({
    id: i.id,
    start: new Date(i.scheduled_at),
    end: new Date(new Date(i.scheduled_at).getTime() + 60 * 60 * 1000),
    title: `${i.job_application?.name} (with ${i.job_application?.job?.posted_by_user?.name})${i.notes ? ' - ' + i.notes : ''}`,
    notes: i.notes,
  }));

  const handleEdit = event => {
    setEditingEvent(event);
    setEditDate(event.start);
    setEditNotes(event.notes || '');
  };

  const saveEdit = async () => {
    if (!editingEvent) return;
    try {
      await api.put(`/api/interviews/${editingEvent.id}`, {
        interview: { scheduled_at: editDate.toISOString(), notes: editNotes },
      });
      setEditingEvent(null);
      await loadInterviews();
    } catch (err) {
      console.error(err);
      setError('Failed to update interview');
    }
  };

  return (
    <div style={{ padding: 32, color: '#fff', backgroundColor: '#1e1e1e' }}>
      <h3 style={{ marginBottom: 16 }}>Scheduled Interviews</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, background: '#fff', color: '#000' }}
        date={date}
        view={view}
        onNavigate={setDate}
        onView={setView}
        views={['month', 'week', 'day', 'agenda']}
        selectable
        onSelectEvent={handleEdit}
      />
      {editingEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Edit Interview</h4>
            <div style={{ marginBottom: 8 }}>
              <DatePicker
                selected={editDate}
                onChange={date => setEditDate(date)}
                showTimeSelect
                timeIntervals={15}
                dateFormat="Pp"
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <input
                type="text"
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Notes"
              />
            </div>
            <div>
              <button onClick={saveEdit}>Save</button>
              <button onClick={() => setEditingEvent(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
