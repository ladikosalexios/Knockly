import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './InterviewCalendar.css';
import api from '../../api';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function InterviewCalendar() {
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState('');
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/api/interviews');
        setInterviews(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load interviews');
      }
    };
    fetchInterviews();
  }, []);

  const events = interviews.map(i => ({
    id: i.id,
    start: new Date(i.scheduled_at),
    end: new Date(new Date(i.scheduled_at).getTime() + 60 * 60 * 1000),
    title: `${i.job_application?.name} (with ${i.job_application?.job?.posted_by_user?.name})${i.notes ? ' - ' + i.notes : ''}`,
    notes: i.notes,
  }));

  const handleEdit = async event => {
    const newDateInput = window.prompt(
      'Enter new date and time (YYYY-MM-DD HH:mm)',
      format(event.start, 'yyyy-MM-dd HH:mm')
    );
    if (!newDateInput) return;
    const newDate = new Date(newDateInput);
    if (isNaN(newDate)) return;
    const newNotes = window.prompt('Enter notes', event.notes || '') ?? '';
    try {
      const res = await api.put(`/api/interviews/${event.id}`, {
        interview: { scheduled_at: newDate.toISOString(), notes: newNotes },
      });
      setInterviews(prev =>
        prev.map(i => (i.id === event.id ? res.data : i))
      );
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
    </div>
  );
}
