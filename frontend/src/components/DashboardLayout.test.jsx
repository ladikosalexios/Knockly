import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../api', () => ({ default: { get: vi.fn(), delete: vi.fn() } }));
vi.mock('./admin/InterviewCalendar', () => ({ default: () => <div>Calendar View</div> }));
vi.mock('./admin/AnalyticsDashboard', () => ({ default: () => <div>Analytics View</div> }));
vi.mock('../pages/AdminJobForm', () => ({ default: () => <div>Job Form</div> }));
vi.mock('./InviteUserForm', () => ({ default: () => <div>Invite Form</div> }));
vi.mock('../hooks/useAutoLogout', () => ({ default: () => {} }));
vi.mock('@mui/material', () => ({
  Typography: ({ children }) => <div>{children}</div>,
  CssBaseline: ({ children }) => <div>{children}</div>,
  Drawer: ({ children }) => <div>{children}</div>,
  List: ({ children }) => <div>{children}</div>,
  ListItem: ({ children, onClick }) => <div onClick={onClick}>{children}</div>,
  ListItemText: ({ primary }) => <span>{primary}</span>,
  Box: ({ children }) => <div>{children}</div>,
}));

import api from '../api';
import DashboardLayout from './DashboardLayout';

afterEach(() => {
  vi.clearAllMocks();
});

test('navigates to calendar view from menu', async () => {
  api.get.mockImplementation(url => {
    if (url === '/api/admin/dashboard') return Promise.resolve({ data: [] });
    if (url === '/api/users/me') return Promise.resolve({ data: { is_looply_admin: true } });
    return Promise.resolve({ data: [] });
  });

  render(
    <MemoryRouter>
      <DashboardLayout />
    </MemoryRouter>
  );

  fireEvent.click(screen.getByText('Calendar'));
  expect(await screen.findByText('Calendar View')).toBeInTheDocument();
});

test('navigates to analytics view from menu', async () => {
  api.get.mockImplementation(url => {
    if (url === '/api/admin/dashboard') return Promise.resolve({ data: [] });
    if (url === '/api/users/me') return Promise.resolve({ data: { is_looply_admin: true } });
    return Promise.resolve({ data: [] });
  });

  render(
    <MemoryRouter>
      <DashboardLayout />
    </MemoryRouter>
  );

  const analyticsItem = await screen.findByText('Analytics');
  fireEvent.click(analyticsItem);
  expect(await screen.findByText('Analytics View')).toBeInTheDocument();
});

test('shows variant link and count for each job', async () => {
  api.get.mockImplementation(url => {
    if (url === '/api/admin/dashboard') {
      return Promise.resolve({ data: [
        { id: 1, title: 'Job 1', location: 'NY', job_type: 'full-time', status: 'active', expires_at: null, applicants_count: 0, variant_count: 2 }
      ] });
    }
    if (url === '/api/users/me') {
      return Promise.resolve({ data: { is_looply_admin: false } });
    }
    return Promise.resolve({ data: [] });
  });

  render(
    <MemoryRouter>
      <DashboardLayout />
    </MemoryRouter>
  );

  const link = await screen.findByText('🧪');
  expect(link.closest('a')).toHaveAttribute('href', '/admin/jobs/1/variants');
  const row = link.closest('tr');
  expect(within(row).getByText('2')).toBeInTheDocument();
});
