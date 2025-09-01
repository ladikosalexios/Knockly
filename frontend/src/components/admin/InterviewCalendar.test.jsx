import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../api', () => ({
  default: { get: vi.fn() }
}));

import api from '../../api';
import InterviewCalendar from './InterviewCalendar';

afterEach(() => {
  vi.clearAllMocks();
});

test('displays scheduled interviews', async () => {
  api.get.mockResolvedValue({
    data: [{
      id: 1,
      scheduled_at: '2025-09-01T10:00:00Z',
      location: 'Office',
      notes: 'Bring resume',
      job_application: { name: 'Alice', job: { posted_by_user: { name: 'Bob' } } }
    }]
  });
  render(<InterviewCalendar />);
  await screen.findByText(/Alice/);
  expect(api.get).toHaveBeenCalledWith('/api/interviews');
});
