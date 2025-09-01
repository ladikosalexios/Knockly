import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Modal from './Modal';
import InterviewScheduler from './admin/InterviewScheduler';

export default function JobApplicantsPage() {
  const { id: jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState('');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const statusOptions = ['submitted', 'reviewed', 'interviewed', 'rejected'];

  const normalizeStatus = (status) =>
    typeof status === 'number' ? statusOptions[status] : status;

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await api.get(`/api/job_applications?job_id=${jobId}`);
        const apps = res.data.map(app => ({
          ...app,
          status: normalizeStatus(app.status)
        }));
        setApplicants(apps);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch applicants');
      }
    };
    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (appId, status) => {
    try {
      await api.patch(`/api/job_applications/${appId}`, {
        job_application: { status }
      });
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const openScheduler = (appId) => setSelectedAppId(appId);
  const closeScheduler = () => setSelectedAppId(null);

  return (
    <div style={{ padding: 32, color: '#fff' }}>
      <h2 style={{ marginBottom: 24 }}>Applicants for Job #{jobId}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {applicants.length === 0 ? (
        <p>No applicants yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {applicants.map(app => (
            <div key={app.id} style={{
              background: '#222',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #444',
            }}>
              <h3 style={{ marginBottom: 4 }}>{app.name}</h3>

              <div style={{ marginBottom: 12 }}>
                <label style={{ marginRight: 8 }}>Status:</label>
                <select
                  value={normalizeStatus(app.status) || 'submitted'}
                  onChange={e => handleStatusChange(app.id, e.target.value)}
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '4px 16px',
                marginBottom: 12
              }}>
                <p>Email: <a href={`mailto:${app.email}`} style={{ color: '#00d0ff' }}>{app.applicant_profile?.email}</a></p>
                <p>Phone: {app.phone || 'N/A'}</p>
                <p>Work Auth: {app.work_authorization || 'N/A'}</p>
                <p>Gender: {app.gender || 'N/A'}</p>
                <p>Ethnicity: {app.ethnicity || 'N/A'}</p>
                <p>Disability: {app.disability_status || 'N/A'}</p>
                <p>Veteran: {app.veteran_status || 'N/A'}</p>
              </div>

              {/* Match Score */}
              {app.match_score != null && (
                <div style={{ marginTop: 16 }}>
                  <p><strong>Match Score:</strong> {app.match_score.toFixed(1)}%</p>
                  {app.match_reason && (
                    <p style={{ fontStyle: 'italic', color: '#ccc' }}>{app.match_reason}</p>
                  )}
                </div>
              )}

              {/* Experiences */}
              {app.applicant_profile?.applicant_experiences?.length > 0 && (
                <details style={{ marginTop: 16 }}>
                  <summary style={{ cursor: 'pointer' }}>Experience</summary>
                  <div>
                    {app.applicant_profile.applicant_experiences.map((exp, i) => (
                      <div key={i} style={{ marginTop: 8 }}>
                        <p><strong>{exp.job_title}</strong> at {exp.company_name}</p>
                        <p style={{ fontSize: '14px', color: '#aaa' }}>
                          {exp.start_date || 'Start N/A'} – {exp.end_date || 'End N/A'}
                        </p>
                        {exp.description && <p>{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Educations */}
              {app.applicant_profile?.applicant_educations?.length > 0 && (
                <details style={{ marginTop: 16 }}>
                  <summary style={{ cursor: 'pointer' }}>Education</summary>
                  <div>
                    {app.applicant_profile.applicant_educations.map((edu, i) => (
                      <div key={i} style={{ marginTop: 8 }}>
                        <p><strong>{edu.degree}</strong> from {edu.school}</p>
                        {edu.description && <p>{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Skills */}
              {app.applicant_profile?.skills?.length > 0 && (
                <details style={{ marginTop: 16 }}>
                  <summary style={{ cursor: 'pointer' }}>Skills</summary>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    {app.applicant_profile.skills.map((skill, i) => (
                      <span key={i} style={{
                        background: '#333',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        border: '1px solid #555'
                      }}>
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </details>
              )}
              <button onClick={() => openScheduler(app.id)} style={{ marginTop: 16 }}>Schedule Interview</button>
            </div>
          ))}
        </div>
      )}
      {selectedAppId && (
        <Modal onClose={closeScheduler}>
          <InterviewScheduler jobApplicationId={selectedAppId} />
        </Modal>
      )}
    </div>
  );
}
