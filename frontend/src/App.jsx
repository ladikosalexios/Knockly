import { useState, useEffect } from 'react';
import './App.css';
import axios from "axios";
import { Routes, Route, useSearchParams, useNavigate } from "react-router-dom";
import LoginPage from './pages/LoginPage'
import AdminJobForm from './pages/AdminJobForm';
import DashboardLayout from './components/DashboardLayout';
import JobApplicantsPage from './components/JobApplicantsPage';
import JobApplicationPage from './components/JobApplicationPage';

function App() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMsg] = useState('');
  const [jobs, setJobs] = useState([]);

  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('company_id');

  const navigate = useNavigate();

  useEffect(() => {
    const url = companyId
      ? `http://localhost:3000/api/jobs?company_id=${companyId}`
      : `http://localhost:3000/api/jobs`;

    axios.get(url)
      .then(res => setJobs(res.data))
      .catch(console.error);
  }, [companyId]);

  return (
    <div style={{ padding: 32, width: "100%", height: "100vh", boxSizing: "border-box", position: "relative", overflowX: "hidden" }}>
      <Routes>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route path="/admin-job-form" element={<AdminJobForm />} />
          </Route>
          <Route path="/admin/jobs/:id/applicants" element={<JobApplicantsPage />} />
          <Route path="/jobs/:id/apply" element={<JobApplicationPage />} />
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
              height: "100vh",
              maxHeight: "100vh",
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
                boxShadow: "none"
              }}>
                <h2 style={{ marginBottom: 20 }}>Open Jobs</h2>
                {jobs.length === 0 && <p>No jobs available.</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {jobs.map(job => (
                    <div key={job.id} style={{ cursor: "pointer" }}>
                      <a
                        onClick={() => navigate(`/jobs/${job.id}/apply`)}
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
                boxShadow: "none"
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
          </>
        } />
      </Routes>
    </div>
  )
}

export default App;