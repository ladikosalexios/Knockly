import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItem, ListItemText,
  Box
} from '@mui/material';
import AdminJobForm from '../pages/AdminJobForm';

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

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {selectedView === 'dashboard' && (
          <>
            <Typography variant="h6" gutterBottom>My Job Posts</Typography>
            {jobs.map((job) => {
              return (
                <Box
                  key={job.id}
                  sx={{
                    mb: 2,
                    p: 3,
                    maxWidth: 1400,
                    mx: "auto",
                    border: '1px solid #444',
                    borderRadius: 2,
                    backgroundColor: "#262626",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#333",
                      boxShadow: 3,
                      cursor: "default",
                    }
                  }}
                >
                  <Typography variant="h6">{job.title || 'Untitled'}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Status: {job.status}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Expires: {job.expires_at || 'N/A'}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Location: {job.location || 'Unspecified'}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Salary: {
                    job.salary_min && job.salary_max
                      ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                      : 'Not specified'
                  }</Typography>
                  <Box mt={2}>
                    <Typography variant="body2">Skills: {job.skills?.join(', ') || 'None listed'}</Typography>
                    <Typography variant="body2">Applicants: {job.applicants_count}</Typography>
                  </Box>
                </Box>
              );
            })}
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