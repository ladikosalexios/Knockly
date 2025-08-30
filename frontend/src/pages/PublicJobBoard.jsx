import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";

function PublicJobBoard() {
  const { companySlug } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobType, setJobType] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/companies/slug/${companySlug}`)
      .then(res => setCompany(res.data))
      .catch(() => setCompany(null));
  }, [companySlug]);

  useEffect(() => {
    if (!company) return;
    const params = new URLSearchParams();
    params.append('company_id', company.id);
    if (jobType) params.append('job_type', jobType);
    if (isRemote) params.append('is_remote', true);
    if (salaryMin) params.append('salary_min', salaryMin);
    if (salaryMax) params.append('salary_max', salaryMax);
    params.append('page', page);
    params.append('per_page', perPage);

    axios.get(`/api/jobs?${params.toString()}`)
      .then(res => {
        setJobs(res.data.jobs || []);
        setTotalPages(res.data.total_pages || 1);
      })
      .catch(() => {
        setJobs([]);
        setTotalPages(1);
      });
  }, [company, jobType, isRemote, salaryMin, salaryMax, page]);

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
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          <select value={jobType} onChange={e => { setJobType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
          <label>
            <input type="checkbox" checked={isRemote} onChange={e => { setIsRemote(e.target.checked); setPage(1); }} /> Remote
          </label>
          <div>
            <input
              type="number"
              placeholder="Min Salary"
              value={salaryMin}
              onChange={e => { setSalaryMin(e.target.value); setPage(1); }}
              style={{ width: "45%", marginRight: 8 }}
            />
            <input
              type="number"
              placeholder="Max Salary"
              value={salaryMax}
              onChange={e => { setSalaryMax(e.target.value); setPage(1); }}
              style={{ width: "45%" }}
            />
          </div>
        </div>
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
        {jobs.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
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
