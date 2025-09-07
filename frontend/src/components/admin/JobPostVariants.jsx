import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

export default function JobPostVariants() {
  const { id: jobId } = useParams();
  const [variants, setVariants] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    location: '',
    is_remote: false,
    description: '',
    requirements: '',
    skills: '',
    job_type: 'full-time',
    years_experience_min: '',
    years_experience_max: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    expires_at: '',
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const fetchVariants = async () => {
    try {
      const res = await api.get(`/api/jobs/${jobId}/variants`);
      setVariants(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load variants');
    }
  };

  useEffect(() => {
    if (jobId) fetchVariants();
  }, [jobId]);

  const createVariant = async e => {
    e.preventDefault();
    try {
      await api.post(`/api/jobs/${jobId}/variants`, { variant: form });
      setForm({
        title: '',
        location: '',
        is_remote: false,
        description: '',
        requirements: '',
        skills: '',
        job_type: 'full-time',
        years_experience_min: '',
        years_experience_max: '',
        salary_min: '',
        salary_max: '',
        salary_currency: 'USD',
        expires_at: '',
      });
      fetchVariants();
    } catch (err) {
      console.error(err);
      setError('Failed to create variant');
    }
  };

  const activateVariant = async id => {
    try {
      await api.post(`/api/jobs/${jobId}/variants/${id}/activate`);
      fetchVariants();
    } catch (err) {
      console.error(err);
      setError('Failed to activate variant');
    }
  };

  if (!jobId) return null;

  return (
    <div style={{ padding: 32, color: '#fff' }}>
      <h2>Create Variant</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={createVariant} style={{ marginBottom: 24 }}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Job Title *"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location (leave blank if remote)"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <label style={{ display: 'block', marginBottom: 8 }}>
          <input
            type="checkbox"
            name="is_remote"
            checked={form.is_remote}
            onChange={handleChange}
            style={{ marginRight: 4 }}
          />
          Remote Position
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Job Description *"
          rows={4}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <textarea
          name="requirements"
          value={form.requirements}
          onChange={handleChange}
          placeholder="Requirements (one per line)"
          rows={3}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          name="skills"
          value={form.skills}
          onChange={handleChange}
          placeholder="Skills (comma separated)"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <select
          name="job_type"
          value={form.job_type}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 8 }}
        >
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </select>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            name="years_experience_min"
            value={form.years_experience_min}
            onChange={handleChange}
            placeholder="Min Years Experience"
            style={{ flex: 1 }}
          />
          <input
            name="years_experience_max"
            value={form.years_experience_max}
            onChange={handleChange}
            placeholder="Max Years Experience"
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            name="salary_min"
            value={form.salary_min}
            onChange={handleChange}
            placeholder="Min Salary"
            style={{ flex: 1 }}
          />
          <input
            name="salary_max"
            value={form.salary_max}
            onChange={handleChange}
            placeholder="Max Salary"
            style={{ flex: 1 }}
          />
          <input
            name="salary_currency"
            value={form.salary_currency}
            onChange={handleChange}
            style={{ width: 80 }}
          />
        </div>
        <input
          name="expires_at"
          value={form.expires_at}
          onChange={handleChange}
          placeholder="Expiration Date (YYYY-MM-DD)"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button type="submit">Add Variant</button>
      </form>
      <h2>Existing Variants</h2>
      <table style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Views</th>
            <th>Clicks</th>
            <th>Applies</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {variants.map(v => (
            <tr key={v.id} style={{ background: v.active ? '#333' : 'transparent' }}>
              <td>{v.title}</td>
              <td>{v.description}</td>
              <td>{v.view_count}</td>
              <td>{v.click_count}</td>
              <td>{v.apply_count}</td>
              <td>{v.active ? 'Yes' : 'No'}</td>
              <td>
                {!v.active && (
                  <button type="button" onClick={() => activateVariant(v.id)}>
                    Activate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
