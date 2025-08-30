import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../api', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}));

import api from '../api';
import JobApplicationPage from './JobApplicationPage';

afterEach(() => {
  vi.clearAllMocks();
});

test('disables form while resume is being processed', async () => {
  api.get.mockResolvedValue({
    data: {
      id: 1,
      job_description: {
        title: 'Engineer',
        company_name: 'Acme',
        description: 'Build things',
        requirements: 'Req1\nReq2',
        location: 'Remote'
      }
    }
  });

  let resolveExtract;
  api.post.mockImplementationOnce(() => new Promise(res => { resolveExtract = res; }));

  render(
    <MemoryRouter initialEntries={['/jobs/1/apply']}>
      <Routes>
        <Route path="/jobs/:id/apply" element={<JobApplicationPage />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText('Apply for Engineer');

  const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
  fireEvent.change(screen.getByLabelText('Resume file'), { target: { files: [file] } });

  expect(screen.getByRole('button', { name: /processing resume/i })).toBeDisabled();
  resolveExtract({ data: { resume_text: 'text' } });

  await screen.findByRole('button', { name: /submit application/i });
  expect(screen.getByPlaceholderText('Full Name *')).not.toBeDisabled();
});

test('shows processing state and then thank you after submission', async () => {
  api.get.mockResolvedValue({
    data: {
      id: 1,
      job_description: {
        title: 'Engineer',
        company_name: 'Acme',
        description: 'Build things',
        requirements: 'Req1\nReq2',
        location: 'Remote'
      }
    }
  });
  api.post.mockResolvedValueOnce({ data: { resume_text: 'text' } });
  let resolvePost;
  api.post.mockImplementationOnce(() => new Promise(res => { resolvePost = res; }));

  render(
    <MemoryRouter initialEntries={['/jobs/1/apply']}>
      <Routes>
        <Route path="/jobs/:id/apply" element={<JobApplicationPage />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText('Apply for Engineer');

  const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
  fireEvent.change(screen.getByLabelText('Resume file'), { target: { files: [file] } });

  // wait for extraction to finish
  await screen.findByRole('button', { name: /submit application/i });

  fireEvent.change(screen.getByPlaceholderText('Full Name *'), { target: { value: 'Alice' } });
  fireEvent.change(screen.getByPlaceholderText('Email *'), { target: { value: 'alice@example.com' } });

  fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

  expect(screen.getByRole('button', { name: /processing resume/i })).toBeDisabled();
  resolvePost({});

  await screen.findByText('Thank you for applying!');

  expect(api.post).toHaveBeenNthCalledWith(1, '/api/job_applications/extract_resume', expect.any(FormData));
  expect(api.post).toHaveBeenNthCalledWith(2, '/api/job_applications', expect.any(FormData));
  expect(screen.queryByPlaceholderText('Full Name *')).not.toBeInTheDocument();
  expect(screen.getByText('About Your Role:')).toBeInTheDocument();
});
