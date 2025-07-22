import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function JobApplicantsPage() {
  const { id: jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/job_applications?job_id=${jobId}`, {
          withCredentials: true
        });
        setApplicants(res.data);
      } catch (err) {
        setError('Failed to fetch applicants');
      }
    };
    fetchApplicants();
  }, [jobId]);

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
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ marginBottom: 4 }}>{app.name}</h3>
              <p>Email: <a href={`mailto:${app.email}`} style={{ color: '#00d0ff' }}>{app.applicant_profile?.email}</a></p>
              <p>Phone: {app.phone || 'N/A'}</p>
              <p>Work Auth: {app.work_authorization || 'N/A'}</p>
              <p>Gender: {app.gender || 'N/A'}</p>
              <p>Ethnicity: {app.ethnicity || 'N/A'}</p>
              <p>Disability: {app.disability_status || 'N/A'}</p>
              <p>Veteran: {app.veteran_status || 'N/A'}</p>

              {/* Match Score */}
              {app.match_score !== undefined && (
                <div style={{ marginTop: 16 }}>
                  <p><strong>Match Score:</strong> {app.match_score}</p>
                  {app.match_reason && <p style={{ fontStyle: 'italic', color: '#ccc' }}>{app.match_reason}</p>}
                </div>
              )}

              {/* Experiences */}
              {app.applicant_profile?.applicant_experiences?.length > 0 && (
                <>
                  <h4 style={{ marginTop: 16 }}>Experience</h4>
                  {app.applicant_profile.applicant_experiences.map((exp, i) => (
                    <div key={i}>
                      <p><strong>{exp.job_title}</strong> at {exp.company_name}</p>
                      <p style={{ fontSize: '14px', color: '#aaa' }}>
                        {exp.start_date || 'Start N/A'} – {exp.end_date || 'End N/A'}
                      </p>
                      {exp.description && <p>{exp.description}</p>}
                    </div>
                  ))}
                </>
              )}

              {/* Educations */}
              {app.applicant_profile?.applicant_educations?.length > 0 && (
                <>
                  <h4 style={{ marginTop: 16 }}>Education</h4>
                  {app.applicant_profile.applicant_educations.map((edu, i) => (
                    <div key={i}>
                      <p><strong>{edu.degree}</strong> from {edu.school}</p>
                      {edu.description && <p>{edu.description}</p>}
                    </div>
                  ))}
                </>
              )}

              {/* Skills */}
              {app.applicant_profile?.skills?.length > 0 && (
                <>
                  <h4 style={{ marginTop: 16 }}>Skills</h4>
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
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}