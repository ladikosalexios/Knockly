import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Modal from './Modal';
import InterviewScheduler from './admin/InterviewScheduler';
import ScorecardForm from './admin/ScorecardForm';

const STATUS_OPTIONS = ['submitted', 'reviewed', 'interviewed', 'rejected'];
const normalizeStatus = (status) =>
  typeof status === 'number' ? STATUS_OPTIONS[status] : status;

export default function JobApplicantsPage() {
  const { id: jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState('');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [scorecardInterviewId, setScorecardInterviewId] = useState(null);
  const statusOptions = STATUS_OPTIONS;

  const fetchApplicants = async () => {
    try {
      const res = await api.get(`/api/job_applications?job_id=${jobId}`);
      const apps = await Promise.all(
        res.data.map(async app => {
          const interviewsRes = await api.get(`/api/interviews?job_application_id=${app.id}`);
          return {
            ...app,
            status: normalizeStatus(app.status),
            interviews: interviewsRes.data
          };
        })
      );
      setApplicants(apps);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch applicants');
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (appId, status) => {
    try {
      await api.patch(`/api/job_applications/${appId}`, {
        job_application: { status }
      });
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      fetchApplicants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedbackChange = async (appId, fitFeedback) => {
    try {
      await api.post(`/api/job_applications/${appId}/feedback`, {
        job_application: { fit_feedback: fitFeedback }
      });
      setApplicants(prev =>
        prev.map(a => (a.id === appId ? { ...a, fit_feedback: fitFeedback } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const openScheduler = (app) => {
    setSelectedAppId(app.id);
    setSelectedApplicant(app);
  };
  const closeScheduler = () => {
    setSelectedAppId(null);
    setSelectedApplicant(null);
  };
  const openScorecard = (interviewId) => {
    setScorecardInterviewId(interviewId);
  };
  const closeScorecard = () => {
    setScorecardInterviewId(null);
  };
  const markScheduled = (appId) => {
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: 'interviewed' } : a));
    closeScheduler();
    fetchApplicants();
  };

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

              {/* Fit Feedback */}
              <div style={{ marginTop: 16 }}>
                <label>
                  Fit Feedback:
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={app.fit_feedback ?? ''}
                    onChange={e =>
                      handleFeedbackChange(app.id, Number(e.target.value))
                    }
                    style={{ marginLeft: 8, width: 60 }}
                  />
                </label>
              </div>

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
              <button
                onClick={() => openScheduler(app)}
                style={{ marginTop: 16 }}
              >
                {app.status === 'interviewed' ? 'Edit Interview' : 'Schedule Interview'}
              </button>

              {app.interviews && app.interviews.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  {app.interviews.map(iv => (
                    <div key={iv.id} style={{ marginBottom: 12 }}>
                      <div>
                        Interview on {new Date(iv.scheduled_at).toLocaleString()}{' '}
                        {iv.interview_template && `- ${iv.interview_template.title}`}
                      </div>
                      {iv.scorecards && iv.scorecards.length > 0 && (
                        <ul style={{ marginTop: 4 }}>
                          {iv.scorecards.map(sc => (
                            <li key={sc.id}>
                              {sc.evaluator?.name || sc.evaluator?.email}: {Object.values(sc.responses || {}).join(', ')}
                            </li>
                          ))}
                        </ul>
                      )}
                      {iv.interview_template && (
                        <button onClick={() => openScorecard(iv.id)} style={{ marginTop: 4 }}>
                          Add Scorecard
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {selectedAppId && (
        <Modal onClose={closeScheduler}>
          <InterviewScheduler
            jobApplicationId={selectedAppId}
            jobId={jobId}
            applicantName={selectedApplicant?.name}
            onScheduled={() => markScheduled(selectedAppId)}
          />
        </Modal>
      )}
      {scorecardInterviewId && (
        <Modal onClose={closeScorecard}>
          <ScorecardForm
            interviewId={scorecardInterviewId}
            onSubmitted={() => {
              closeScorecard();
              fetchApplicants();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
