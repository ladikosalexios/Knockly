import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItem, ListItemText,
  Box
} from '@mui/material';

const drawerWidth = 240;

const DashboardLayout = () => {
  const [selectedView, setSelectedView] = useState('dashboard');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (selectedView === 'dashboard') {
      axios.get('/api/company_jobs', { withCredentials: true })
        .then(res => setJobs(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.error(err));
    }
  }, [selectedView]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
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
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
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
              const jobDesc = job.job_description || {};
              return (
                <Box key={job.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Typography variant="subtitle1">Title: {jobDesc.title || 'Untitled'}</Typography>
                  <Typography>Status: {job.status}</Typography>
                  <Typography>Expires: {job.expires_at || 'N/A'}</Typography>
                  <Typography>Location: {jobDesc.location || 'Unspecified'}</Typography>
                  <Typography>Salary: {
                    jobDesc.salary_min && jobDesc.salary_max
                      ? `$${jobDesc.salary_min.toLocaleString()} - $${jobDesc.salary_max.toLocaleString()}`
                      : 'Not specified'
                  }</Typography>
                </Box>
              );
            })}
          </>
        )}
        {selectedView === 'jobForm' && (
          <Typography variant="body2" color="text.secondary" mt={2}>
            (Job form placeholder — will show job posting form)
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DashboardLayout;