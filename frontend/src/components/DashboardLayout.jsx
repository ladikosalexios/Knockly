import React, { useEffect, useState } from 'react';
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
              console.log(job)
              return (
                <Box key={job.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Typography variant="subtitle1">Title: {job.title || 'Untitled'}</Typography>
                  <Typography>Status: {job.status}</Typography>
                  <Typography>Expires: {job.expires_at || 'N/A'}</Typography>
                  <Typography>Location: {job.location || 'Unspecified'}</Typography>
                  <Typography>Salary: {
                    job.salary_min && job.salary_max
                      ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
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