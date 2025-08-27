

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

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
    api.get(`/api/jobs/${encodeURIComponent(jobId)}`)
      .then(res => setJob(res.data))
      .catch(err => {
        console.error(err);
        setJob(null);
      });
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
      await api.post('/api/job_applications', {
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

  // Split requirements into bullet points if possible
  let requirementsList = [];
  if (typeof job.job_description?.requirements === "string") {
    // Split on newlines or bullet points
    requirementsList = job.job_description.requirements
      .split(/\n|•|-/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  return (
    <div style={{ padding: 0, color: "#fff", background: "#1e1e1e", minHeight: "100%", display: "flex", justifyContent: "center", paddingBottom: "100px", paddingTop: 80 }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center", gap: 80, width: "100%", maxWidth: "1280px", margin: "0 auto" }}>
        {/* Left: Job Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: "#a8d0ff", fontSize: 17, marginBottom: 2 }}>
            {job.job_description?.company_name}
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 8px 0", color: "#a8d0ff" }}>
            {job.job_description?.title}
          </h1>
          <div style={{ color: "#a8d0ff", fontSize: 16, marginBottom: 18, fontWeight: 500 }}>
            <span>{job.job_description?.location}</span>
            {job.job_description?.is_remote && <span> • Remote</span>}
            {job.job_description?.job_type && <span> • {job.job_description.job_type}</span>}
          </div>
          <h2 style={{ marginTop: 32, fontSize: 22, fontWeight: 700, color: "#fff" }}>About Your Role:</h2>
          <p style={{ lineHeight: 1.6, color: "#e9e9e9", marginTop: 8 }}>
            {job.job_description?.description}
          </p>
          <h2 style={{ marginTop: 32, fontSize: 22, fontWeight: 700, color: "#fff" }}>What You’ll Do / Your Experience:</h2>
          <div style={{ marginTop: 8 }}>
            {requirementsList.length > 1 ? (
              <ul style={{ paddingLeft: 24, color: "#e9e9e9", fontSize: 16, lineHeight: 1.7, margin: 0 }}>
                {requirementsList.map((req, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{req}</li>
                ))}
              </ul>
            ) : (
              <div style={{ lineHeight: 1.6, color: "#e9e9e9", whiteSpace: "pre-line" }}>
                {job.job_description?.requirements}
              </div>
            )}
          </div>
        </div>
        {/* Right: Application Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, maxWidth: 600, minWidth: 360, display: "flex", flexDirection: "column", gap: 13, background: "#1e1e1e", padding: 40, borderRadius: 12 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 18, color: "#a8d0ff" }}>
            Apply for {job.job_description?.title || job.title}
          </h2>
          <input name="name" placeholder="Full Name *" value={form.name} onChange={handleFormChange} required style={inputStyle} />
          <input name="email" placeholder="Email *" value={form.email} onChange={handleFormChange} type="email" required style={inputStyle} />
          <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleFormChange} style={inputStyle} />
          <textarea name="resume_text" placeholder="Paste your resume here *" value={form.resume_text} onChange={handleFormChange} required rows={5} style={textAreaStyle} />
          <input name="total_years_experience" placeholder="Total Years of Experience" value={form.total_years_experience} onChange={handleFormChange} type="number" style={inputStyle} />
          <input name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleFormChange} style={inputStyle} />
          <textarea name="experiences" placeholder="Work Experience (optional)" value={form.experiences} onChange={handleFormChange} rows={3} style={textAreaStyle} />
          <textarea name="educations" placeholder="Education (optional)" value={form.educations} onChange={handleFormChange} rows={2} style={textAreaStyle} />
          <input name="work_authorization" placeholder="Work authorization status" value={form.work_authorization} onChange={handleFormChange} style={inputStyle} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, width: "100%" }}>
            <select name="gender" value={form.gender} onChange={handleFormChange} style={{ ...selectStyle, flex: "1 1 48%" }}>
              <option value="">Gender (optional)</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Other">Other</option>
            </select>
            <select name="ethnicity" value={form.ethnicity} onChange={handleFormChange} style={{ ...selectStyle, flex: "1 1 48%" }}>
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, width: "100%" }}>
            <select name="disability_status" value={form.disability_status} onChange={handleFormChange} style={{ ...selectStyle, flex: "1 1 48%" }}>
              <option value="">Disability Status (optional)</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <select name="veteran_status" value={form.veteran_status} onChange={handleFormChange} style={{ ...selectStyle, flex: "1 1 48%" }}>
              <option value="">Veteran Status (optional)</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <button type="submit" style={{
            background: "#53a6f3", color: "#fff", border: "none", borderRadius: 8,
            padding: "16px 0", fontSize: 19, marginTop: 5, fontWeight: 800, letterSpacing: 0.5, cursor: "pointer"
          }}>
            Submit Application
          </button>
          {submitMsg && <div style={{ marginTop: 16, color: submitMsg.includes('Error') ? '#ff4d4d' : '#a8d0ff', fontWeight: 600 }}>
            {submitMsg}
          </div>}
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  background: "#1e1e1e",
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
  background: "#1e1e1e",
  border: "1px solid #333",
  color: "#aaa",
  padding: 12,
  borderRadius: 7,
  fontSize: 15
};

export default JobApplicationPage;