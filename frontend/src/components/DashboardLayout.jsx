import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItem, ListItemText,
  Box
} from '@mui/material';
import AdminJobForm from '../pages/AdminJobForm';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const DashboardLayout = () => {
  const [selectedView, setSelectedView] = useState('dashboard');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/api/admin/dashboard", {
      withCredentials: true
    })
    .then(res => {
      setJobs(res.data);
    })
    .catch(err => {
      console.error("Error fetching dashboard jobs", err);
    });
  }, []);

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#1e1e1e', minHeight: '100vh', color: '#fff' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: 1300, backgroundColor: '#1e1e1e', color: '#fff' }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

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
        <Toolbar />
        <List>
          <ListItem button onClick={() => setSelectedView('dashboard')}>
            <ListItemText primary="My Job Posts" />
          </ListItem>
          <ListItem button onClick={() => setSelectedView('jobForm')}>
            <ListItemText primary="Post a Job" />
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 5, px: 8 }}>
        <Toolbar />
        {selectedView === 'dashboard' && (
          <>
            <Typography variant="h6" gutterBottom>My Job Posts</Typography>
            {jobs.map(job => (
              <div
                key={job.id}
                style={{
                  background: "#222",
                  padding: "24px 32px",
                  borderRadius: 12,
                  border: "1px solid #444",
                  marginBottom: 24,
                  color: "#fff",
                  width: "900px",
                  margin: "0 auto"
                }}
              >
                <h3 style={{ marginBottom: 8 }}>{job.title}</h3>
                <p style={{ margin: "4px 0" }}><strong>Status:</strong> {job.status}</p>
                <p style={{ margin: "4px 0" }}><strong>Location:</strong> {job.location || "N/A"}</p>
                <p style={{ margin: "4px 0" }}><strong>Skills:</strong> {job.skills?.join(", ") || "None"}</p>
                <p style={{ margin: "4px 0" }}><strong>Applicants:</strong> {job.applicants_count}</p>
                <p style={{ margin: "4px 0" }}><strong>Posted:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
                <p style={{ margin: "4px 0" }}><strong>Expires:</strong> {job.expires_at ? new Date(job.expires_at).toLocaleDateString() : "N/A"}</p>
                <p style={{ margin: "4px 0" }}><strong>Start Date:</strong> {job.start_date ? new Date(job.start_date).toLocaleDateString() : "N/A"}</p>
                <p style={{ margin: "4px 0" }}><strong>End Date:</strong> {job.end_date ? new Date(job.end_date).toLocaleDateString() : "N/A"}</p>
                <div style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  background: "#1a1a1a",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #333",
                  marginTop: "8px",
                  whiteSpace: "pre-line",
                  lineHeight: 1.6
                }}>
                  <p style={{ margin: 0 }}>
                    <strong>Description:</strong>
                    <br />
                    {job.description}
                  </p>
                </div>
                <div style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  background: "#1a1a1a",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #333",
                  marginTop: "8px",
                  whiteSpace: "pre-line",
                  lineHeight: 1.6
                }}>
                  <p style={{ margin: 0 }}>
                    <strong>Requirements:</strong>
                    <br />
                    {job.requirements}
                  </p>
                </div>

                {job.applicants_count > 0 && (
                  <Link
                    to={`/admin/jobs/${job.id}/applicants`}
                    style={{
                      marginTop: 12,
                      display: "inline-block",
                      background: "#00d0ff",
                      color: "#000",
                      padding: "8px 16px",
                      borderRadius: 6,
                      fontWeight: "bold",
                      textDecoration: "none"
                    }}
                  >
                    View Applicants →
                  </Link>
                )}
              </div>
            ))}
          </>
        )}
        {selectedView === 'jobForm' && (
            <div style={{ marginTop: 40, backgroundColor: "#1e1e1e" }}>
              <AdminJobForm onCreated={() => {
                // Optionally trigger refresh or message
                console.log("Job created!");
              }} />
            </div>
        )}
      </Box>
    </Box>
  );
};

export default DashboardLayout;