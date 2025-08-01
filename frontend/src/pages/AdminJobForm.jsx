import { useState } from 'react';
import axios from "axios";

export default function AdminJobForm({ onCreated }) {
  const [jdForm, setJdForm] = useState({
    jd_title: '',
    jd_description: '',
    jd_location: '',
    jd_skills: '',
    job_status: 'active',
    job_expires_at: '',
    job_type: 'full-time',
    years_experience_min: '',
    years_experience_max: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    is_remote: false,
    requirements: '',
  });
  const [jdJobMsg, setJdJobMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setJdJobMsg('');

    // Basic validation
    if (!jdForm.jd_title.trim()) {
      setJdJobMsg('Job Title is required.');
      return;
    }
    if (!jdForm.jd_description.trim()) {
      setJdJobMsg('Job Description is required.');
      return;
    }
    if (!jdForm.jd_location.trim() && !jdForm.is_remote) {
      setJdJobMsg('Location is required unless the job is remote.');
      return;
    }
    if (jdForm.salary_min && jdForm.salary_max && Number(jdForm.salary_min) > Number(jdForm.salary_max)) {
      setJdJobMsg('Minimum salary cannot be greater than maximum salary.');
      return;
    }
    if (jdForm.years_experience_min && jdForm.years_experience_max && Number(jdForm.years_experience_min) > Number(jdForm.years_experience_max)) {
      setJdJobMsg('Minimum years of experience cannot be greater than maximum years of experience.');
      return;
    }

    try {
      // 1. Create Job (company_id and posted_by_user_id are hardcoded 1 for now)
      const jobRes = await axios.post('http://localhost:3000/api/jobs', {
        job: {
          status: jdForm.job_status,
          expires_at: jdForm.job_expires_at || null,
          company_id: 1,
          posted_by_user_id: 1        
        },
      },
        { withCredentials: true }
      );
      const jobId = jobRes.data.id;

      // 2. Create Job Description
      await axios.post('http://localhost:3000/api/job_descriptions', {
        job_id: jobId,
        title: jdForm.jd_title,
        description: jdForm.jd_description,
        location: jdForm.is_remote ? 'Remote' : jdForm.jd_location,
        skills: jdForm.jd_skills.split(",").map(s => s.trim()).filter(Boolean),
        job_type: jdForm.job_type,
        years_experience_min: jdForm.years_experience_min ? Number(jdForm.years_experience_min) : null,
        years_experience_max: jdForm.years_experience_max ? Number(jdForm.years_experience_max) : null,
        salary_min: jdForm.salary_min ? Number(jdForm.salary_min) : null,
        salary_max: jdForm.salary_max ? Number(jdForm.salary_max) : null,
        salary_currency: jdForm.salary_currency,
        requirements: jdForm.requirements.split("\n").map(r => r.trim()).filter(Boolean)
      },  {
         withCredentials: true }
    );

      setJdJobMsg('Job + JD created!');
      setJdForm({
        jd_title: '',
        jd_description: '',
        jd_location: '',
        jd_skills: '',
        job_status: 'active',
        job_expires_at: '',
        job_type: 'full-time',
        years_experience_min: '',
        years_experience_max: '',
        salary_min: '',
        salary_max: '',
        salary_currency: 'USD',
        is_remote: false,
        requirements: '',
      });
      if (onCreated) onCreated();
    } catch (err) {
      setJdJobMsg('Error creating job/JD');
    }
  };

  const inputStyle = {
    padding: 10,
    background: "#111",
    border: "1px solid #333",
    borderRadius: 6,
    color: "#fff",
    fontSize: 14
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100vh", overflowY: "hidden" }}>
      <div style={{
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        <h2 style={{ color: "#a8d0ff", fontSize: 24, fontWeight: 600 }}>
          Create New Job & Job Description (Admin)
        </h2>
        <form onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16, color: "#fff" }}
        >
          <input
            value={jdForm.jd_title}
            onChange={e => setJdForm(f => ({ ...f, jd_title: e.target.value }))}
            placeholder="Job Title *" required style={inputStyle}
          />
          <input
            value={jdForm.jd_location}
            onChange={e => setJdForm(f => ({ ...f, jd_location: e.target.value }))}
            placeholder="Location (leave blank if remote)" style={inputStyle}
            disabled={jdForm.is_remote}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={jdForm.is_remote}
              onChange={e => setJdForm(f => ({ ...f, is_remote: e.target.checked }))}
            />
            Remote Position
          </label>
          <textarea
            value={jdForm.jd_description}
            onChange={e => setJdForm(f => ({ ...f, jd_description: e.target.value }))}
            placeholder="Job Description *" required style={{ ...inputStyle, minHeight: 80 }}
          />
          <textarea
            value={jdForm.requirements}
            onChange={e => setJdForm(f => ({ ...f, requirements: e.target.value }))}
            placeholder="Requirements (one per line)" style={{ ...inputStyle, minHeight: 60 }}
          />
          <input
            value={jdForm.jd_skills}
            onChange={e => setJdForm(f => ({ ...f, jd_skills: e.target.value }))}
            placeholder="Skills (comma separated)" style={inputStyle}
          />
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <select
              value={jdForm.job_type}
              onChange={e => setJdForm(f => ({ ...f, job_type: e.target.value }))}
              style={{ ...inputStyle, flex: "1 1 150px" }}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </select>
            <input
              type="number"
              min="0"
              value={jdForm.years_experience_min}
              onChange={e => setJdForm(f => ({ ...f, years_experience_min: e.target.value }))}
              placeholder="Min Years Experience" style={{ ...inputStyle, flex: "1 1 100px" }}
            />
            <input
              type="number"
              min="0"
              value={jdForm.years_experience_max}
              onChange={e => setJdForm(f => ({ ...f, years_experience_max: e.target.value }))}
              placeholder="Max Years Experience" style={{ ...inputStyle, flex: "1 1 100px" }}
            />
            <input
              type="number"
              min="0"
              value={jdForm.salary_min}
              onChange={e => setJdForm(f => ({ ...f, salary_min: e.target.value }))}
              placeholder="Min Salary" style={{ ...inputStyle, flex: "1 1 100px" }}
            />
            <input
              type="number"
              min="0"
              value={jdForm.salary_max}
              onChange={e => setJdForm(f => ({ ...f, salary_max: e.target.value }))}
              placeholder="Max Salary" style={{ ...inputStyle, flex: "1 1 100px" }}
            />
            <select
              value={jdForm.salary_currency}
              onChange={e => setJdForm(f => ({ ...f, salary_currency: e.target.value }))}
              style={{ ...inputStyle, flex: "1 1 100px" }}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
          <input
            value={jdForm.job_expires_at}
            onChange={e => setJdForm(f => ({ ...f, job_expires_at: e.target.value }))}
            placeholder="Expiration Date (YYYY-MM-DD)" style={inputStyle}
          />
          <button
            type="submit"
            style={{
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontWeight: 700,
              marginTop: 12,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#a8d0ff";
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#222";
              e.currentTarget.style.color = "#fff";
            }}
          >
            Create Job + JD
          </button>
          {jdJobMsg && <div style={{ color: jdJobMsg.includes('created') ? "lightgreen" : "red", marginTop: 8 }}>{jdJobMsg}</div>}
        </form>
      </div>
    </div>
  );
}