import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobApplicantsPage from './JobApplicantsPage';
import api from '../api';
import { vi } from 'vitest';

vi.mock('../api', () => ({
  default: { get: vi.fn(), patch: vi.fn() }
}));

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return { ...actual, useParams: () => ({ id: '1' }) };
});

test('searches applicant profiles', async () => {
  api.get
    .mockResolvedValueOnce({ data: [] })
    .mockResolvedValueOnce({ data: [{ id: 1, name: 'Jane', similarity: 0.9, skills: ['ruby'] }] });

  render(<JobApplicantsPage />);

  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/job_applications?job_id=1'));

  fireEvent.change(screen.getByPlaceholderText('Search applicants'), { target: { value: 'ruby' } });
  fireEvent.click(screen.getByText('Search'));

  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/api/applicant_profiles', { params: { q: 'ruby' } }));

  await waitFor(() => expect(screen.getByText(/Jane/)).toBeInTheDocument());
  expect(screen.getByText(/Similarity:/)).toHaveTextContent('0.90');
  expect(screen.getByText(/Skills: ruby/)).toBeInTheDocument();
});
