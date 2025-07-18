import { useState, useEffect } from 'react';
import './App.css';
import axios from "axios";

function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [appForm, setAppForm] = useState({
    name: '',
    email: '',
    resume_text: '',
    phone: '',
    work_authorization: '',
    gender: '',
    ethnicity: '',
    disability_status: '',
    veteran_status: '',
    total_years_experience: '',
    skills: '',
    experiences: '',
    educations: ''
  });
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    axios.get("http://localhost:3000/api/jobs")
      .then(res => setJobs(res.data))
      .catch(console.error);
  }, []);

  const openModal = (job) => {
    setSelectedJob(job);
    setModalOpen(true);
    setAppForm({
      name: '',
      email: '',
      resume_text: '',
      phone: '',
      work_authorization: '',
      gender: '',
      ethnicity: '',
      disability_status: '',
      veteran_status: '',
      total_years_experience: '',
      skills: '',
      experiences: '',
      educations: ''
    });
    setSubmitMsg('');
  };

  const handleFormChange = (e) => {
    setAppForm({ ...appForm, [e.target.name]: e.target.value });
  };

  // Helper to split comma fields into arrays/objects
  const parseFormPayload = (form) => {
    let payload = { ...form };
    if (typeof payload.skills === 'string')
      payload.skills = payload.skills.split(',').map(s => s.trim()).filter(Boolean);
    // For experiences and educations, let’s just send as text for now for MVP
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('');
    try {
      await axios.post('http://localhost:3000/api/job_applications', {
        ...parseFormPayload(appForm),
        job_id: selectedJob.id
      });
      setSubmitMsg('Application submitted!');
      setAppForm({
        name: '',
        email: '',
        resume_text: '',
        phone: '',
        work_authorization: '',
        gender: '',
        ethnicity: '',
        disability_status: '',
        veteran_status: '',
        total_years_experience: '',
        skills: '',
        experiences: '',
        educations: ''
      });
    } catch (err) {
      setSubmitMsg('Error submitting: ' + (err.response?.data?.errors || err.message));
    }
  };

  return (
    <div style={{ marginTop: 40, padding: 32, maxWidth: 700 }}>
      <h2>Open Jobs</h2>
      {jobs.length === 0 && <p>No jobs available.</p>}
      <ul style={{ padding: 0, listStyle: "none" }}>
        {jobs.map(job => (
          <li
            key={job.id}
            style={{
              margin: "28px 0",
              borderRadius: 14,
              padding: 30,
              background: "#222",
              color: "#fff",
              boxShadow: "0 2px 10px #0003",
              border: "1px solid #303040",
              textAlign: "center"
            }}
          >
            <div style={{
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 10,
              letterSpacing: 0.5
            }}>
              {job.job_description?.title || job.title}
            </div>
            <div style={{
              fontSize: 19,
              marginBottom: 16,
              opacity: 0.88,
              fontWeight: 400
            }}>
              {job.company?.name} | {job.job_description?.location || job.location}
            </div>
            <button
              style={{
                marginTop: 8,
                background: "#fff",
                color: "#222",
                fontWeight: 700,
                border: "none",
                borderRadius: 10,
                padding: "13px 38px",
                fontSize: 21,
                cursor: "pointer",
                boxShadow: "0 1px 8px #0002"
              }}
              onClick={() => openModal(job)}
            >
              Apply
            </button>
          </li>
        ))}
      </ul>
      {modalOpen && selectedJob && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", borderRadius: 10, padding: 30, minWidth: 340, maxWidth: 460, boxShadow: "0 4px 16px #0003"
          }}>
            <button onClick={() => setModalOpen(false)} style={{
              position: "absolute", right: 24, top: 18, background: "none", border: "none", fontSize: 22, cursor: "pointer"
            }}>&times;</button>
            <h3>Apply for {selectedJob.job_description?.title || selectedJob.title}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <input name="name" placeholder="Full Name" value={appForm.name} onChange={handleFormChange} required />
              <input name="email" placeholder="Email" value={appForm.email} onChange={handleFormChange} type="email" required />
              <textarea name="resume_text" placeholder="Paste your resume here" value={appForm.resume_text} onChange={handleFormChange} required rows={5} />
              <input name="phone" placeholder="Phone (optional)" value={appForm.phone} onChange={handleFormChange} />
              <input name="work_authorization" placeholder="Work authorization status" value={appForm.work_authorization} onChange={handleFormChange} />
              <input name="gender" placeholder="Gender (optional)" value={appForm.gender} onChange={handleFormChange} />
              <input name="ethnicity" placeholder="Ethnicity (optional)" value={appForm.ethnicity} onChange={handleFormChange} />
              <input name="disability_status" placeholder="Disability status (optional)" value={appForm.disability_status} onChange={handleFormChange} />
              <input name="veteran_status" placeholder="Veteran status (optional)" value={appForm.veteran_status} onChange={handleFormChange} />
              <input name="total_years_experience" placeholder="Total years experience" value={appForm.total_years_experience} onChange={handleFormChange} />
              <input name="skills" placeholder="Skills (comma separated)" value={appForm.skills} onChange={handleFormChange} />
              <textarea name="experiences" placeholder="Work experience summary (optional)" value={appForm.experiences} onChange={handleFormChange} rows={3} />
              <textarea name="educations" placeholder="Education summary (optional)" value={appForm.educations} onChange={handleFormChange} rows={2} />
              <button type="submit" style={{
                background: "#222", color: "#fff", border: "none", borderRadius: 7, fontWeight: 600, padding: "10px 0"
              }}>Submit Application</button>
            </form>
            {submitMsg && <div style={{ marginTop: 15, color: submitMsg.includes('Error') ? 'red' : 'green' }}>{submitMsg}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default App;