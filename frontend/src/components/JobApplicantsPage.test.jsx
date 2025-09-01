import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('../api', () => ({
  default: { get: vi.fn(), patch: vi.fn() }
}));

import api from '../api';
import JobApplicantsPage from './JobApplicantsPage';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useParams: () => ({ id: 1 }) };
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

test('opens interview scheduler modal', async () => {
  api.get
    .mockResolvedValueOnce({ data: [{ id: 1, name: 'Alice', applicant_profile: { email: 'alice@example.com' }, status: 'submitted' }] })
    .mockResolvedValueOnce({ data: [] });
  render(<JobApplicantsPage />);
  await screen.findByText('Alice');
  fireEvent.click(screen.getByText('Schedule Interview'));
  await screen.findByText('Interview Scheduler');
  expect(api.get).toHaveBeenLastCalledWith('/api/interviews?job_application_id=1');
});
