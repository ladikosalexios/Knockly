import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import AdminJobForm from './AdminJobForm.jsx';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({})
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

test('shows validation message when location missing', async () => {
  api.get.mockResolvedValueOnce({ data: { id: 1, company_id: 1 } });

  render(
    <MemoryRouter>
      <AdminJobForm />
    </MemoryRouter>
  );

  await waitFor(() => expect(api.get).toHaveBeenCalled());

  fireEvent.change(screen.getByPlaceholderText('Job Title *'), { target: { value: 'Engineer' } });
  fireEvent.change(screen.getByPlaceholderText('Job Description *'), { target: { value: 'Build things' } });

  fireEvent.click(screen.getByRole('button', { name: /create job \+ jd/i }));

  expect(await screen.findByText('Location is required unless the job is remote.')).toBeInTheDocument();
  expect(api.post).not.toHaveBeenCalled();
});

test('submits form and shows success message', async () => {
  api.get.mockResolvedValueOnce({ data: { id: 1, company_id: 1 } });
  api.post.mockImplementation(url => {
    if (url === '/api/jobs') return Promise.resolve({ data: { id: 99 } });
    if (url === '/api/job_descriptions') return Promise.resolve({ data: {} });
    return Promise.resolve({});
  });

  render(
    <MemoryRouter>
      <AdminJobForm />
    </MemoryRouter>
  );

  await waitFor(() => expect(api.get).toHaveBeenCalled());

  fireEvent.change(screen.getByPlaceholderText('Job Title *'), { target: { value: 'Engineer' } });
  fireEvent.change(screen.getByPlaceholderText('Job Description *'), { target: { value: 'Build things' } });
  fireEvent.change(screen.getByPlaceholderText('Location (leave blank if remote)'), { target: { value: 'NYC' } });

  fireEvent.click(screen.getByRole('button', { name: /create job \+ jd/i }));

  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/jobs', expect.anything()));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/job_descriptions', expect.anything()));
  expect(await screen.findByText('Job + JD created!')).toBeInTheDocument();
});
