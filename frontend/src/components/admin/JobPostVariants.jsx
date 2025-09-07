import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

export default function JobPostVariants() {
  const { id: jobId } = useParams();
  const [variants, setVariants] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

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
      await api.post(`/api/jobs/${jobId}/variants`, { variant: { title, description } });
      setTitle('');
      setDescription('');
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
      <h2>Job Post Variants</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={createVariant} style={{ marginBottom: 24 }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Variant title"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Variant description"
          rows={4}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button type="submit">Add Variant</button>
      </form>
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
