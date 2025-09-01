import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() }
}));

import api from '../../api';
import InterviewScheduler from './InterviewScheduler';

afterEach(() => {
  vi.clearAllMocks();
});

test('renders fetched interviews', async () => {
  api.get.mockResolvedValue({ data: [{ id: 1, scheduled_at: '2025-09-01T12:00:00Z', location: 'Zoom', notes: '' }] });
  render(<InterviewScheduler jobApplicationId={1} />);
  await screen.findByText('Interview Scheduler');
  await screen.findByText(/Zoom/);
  expect(api.get).toHaveBeenCalledWith('/api/interviews?job_application_id=1');
});
