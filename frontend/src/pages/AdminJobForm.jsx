import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../api";

export default function AdminJobForm({ onCreated }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
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
  const [currentUser, setCurrentUser] = useState(null);
  const [jobDescId, setJobDescId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [statusAlert, setStatusAlert] = useState(null);

  useEffect(() => {
    api.get("/api/users/me")
      .then(res => setCurrentUser(res.data))
      .catch(err => console.error("Error fetching current user", err));
  }, []);

  useEffect(() => {
    api.get('/api/job_description_templates')
      .then(res => setTemplates(res.data))
      .catch(err => console.error('Error fetching templates', err));
  }, []);

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/jobs/${id}`)
        .then(res => {
          const job = res.data;
          const jd = job.job_description || {};
          setJobDescId(jd.id);
          setJdForm({
            jd_title: jd.title || '',
            jd_description: jd.description || '',
            jd_location: jd.is_remote || jd.location === 'Remote' ? '' : (jd.location || ''),
            jd_skills: (jd.skills || []).map(s => s.name).join(', '),
            job_status: job.status || 'active',
            job_expires_at: job.expires_at || '',
            job_type: jd.job_type || 'full-time',
            years_experience_min: jd.years_experience_min?.toString() || '',
            years_experience_max: jd.years_experience_max?.toString() || '',
            salary_min: jd.salary_min?.toString() || '',
            salary_max: jd.salary_max?.toString() || '',
            salary_currency: jd.salary_currency || 'USD',
            is_remote: jd.is_remote || jd.location === 'Remote',
            requirements: jd.requirements || '',
          });
        })
        .catch(err => console.error('Error fetching job', err));
    }
  }, [isEdit, id]);

  const pollStatus = (jdId, attempts = 5) => {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        try {
          const res = await api.get(`/api/job_descriptions/${jdId}/status`);
          if (res.data.embedding_state === 'generated') {
            clearInterval(interval);
            resolve({ ok: true, data: res.data });
            return;
          }
          attempts -= 1;
          if (attempts <= 0) {
            clearInterval(interval);
            resolve({ ok: false, data: res.data });
          }
        } catch (err) {
          clearInterval(interval);
          resolve({ ok: false });
        }
      }, 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setJdJobMsg('');

    if (!currentUser) {
      setJdJobMsg('Loading user info...');
      return;
    }

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
      if (isEdit) {
        await api.put(`/api/jobs/${id}`, {
          job: {
            status: jdForm.job_status,
            expires_at: jdForm.job_expires_at || null,
            company_id: currentUser?.company_id,
            posted_by_user_id: currentUser?.id,
          },
        });

        const jdRes = await api.put(`/api/job_descriptions/${jobDescId}`, {
          job_id: id,
          title: jdForm.jd_title,
          description: jdForm.jd_description,
          location: jdForm.is_remote ? 'Remote' : jdForm.jd_location,
          skills: jdForm.jd_skills.split(',').map(s => s.trim()).filter(Boolean),
          job_type: jdForm.job_type,
          years_experience_min: jdForm.years_experience_min ? Number(jdForm.years_experience_min) : null,
          years_experience_max: jdForm.years_experience_max ? Number(jdForm.years_experience_max) : null,
          salary_min: jdForm.salary_min ? Number(jdForm.salary_min) : null,
          salary_max: jdForm.salary_max ? Number(jdForm.salary_max) : null,
          salary_currency: jdForm.salary_currency,
          requirements: jdForm.requirements.split('\n').map(r => r.trim()).filter(Boolean),
          is_remote: jdForm.is_remote,
        });
        const status = await pollStatus(jdRes.data.id);
        if (status.ok) {
          setStatusAlert({ type: 'success', message: `Job + JD updated (${status.data.skill_count} skills)` });
          if (onCreated) onCreated();
          navigate('/admin');
        } else {
          setStatusAlert({ type: 'error', message: 'Job updated but processing incomplete' });
        }
      } else {
        const jobRes = await api.post('/api/jobs', {
          job: {
            status: jdForm.job_status,
            expires_at: jdForm.job_expires_at || null,
            company_id: currentUser?.company_id,
            posted_by_user_id: currentUser?.id,
          },
        });
        const jobId = jobRes.data.id;

        const jdRes = await api.post('/api/job_descriptions', {
          job_id: jobId,
          title: jdForm.jd_title,
          description: jdForm.jd_description,
          location: jdForm.is_remote ? 'Remote' : jdForm.jd_location,
          skills: jdForm.jd_skills.split(',').map(s => s.trim()).filter(Boolean),
          job_type: jdForm.job_type,
          years_experience_min: jdForm.years_experience_min ? Number(jdForm.years_experience_min) : null,
          years_experience_max: jdForm.years_experience_max ? Number(jdForm.years_experience_max) : null,
          salary_min: jdForm.salary_min ? Number(jdForm.salary_min) : null,
          salary_max: jdForm.salary_max ? Number(jdForm.salary_max) : null,
          salary_currency: jdForm.salary_currency,
          requirements: jdForm.requirements.split('\n').map(r => r.trim()).filter(Boolean),
          is_remote: jdForm.is_remote,
        });
        const status = await pollStatus(jdRes.data.id);
        if (status.ok) {
          setStatusAlert({ type: 'success', message: `Job + JD created (${status.data.skill_count} skills)` });
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
        } else {
          setStatusAlert({ type: 'error', message: 'Job created but processing incomplete' });
        }
      }
    } catch (err) {
      console.error(err);
      setJdJobMsg(`Error ${isEdit ? 'updating' : 'creating'} job/JD`);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const res = await api.post('/api/job_description_templates', {
        title: jdForm.jd_title,
        description: jdForm.jd_description,
        location: jdForm.is_remote ? 'Remote' : jdForm.jd_location,
        job_type: jdForm.job_type,
        years_experience_min: jdForm.years_experience_min ? Number(jdForm.years_experience_min) : null,
        years_experience_max: jdForm.years_experience_max ? Number(jdForm.years_experience_max) : null,
        salary_min: jdForm.salary_min ? Number(jdForm.salary_min) : null,
        salary_max: jdForm.salary_max ? Number(jdForm.salary_max) : null,
        salary_currency: jdForm.salary_currency,
        is_remote: jdForm.is_remote,
        requirements: jdForm.requirements.split('\n').map(r => r.trim()).filter(Boolean),
        skills: jdForm.jd_skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setTemplates(t => [res.data, ...t]);
    } catch (err) {
      console.error('Error saving template', err);
    }
  };

  const applyTemplate = tpl => {
    setJdForm(f => ({
      ...f,
      jd_title: tpl.title || '',
      jd_description: tpl.description || '',
      jd_location: tpl.is_remote || tpl.location === 'Remote' ? '' : (tpl.location || ''),
      job_type: tpl.job_type || 'full-time',
      years_experience_min: tpl.years_experience_min?.toString() || '',
      years_experience_max: tpl.years_experience_max?.toString() || '',
      salary_min: tpl.salary_min?.toString() || '',
      salary_max: tpl.salary_max?.toString() || '',
      salary_currency: tpl.salary_currency || 'USD',
      is_remote: tpl.is_remote || tpl.location === 'Remote',
      requirements: tpl.requirements || '',
      jd_skills: (tpl.skills || []).map(s => s.name).join(', '),
    }));
  };

  const handleTemplateChange = e => {
    const tplId = e.target.value;
    setSelectedTemplateId(tplId);
    const tpl = templates.find(t => t.id === Number(tplId));
    if (tpl) applyTemplate(tpl);
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
    <div style={{ display: "flex", justifyContent: "center", width: "100%", overflowY: "auto" }}>
      <div style={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        padding: "24px 0",
      }}>
        <h2 style={{ color: "#a8d0ff", fontSize: 24, fontWeight: 600 }}>
          {isEdit ? 'Edit Job & Job Description' : 'Create New Job & Job Description (Admin)'}
        </h2>
        {templates.length > 0 && (
          <div style={{ margin: '16px 0' }}>
            <select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              style={{ ...inputStyle, width: '100%' }}
            >
              <option value="">Load from template...</option>
              {templates.map(tpl => (
                <option key={tpl.id} value={tpl.id}>{tpl.title}</option>
              ))}
            </select>
          </div>
        )}
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
            type="button"
            onClick={handleSaveTemplate}
            style={{
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              width: "100%",
              fontWeight: 700,
              marginTop: 12,
              cursor: "pointer"
            }}
          >
            Save as Template
          </button>
          <button
            type="submit"
            style={{
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              width: "100%",
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
            {isEdit ? 'Update Job + JD' : 'Create Job + JD'}
          </button>
          {jdJobMsg && (
            <div style={{ color: (jdJobMsg.includes('created') || jdJobMsg.includes('updated')) ? 'lightgreen' : 'red', marginTop: 8 }}>
              {jdJobMsg}
            </div>
          )}
          {statusAlert && (
            <div style={{ color: statusAlert.type === 'error' ? 'red' : 'lightgreen', marginTop: 8 }}>
              {statusAlert.message}
            </div>
          )}
        </form>
        {templates.length > 0 && (
          <div style={{ marginTop: 24, background: '#111', border: '1px solid #333', borderRadius: 8, padding: 16 }}>
            <h3 style={{ color: '#a8d0ff', marginTop: 0 }}>Revision History</h3>
            {templates.map((tpl, idx) => (
              <div
                key={tpl.id}
                style={{
                  cursor: 'pointer',
                  padding: '6px 0',
                  borderTop: idx === 0 ? 'none' : '1px solid #333'
                }}
                onClick={() => applyTemplate(tpl)}
              >
                {tpl.title} - {new Date(tpl.updated_at).toLocaleString()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
