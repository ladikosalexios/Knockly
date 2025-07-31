

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const JobApplicationPage = () => {
  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [submitMsg, setSubmitMsg] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', resume_text: '', phone: '', work_authorization: '', gender: '',
    ethnicity: '', disability_status: '', veteran_status: '', total_years_experience: '',
    skills: '', experiences: '', educations: ''
  });

  useEffect(() => {
    if (!jobId) return;
    axios.get(`http://localhost:3000/api/jobs/${encodeURIComponent(jobId)}`)
      .then(res => setJob(res.data))
      .catch(err => setJob(null));
  }, [jobId]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const parseFormPayload = (form) => {
    let payload = { ...form };
    if (typeof payload.skills === 'string')
      payload.skills = payload.skills.split(',').map(s => s.trim()).filter(Boolean);
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('');
    try {
      await axios.post('http://localhost:3000/api/job_applications', {
        ...parseFormPayload(form),
        job_id: job.id
      });
      setSubmitMsg('Application submitted!');
      setForm({
        name: '', email: '', resume_text: '', phone: '', work_authorization: '', gender: '',
        ethnicity: '', disability_status: '', veteran_status: '', total_years_experience: '',
        skills: '', experiences: '', educations: ''
      });
    } catch (err) {
      setSubmitMsg('Error submitting: ' + (err.response?.data?.errors || err.message));
    }
  };

  if (job === null) return <div style={{ color: "#fff", padding: 40 }}>Job not found or loading...</div>;

  return (
    <div style={{ padding: 40, color: "#fff", background: "#1e1e1e", minHeight: "100vh" }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Apply for {job.job_description?.title || job.title}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 13, maxWidth: 520 }}>
        <input name="name" placeholder="Full Name *" value={form.name} onChange={handleFormChange} required style={inputStyle} />
        <input name="email" placeholder="Email *" value={form.email} onChange={handleFormChange} type="email" required style={inputStyle} />
        <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleFormChange} style={inputStyle} />
        <textarea name="resume_text" placeholder="Paste your resume here *" value={form.resume_text} onChange={handleFormChange} required rows={5} style={textAreaStyle} />
        <input name="total_years_experience" placeholder="Total Years of Experience" value={form.total_years_experience} onChange={handleFormChange} type="number" style={inputStyle} />
        <input name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleFormChange} style={inputStyle} />
        <textarea name="experiences" placeholder="Work Experience (optional)" value={form.experiences} onChange={handleFormChange} rows={3} style={textAreaStyle} />
        <textarea name="educations" placeholder="Education (optional)" value={form.educations} onChange={handleFormChange} rows={2} style={textAreaStyle} />
        <input name="work_authorization" placeholder="Work authorization status" value={form.work_authorization} onChange={handleFormChange} style={inputStyle} />
        <div style={{ display: "flex", gap: 8 }}>
          <select name="gender" value={form.gender} onChange={handleFormChange} style={selectStyle}>
            <option value="">Gender (optional)</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Other">Other</option>
          </select>
          <select name="ethnicity" value={form.ethnicity} onChange={handleFormChange} style={selectStyle}>
            <option value="">Ethnicity (optional)</option>
            <option value="White">White</option>
            <option value="Black or African American">Black or African American</option>
            <option value="Hispanic or Latino">Hispanic or Latino</option>
            <option value="Asian">Asian</option>
            <option value="Native American">Native American</option>
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select name="disability_status" value={form.disability_status} onChange={handleFormChange} style={selectStyle}>
            <option value="">Disability Status (optional)</option>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          <select name="veteran_status" value={form.veteran_status} onChange={handleFormChange} style={selectStyle}>
            <option value="">Veteran Status (optional)</option>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <button type="submit" style={{
          background: "#16ba63", color: "#fff", border: "none", borderRadius: 8,
          padding: "16px 0", fontSize: 19, marginTop: 5, fontWeight: 800, letterSpacing: 0.5, cursor: "pointer"
        }}>
          Submit Application
        </button>
        {submitMsg && <div style={{ marginTop: 16, color: submitMsg.includes('Error') ? '#ff4d4d' : '#25d18a', fontWeight: 600 }}>
          {submitMsg}
        </div>}
      </form>
    </div>
  );
};

const inputStyle = {
  background: "#23232b",
  border: "1px solid #333",
  color: "#fff",
  padding: 12,
  borderRadius: 7,
  fontSize: 16
};

const textAreaStyle = {
  ...inputStyle,
  fontSize: 15,
  minHeight: 65
};

const selectStyle = {
  flex: 1,
  background: "#23232b",
  border: "1px solid #333",
  color: "#aaa",
  padding: 12,
  borderRadius: 7,
  fontSize: 15
};

export default JobApplicationPage;