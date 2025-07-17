import { useState } from 'react';
import axios from "axios";

export default function AdminJobForm({ onCreated }) {
  const [jdForm, setJdForm] = useState({
    jd_title: '',
    jd_description: '',
    jd_location: '',
    jd_company_name: '',
    jd_skills: '',
    job_status: 'active',
    job_expires_at: '',
  });
  const [jdJobMsg, setJdJobMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setJdJobMsg('');
    try {
      // 1. Create Job Description
      const jdRes = await axios.post('http://localhost:3000/api/job_descriptions', {
        title: jdForm.jd_title,
        description: jdForm.jd_description,
        location: jdForm.jd_location,
        company_name: jdForm.jd_company_name,
        skills: jdForm.jd_skills.split(",").map(s => s.trim()).filter(Boolean)
      });
      const jdId = jdRes.data.id;
      // 2. Create Job (company_id and posted_by_user_id are hardcoded 1 for now)
      await axios.post('http://localhost:3000/api/jobs', {
        job: {
          job_description_id: jdId,
          status: jdForm.job_status,
          expires_at: jdForm.job_expires_at || null,
          company_id: 1,
          posted_by_user_id: 1
        }
      });
      setJdJobMsg('Job + JD created!');
      setJdForm({
        jd_title: '', jd_description: '', jd_location: '', jd_company_name: '', jd_skills:'',
        job_status: 'active', job_expires_at: ''
      });
      if (onCreated) onCreated();
    } catch (err) {
      setJdJobMsg('Error creating job/JD');
    }
  };

  return (
    <div style={{ marginTop: 64, padding: 32, background: "#191919", borderRadius: 12 }}>
      <h2 style={{ color: "#fff" }}>Create New Job & Job Description (Admin)</h2>
      <form onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12, color: "#fff" }}
      >
        <input
          value={jdForm.jd_title}
          onChange={e => setJdForm(f => ({ ...f, jd_title: e.target.value }))}
          placeholder="Job Title" required style={{ padding: 8 }}
        />
        <input
          value={jdForm.jd_company_name}
          onChange={e => setJdForm(f => ({ ...f, jd_company_name: e.target.value }))}
          placeholder="Company Name" required style={{ padding: 8 }}
        />
        <input
          value={jdForm.jd_location}
          onChange={e => setJdForm(f => ({ ...f, jd_location: e.target.value }))}
          placeholder="Location" required style={{ padding: 8 }}
        />
        <textarea
          value={jdForm.jd_description}
          onChange={e => setJdForm(f => ({ ...f, jd_description: e.target.value }))}
          placeholder="Job Description" required style={{ padding: 8, minHeight: 60 }}
        />
        <input
          value={jdForm.jd_skills}
          onChange={e => setJdForm(f => ({ ...f, jd_skills: e.target.value }))}
          placeholder="Skills (comma separated)"
          style={{ padding: 8 }}
        />
        <input
          value={jdForm.job_expires_at}
          onChange={e => setJdForm(f => ({ ...f, job_expires_at: e.target.value }))}
          placeholder="Expiration Date (YYYY-MM-DD)" style={{ padding: 8 }}
        />
        <button style={{
          background: "#222",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 22px",
          fontWeight: 700,
          marginTop: 8,
          cursor: "pointer"
        }}>
          Create Job + JD
        </button>
        {jdJobMsg && <div style={{ color: jdJobMsg.includes('created') ? "lightgreen" : "red", marginTop: 8 }}>{jdJobMsg}</div>}
      </form>
    </div>
  );
}