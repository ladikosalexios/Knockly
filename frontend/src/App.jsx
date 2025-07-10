import { useState, useEffect } from 'react'
import './App.css'
import axios from "axios"

function App() {

    const loadAppliedJobs = (email) => {
    axios.get('http://localhost:3000/api/job_applications', {
      params: { email }
    })
    .then(res => {
      // Expect API to return a list of job_applications
      // with a job_id for each application
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
  const [isApplying, setIsApplying] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');

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
      setAppliedJobs([]); // clear when no email
    }
  }, [applicantEmail]);

  // Fetch single job detail (when clicked)
  const fetchJobDetail = (id) => {
    setLoading(true)
    setError(null)
    axios.get(`http://localhost:3000/api/jobs/${id}`)
      .then(res => setSelectedJob(res.data))
      .catch(() => setError("Error fetching job details."))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{marginTop: 40, padding: 32}}>
      <h1>Job Listings</h1>
      <input
        type="email"
        value={applicantEmail}
        onChange={e => setApplicantEmail(e.target.value)}
        placeholder="Enter your email to track job applications"
        style={{
          padding: 10,
          width: "100%",
          maxWidth: 400,
          marginBottom: 20,
          borderRadius: 5,
          border: "1px solid #888"
        }}
      />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by title, location, or skill"
        style={{
          padding: 10,
          width: "100%",
          maxWidth: 400,
          marginBottom: 30,
          borderRadius: 5,
          border: "1px solid #888"
        }}
      />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && jobs.length === 0 && <p>No jobs found.</p>}
      {jobs.map(job => (
        <div
          key={job.id}
          style={{margin: "20px 0", padding: 10, border: "1px solid #ccc", cursor: "pointer"}}
          onClick={() => fetchJobDetail(job.id)}
        >
          <h3>{job.title}</h3>
          <p><b>Company:</b> {job.company?.name}</p>
          <p><b>Location:</b> {job.location} {job.is_remote && "(Remote)"}</p>
          <p><b>Skills:</b> {job.skills?.map(s => s.name).join(', ')}</p>
        </div>
      ))}

     {selectedJob && selectedJob.title && (
      <div
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}
        onClick={() => setSelectedJob(null)}
      >

        <div
          style={{
            background: "#fff",
            color: "#222",
            padding: 30,
            borderRadius: 12,
            maxWidth: 600,
            width: "90%",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            fontSize: 20,
            fontFamily: "Inter, Arial, sans-serif",
            position: "relative"
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setSelectedJob(null)}
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: "#222",
              color: "#fff",
              padding: "10px 25px",
              border: "none",
              borderRadius: 12,
              fontSize: 20,
              cursor: "pointer",
              fontWeight: 700
            }}
          >
            Close
          </button>

          {appliedJobs.includes(selectedJob.id) ? (
          <div style={{ color: 'green', fontWeight: 700, marginBottom: 20 }}>Applied!</div>
        ) : isApplying ? (
          <form
            onSubmit={e => {
                e.preventDefault();
                axios.post('http://localhost:3000/api/job_applications', {
                  job_id: selectedJob.id,
                  name: applicantName,
                  email: applicantEmail
                }).then(res => {
                  setAppliedJobs([...appliedJobs, selectedJob.id]);
                  setIsApplying(false);
                  setApplicantName('');
                  setApplicantEmail('');
                }).catch(err => {
                  alert(
                    err.response?.data?.errors?.join("\n") ||
                    "Could not apply. Try again."
                  );
                });
              }}
            style={{ marginBottom: 24 }}
          >
            <input
              type="text"
              value={applicantName}
              onChange={e => setApplicantName(e.target.value)}
              placeholder="Your Name"
              required
              style={{ padding: 10, marginRight: 8, borderRadius: 5, border: "1px solid #888" }}
            />
            <input
              type="email"
              value={applicantEmail}
              onChange={e => setApplicantEmail(e.target.value)}
              placeholder="Your Email"
              required
              style={{ padding: 10, marginRight: 8, borderRadius: 5, border: "1px solid #888" }}
            />
            <button
              type="submit"
              style={{
                background: "#087f23",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 22px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Submit Application
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsApplying(true)}
            style={{
              background: "#087f23",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 22px",
              fontWeight: 700,
              marginBottom: 24,
              cursor: "pointer"
            }}
            disabled={appliedJobs.includes(selectedJob.id)}
          >
            Apply to this job
          </button>
        )}
          <div style={{margin: "40px 0 0 0", textAlign: "center"}}>
            <p><b>Company:</b> {selectedJob.company?.name}</p>
            <p><b>Location:</b> {selectedJob.location} {selectedJob.is_remote && "(Remote)"}</p>
            <p><b>Skills:</b> {selectedJob.skills?.map(s => s.name).join(', ')}</p>
            <p><b>Description:</b> {selectedJob.description}</p>
            <p><b>Job Type:</b> {selectedJob.job_type}</p>
            <p><b>Experience:</b> {selectedJob.experience_level}</p>
            <p><b>Salary:</b> {selectedJob.is_salary_visible ? `${selectedJob.salary_min}–${selectedJob.salary_max} ${selectedJob.salary_currency}` : 'Hidden'}</p>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}

export default App