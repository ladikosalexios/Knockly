import AdminJobForm from './pages/AdminJobForm';
import { useState, useEffect } from 'react'
import './App.css'
import axios from "axios"
import JobList from './pages/candidatePage/JobList';
import LoginPage from './pages/LoginPage';
import JobDetailModal from './pages/candidatePage/JobDetailModal';
import ResumeModal from './pages/candidatePage/ResumeModal';

function App() {

    const loadAppliedJobs = (email) => {
    axios.get('http://localhost:3000/api/job_applications', {
      params: { email }
    })
    .then(res => {
      setAppliedJobs(res.data.map(app => app.job_id));
    })
    .catch(() => setAppliedJobs([]));
  };

  const [jobs, setJobs] = useState([])
  const [query, setQuery] = useState("")
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [appliedJobs, setAppliedJobs] = useState([]);

  const [applicantEmail, setApplicantEmail] = useState('');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [resumeEmail, setResumeEmail] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeMsg, setResumeMsg] = useState('');
  // --- AUTH STATE ---
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState('');

  useEffect(() => {
    console.log("[DEBUG] Current user object:", user);
    if (user) {
      console.log("[DEBUG] User role:", user.role);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true)
    setError(null)
    const timeout = setTimeout(() => {
      axios.get("http://localhost:3000/api/jobs", { params: { q: query } })
        .then(res => setJobs(res.data))
        .catch(err => setError("Error fetching jobs."))
        .finally(() => setLoading(false))
    }, 400)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    if (applicantEmail) {
      loadAppliedJobs(applicantEmail);
    } else {
      setAppliedJobs([]);
    }
  }, [applicantEmail]);

  // --- LOGIN HANDLER ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMsg('');
    try {
      const res = await axios.post('http://localhost:3000/users/sign_in', {
        user: { email: loginEmail, password: loginPassword }
      }, { withCredentials: true });
      setUser(res.data.user || res.data);
      setLoginEmail('');
      setLoginPassword('');
      setLoginMsg('Logged in!');
    } catch (err) {
      setLoginMsg('Invalid credentials');
    }
  };

const fetchJobDetail = (id) => {
    setLoading(true)
    setError(null)
    axios.get(`http://localhost:3000/api/jobs/${id}`)
      .then(res => setSelectedJob(res.data))
      .catch(() => setError("Error fetching job details."))
      .finally(() => setLoading(false))
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{marginTop: 40, padding: 32}}>
        <LoginPage
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          loginMsg={loginMsg}
          handleLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div style={{marginTop: 40, padding: 32}}>
      <button
        onClick={async () => {
          console.log("[DEBUG] Logging out user:", user);
          try {
            await axios.delete('http://localhost:3000/users/sign_out', { withCredentials: true });
            console.log("[DEBUG] Backend logout successful.");
          } catch (e) {
            console.log("[DEBUG] Backend logout failed, proceeding with frontend logout anyway.");
          }
          setUser(null);
        }}
        style={{
          position: "absolute", top: 10, right: 10,
          background: "#aaa", color: "#222", borderRadius: 8, padding: "6px 16px"
        }}
      >
        Logout
      </button>
      {user.role === 'admin' ? (
        <AdminJobForm user={user} />
      ) : (
        <>
          <button
            onClick={() => setShowResumeModal(true)}
            style={{
              marginBottom: 18,
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 22px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Add Resume/Profile
          </button>
          <JobList
            jobs={jobs}
            appliedJobs={appliedJobs}
            fetchJobDetail={fetchJobDetail}
            loading={loading}
            error={error}
            query={query}
            setQuery={setQuery}
            applicantEmail={applicantEmail}
            setApplicantEmail={setApplicantEmail}
          />
          {selectedJob && (selectedJob.job_description?.title || selectedJob.title) && (
            <JobDetailModal
              job={selectedJob}
              onClose={() => setSelectedJob(null)}
            />
          )}
          <ResumeModal
            open={showResumeModal}
            onClose={() => setShowResumeModal(false)}
            resumeName={resumeName}
            setResumeName={setResumeName}
            resumeEmail={resumeEmail}
            setResumeEmail={setResumeEmail}
            resumeText={resumeText}
            setResumeText={setResumeText}
            resumeMsg={resumeMsg}
            setResumeMsg={setResumeMsg}
          />
        </>
      )}
    </div>
  )
}

export default App