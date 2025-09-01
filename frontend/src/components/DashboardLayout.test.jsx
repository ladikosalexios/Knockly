import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../api', () => ({ default: { get: vi.fn(), delete: vi.fn() } }));
vi.mock('./admin/InterviewCalendar', () => ({ default: () => <div>Calendar View</div> }));
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
    if (url === '/api/users/me') return Promise.resolve({ data: {} });
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
