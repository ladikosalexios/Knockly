import { useState, useEffect } from 'react';
import './App.css';
import axios from "axios";
import { Routes, Route, useSearchParams } from "react-router-dom";
import LoginPage from './pages/LoginPage'
import AdminJobForm from './pages/AdminJobForm';
import DashboardLayout from './components/DashboardLayout';
import JobApplicantsPage from './components/JobApplicantsPage';

function App() {
  const [loginEmail, setLoginEmail] = useState('');
const [loginPassword, setLoginPassword] = useState('');
const [loginMsg] = useState('');
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

  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('company_id');

  useEffect(() => {
    const url = companyId
      ? `http://localhost:3000/api/jobs?company_id=${companyId}`
      : `http://localhost:3000/api/jobs`;

    axios.get(url)
      .then(res => setJobs(res.data))
      .catch(console.error);
  }, [companyId]);

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
    <div style={{ padding: 32, width: "100%", height: "100vh", boxSizing: "border-box", position: "relative", overflowX: "hidden" }}>
      <Routes>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route path="/admin-job-form" element={<AdminJobForm />} />
          </Route>
          <Route path="/admin/jobs/:id/applicants" element={<JobApplicantsPage />} />
        <Route
  path="/login"
  element={
    <LoginPage
      loginEmail={loginEmail}
      setLoginEmail={setLoginEmail}
      loginPassword={loginPassword}
      setLoginPassword={setLoginPassword}
      loginMsg={loginMsg}
    />
  }
/>
        <Route path="/" element={
          <>
            <div style={{
              display: "flex",
              maxWidth: "100%",
              height: "100vh",
              boxSizing: "border-box",
              justifyContent: "center",
              alignItems: "center",
              gap: 64,
              overflowX: "auto",
              overflowY: "hidden",
              paddingInline: 24
            }}>
              <div style={{
                minWidth: 420,
                maxWidth: 460,
                width: "100%",
                maxHeight: "80vh",
                overflowY: "auto", // allow only vertical scrolling
                background: "#1e1e1e",
                borderRadius: 14,
                padding: 30,
                color: "#fff",
                boxShadow: "0 2px 10px #0003"
              }}>
                <h2 style={{ marginBottom: 20 }}>Open Jobs</h2>
                {jobs.length === 0 && <p>No jobs available.</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {jobs.map(job => (
                    <div key={job.id} style={{ cursor: "pointer" }}>
                      <a
                        onClick={() => openModal(job)}
                        style={{ 
                          color: "#a8d0ff",
                          fontWeight: 600,
                          fontSize: 18,
                          textDecoration: "none",
                          display: "inline-block",
                          marginBottom: 4
                        }}
                      >
                        {job.job_description?.title || job.title}
                      </a>
                      <div style={{ color: "#888", fontSize: 14 }}>
                        {job.job_description?.location || job.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                minWidth: 420,
                maxWidth: 460,
                width: "100%",
                background: "#1e1e1e",
                borderRadius: 14,
                padding: 30,
                color: "#fff",
                fontSize: 16,
                lineHeight: 1.5,
                boxShadow: "0 2px 10px #0003"
              }}>
                <h2 style={{ marginBottom: 16, color: "#a8d0ff", textAlign: "center" }}>
                  Welcome to the {jobs[0]?.company?.name || "Company"} Job Openings Page!
                </h2>
                <p style={{ marginBottom: 16 }}>
                  From here you can view and apply for any of our open roles. Should our hiring team see a match between your background and our role, we will be in touch to learn more about you.
                </p>
                <p>
                  If you'd like to learn a little more about our team and culture, you can visit our careers overview page.
                </p>
              </div>
            </div>

            {modalOpen && selectedJob && (
              <div style={{
                position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
              }}>
                <div style={{
                  background: "#191919", borderRadius: 12, padding: 36, minWidth: 370, maxWidth: 470, width: "90%",
                  boxShadow: "0 6px 22px #0008", color: "#fff", position: "relative",    maxHeight: "92vh",
                  overflowY: "auto",
                }}>
                  <button onClick={() => setModalOpen(false)} style={{
                    position: "absolute", right: 18, top: 18, background: "none", border: "none", fontSize: 26, color: "#bbb", cursor: "pointer"
                  }}>&times;</button>
                  <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
                    Apply for {selectedJob.job_description?.title || selectedJob.title}
                  </h3>
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    <input
                      name="name" placeholder="Full Name *" value={appForm.name} onChange={handleFormChange} required
                      style={{ background: "#23232b", border: "1px solid #333", color: "#fff", padding: 12, borderRadius: 7, fontSize: 16 }}
                    />
                    <input
                      name="email" placeholder="Email *" value={appForm.email} onChange={handleFormChange} type="email" required
                      style={{ background: "#23232b", border: "1px solid #333", color: "#fff", padding: 12, borderRadius: 7, fontSize: 16 }}
                    />
                    <input
                      name="phone" placeholder="Phone (optional)" value={appForm.phone} onChange={handleFormChange}
                      style={{ background: "#23232b", border: "1px solid #333", color: "#fff", padding: 12, borderRadius: 7, fontSize: 16 }}
                    />
                    <textarea
                      name="resume_text" placeholder="Paste your resume here *" value={appForm.resume_text} onChange={handleFormChange} required rows={5}
                      style={{ background: "#23232b", border: "1px solid #333", color: "#fff", padding: 12, borderRadius: 7, fontSize: 15, minHeight: 65 }}
                    />
                    <input
                      name="total_years_experience" placeholder="Total Years of Experience" value={appForm.total_years_experience} onChange={handleFormChange}
                      type="number"
                      style={{ background: "#23232b", border: "1px solid #333", color: "#fff", padding: 12, borderRadius: 7, fontSize: 16 }}
                    />
                    <input
                      name="skills" placeholder="Skills (comma separated)" value={appForm.skills} onChange={handleFormChange}
                      style={{ background: "#23232b", border: "1px solid #333", color: "#fff", padding: 12, borderRadius: 7, fontSize: 16 }}
                    />

                    <textarea
                      name="experiences" placeholder="Work Experience (optional)" value={appForm.experiences} onChange={handleFormChange} rows={3}
                      style={{ background: "#23232b", border: "1px solid #333", color: "#fff", padding: 12, borderRadius: 7, fontSize: 15 }}
                    />
                    <textarea
                      name="educations" placeholder="Education (optional)" value={appForm.educations} onChange={handleFormChange} rows={2}
                      style={{ background: "#23232b", border: "1px solid #333", color: "#fff", padding: 12, borderRadius: 7, fontSize: 15 }}
                    />

                    <input
                      name="work_authorization" placeholder="Work authorization status (e.g. US Citizen, Visa, etc)" value={appForm.work_authorization} onChange={handleFormChange}
                      style={{ background: "#23232b", border: "1px solid #333", color: "#fff", padding: 12, borderRadius: 7, fontSize: 16 }}
                    />

                    {/* Diversity/EEO fields */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <select
                        name="gender" value={appForm.gender} onChange={handleFormChange}
                        style={{ flex: 1, background: "#23232b", border: "1px solid #333", color: "#aaa", padding: 12, borderRadius: 7, fontSize: 15 }}
                      >
                        <option value="">Gender (optional)</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                        <option value="Other">Other</option>
                      </select>
                      <select
                        name="ethnicity" value={appForm.ethnicity} onChange={handleFormChange}
                        style={{ flex: 1, background: "#23232b", border: "1px solid #333", color: "#aaa", padding: 12, borderRadius: 7, fontSize: 15 }}
                      >
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
                      <select
                        name="disability_status" value={appForm.disability_status} onChange={handleFormChange}
                        style={{ flex: 1, background: "#23232b", border: "1px solid #333", color: "#aaa", padding: 12, borderRadius: 7, fontSize: 15 }}
                      >
                        <option value="">Disability Status (optional)</option>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                      <select
                        name="veteran_status" value={appForm.veteran_status} onChange={handleFormChange}
                        style={{ flex: 1, background: "#23232b", border: "1px solid #333", color: "#aaa", padding: 12, borderRadius: 7, fontSize: 15 }}
                      >
                        <option value="">Veteran Status (optional)</option>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <button type="submit" style={{
                      background: "#16ba63", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800,
                      padding: "16px 0", fontSize: 19, marginTop: 5, boxShadow: "0 1px 6px #0004", letterSpacing: 0.5, cursor: "pointer"
                    }}>
                      Submit Application
                    </button>
                  </form>
                  {submitMsg && <div style={{ marginTop: 16, color: submitMsg.includes('Error') ? '#ff4d4d' : '#25d18a', fontWeight: 600 }}>
                    {submitMsg}
                  </div>}
                </div>
              </div>
            )}
          </>
        } />
      </Routes>
    </div>
  )
}

export default App;