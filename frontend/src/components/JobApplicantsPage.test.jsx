import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('../api', () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() }
}));

import api from '../api';

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
  const { default: JobApplicantsPage } = await import('./JobApplicantsPage');
  render(<JobApplicantsPage />);
  await screen.findByText('Alice');
  fireEvent.click(screen.getByText('Schedule Interview'));
  await screen.findByText('Interview Scheduler');
  expect(api.get).toHaveBeenLastCalledWith('/api/interviews?job_application_id=1');
});

test('disables schedule button after interview scheduled', async () => {
  vi.resetModules();
  vi.doMock('./admin/InterviewScheduler', () => ({
    default: ({ onScheduled }) => (
      <div>
        <span>Mock Scheduler</span>
        <button onClick={onScheduled}>Save</button>
      </div>
    )
  }));
  const { default: JobApplicantsPageMocked } = await import('./JobApplicantsPage');

  api.get
    .mockResolvedValueOnce({ data: [{ id: 1, name: 'Alice', applicant_profile: { email: 'a@example.com' }, status: 'submitted' }] })
    .mockResolvedValueOnce({ data: [{ id: 1, name: 'Alice', applicant_profile: { email: 'a@example.com' }, status: 'interviewed' }] });
  render(<JobApplicantsPageMocked />);
  await screen.findByText('Alice');
  fireEvent.click(screen.getByText('Schedule Interview'));
  await screen.findByText('Mock Scheduler');
  fireEvent.click(screen.getByText('Save'));
  const btn = await screen.findByText('Interview Scheduled');
  expect(btn).toBeDisabled();
});

test('records fit feedback for applicant', async () => {
  vi.resetModules();
  api.get.mockResolvedValueOnce({
    data: [
      {
        id: 1,
        name: 'Alice',
        applicant_profile: { email: 'a@example.com' },
        status: 'submitted'
      }
    ]
  });
  const { default: JobApplicantsPage } = await import('./JobApplicantsPage');
  render(<JobApplicantsPage />);
  await screen.findByText('Alice');
  const input = screen.getByLabelText('Fit Feedback:');
  fireEvent.change(input, { target: { value: '25' } });
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith(
      '/api/job_applications/1/feedback',
      { job_application: { fit_feedback: 25 } }
    )
  );
});
