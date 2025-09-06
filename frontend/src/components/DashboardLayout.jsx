import { useEffect, useState } from 'react';
import api from '../api';
import { Typography, CssBaseline, Drawer, List, ListItem, ListItemText, Box } from '@mui/material';
import AdminJobForm from '../pages/AdminJobForm';
import InviteUserForm from '../components/InviteUserForm';
import InterviewCalendar from './admin/InterviewCalendar';
import AnalyticsDashboard from './admin/AnalyticsDashboard';
import { Link } from 'react-router-dom';
import InterviewTemplateManager from './admin/InterviewTemplateManager';
import useAutoLogout from '../hooks/useAutoLogout'; // or wherever you save it

const drawerWidth = 240;

const DashboardLayout = () => {
  useAutoLogout();
  const [selectedView, setSelectedView] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchJobs = () => {
    api.get("/api/admin/dashboard")
      .then(res => {
        setJobs(res.data);
      })
      .catch(err => {
        console.error("Error fetching dashboard jobs", err);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    api.get("/api/users/me")
    .then(res => {
      setCurrentUser(res.data);
    })
    .catch(err => {
      console.error("Error fetching current user", err);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await api.delete("/users/sign_out");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const renderStatusDot = (status, expiresAt) => {
    const isExpired = expiresAt && new Date(expiresAt) < new Date();
    if (isExpired || status !== 'active') {
      return <span style={{ color: 'red', fontWeight: 'bold' }}>● Inactive</span>;
    }
    return <span style={{ color: 'lime', fontWeight: 'bold' }}>● Active</span>;
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#1e1e1e', minHeight: '100vh', color: '#fff' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#121212',
            color: '#fff'
          },
        }}
      >
        <List>
          <ListItem button onClick={() => setSelectedView('dashboard')}>
            <ListItemText primary="My Job Posts" />
          </ListItem>
          <ListItem button onClick={() => setSelectedView('jobForm')}>
            <ListItemText primary="Post a Job" />
          </ListItem>
          <ListItem button onClick={() => setSelectedView('calendar')}>
            <ListItemText primary="Calendar" />
          </ListItem>
          <ListItem button onClick={() => setSelectedView('templates')}>
            <ListItemText primary="Interview Templates" />
          </ListItem>
          {currentUser?.is_looply_admin && (
            <ListItem button onClick={() => setSelectedView('analytics')}>
              <ListItemText primary="Analytics" />
            </ListItem>
          )}
          {currentUser?.is_looply_admin && (
            <ListItem button onClick={() => setSelectedView('inviteUser')}>
              <ListItemText primary="Invite User" />
            </ListItem>
          )}
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: '32px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        {selectedView === 'dashboard' && (
          <Box sx={{ width: '100%', maxWidth: '1000px' }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ textAlign: 'left', fontWeight: 'bold', fontSize: '1.5rem' }}
            >
              My Job Posts
            </Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #444', color: '#a8d0ff' }}>
                  <th style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle' }}>Job Title</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle' }}>Location</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle' }}>Type</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle' }}>Status</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle' }}>Applicants</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => {
                  return (
                    <tr
                      key={job.id}
                      style={{
                        borderBottom: '1px solid #333',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle', color: '#a8d0ff' }}>{job.title}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle' }}>{job.location || 'N/A'}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle' }}>{job.job_type || 'N/A'}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle' }}>{renderStatusDot(job.status, job.expires_at)}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle' }}>{job.applicants_count}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'left', verticalAlign: 'middle' }}>
                        <Link to={`/admin/jobs/${job.id}/edit`} style={{ marginRight: 10 }}>
                          <span style={{ fontSize: '1rem', color: '#a8d0ff' }}>✏️</span>
                        </Link>
                        <Link to={`/admin/jobs/${job.id}/applicants`}>
                          <span style={{ fontSize: '1rem', color: '#a8d0ff' }}>📄</span>
                        </Link>
                        <Link to={`/admin/jobs/${job.id}/matches`} style={{ marginLeft: 10 }}>
                          <span style={{ fontSize: '1rem', color: '#a8d0ff' }}>🤝</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        )}
        {selectedView === 'jobForm' && (
          <div style={{ backgroundColor: "#1e1e1e" }}>
            <AdminJobForm onCreated={() => {
              fetchJobs();
              setSelectedView('dashboard');
            }} />
          </div>
        )}
        {selectedView === 'inviteUser' && currentUser?.is_looply_admin && (
          <div style={{ backgroundColor: "#1e1e1e", width: '100%', maxWidth: '600px' }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ textAlign: 'left', fontWeight: 'bold', fontSize: '1.5rem', color: '#a8d0ff' }}
            >
              Invite a Team Member
            </Typography>
            <InviteUserForm />
          </div>
        )}
        {selectedView === 'analytics' && currentUser?.is_looply_admin && (
          <AnalyticsDashboard />
        )}
        {selectedView === 'calendar' && (
          <InterviewCalendar />
        )}
        {selectedView === 'templates' && (
          <InterviewTemplateManager jobs={jobs} />
        )}
      </Box>
    </Box>
  );
};

export default DashboardLayout;