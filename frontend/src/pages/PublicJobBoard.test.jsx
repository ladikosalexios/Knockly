import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PublicJobBoard from './PublicJobBoard';
import api from '../api';
import { vi } from 'vitest';

vi.mock('../api', () => ({
  default: {
    get: vi.fn()
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ companySlug: 'acme' }),
    useNavigate: () => mockNavigate
  };
});

it('fetches jobs and navigates to apply page', async () => {
  api.get
    .mockResolvedValueOnce({ data: { name: 'Acme' } })
    .mockResolvedValueOnce({ data: [ { id: 1, job_description: { title: 'Engineer' } } ] });

  render(<PublicJobBoard />);

  await waitFor(() => expect(api.get).toHaveBeenNthCalledWith(1, '/api/companies/slug/acme'));
  await waitFor(() => expect(api.get).toHaveBeenNthCalledWith(2, '/api/companies/acme/jobs'));

  await waitFor(() => expect(screen.getByText('Engineer')).toBeInTheDocument());

  fireEvent.click(screen.getByText('Engineer'));
  expect(mockNavigate).toHaveBeenCalledWith('/jobs/1/apply');
});
