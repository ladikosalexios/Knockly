import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";

function PublicJobBoard() {
  const { companySlug } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/companies/slug/${companySlug}`)
      .then(res => {
        setCompany(res.data);
        return axios.get(`/api/companies/${companySlug}/jobs`);
      })
      .then(res => setJobs(res.data))
      .catch(() => {
        setCompany(null);
        setJobs([]);
      });
  }, [companySlug]);

  if (!company) return <div style={{ padding: 24 }}>Company not found.</div>;

  return (
    <div style={{
      display: "flex",
      maxWidth: "100%",
      height: "100vh",
      boxSizing: "border-box",
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
        overflowY: "auto",
        background: "#1e1e1e",
        borderRadius: 14,
        padding: 30,
        color: "#fff",
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
      }}>
        <h2 style={{ marginBottom: 16, color: "#a8d0ff", textAlign: "center" }}>
          Welcome to the {company.name} Job Openings Page!
        </h2>
        <p style={{ marginBottom: 16 }}>
          From here you can view and apply for any of our open roles. Should our hiring team see a match between your background and our role, we will be in touch to learn more about you.
        </p>
        <p>
          If you'd like to learn a little more about our team and culture, you can visit our careers overview page.
        </p>
      </div>
    </div>
  );
}

export default PublicJobBoard;