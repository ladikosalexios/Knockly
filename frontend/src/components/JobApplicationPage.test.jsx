import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../api', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}));

import api from '../api';
import JobApplicationPage from './JobApplicationPage';

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
  let resolvePost;
  api.post.mockImplementation(() => new Promise(res => { resolvePost = res; }));

  render(
    <MemoryRouter initialEntries={['/jobs/1/apply']}>
      <Routes>
        <Route path="/jobs/:id/apply" element={<JobApplicationPage />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText('Apply for Engineer');

  fireEvent.change(screen.getByPlaceholderText('Full Name *'), { target: { value: 'Alice' } });
  fireEvent.change(screen.getByPlaceholderText('Email *'), { target: { value: 'alice@example.com' } });
  fireEvent.change(screen.getByPlaceholderText('Paste your resume here'), { target: { value: 'My resume' } });
  const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
  fireEvent.change(screen.getByLabelText('Resume file'), { target: { files: [file] } });

  fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

  expect(screen.getByRole('button', { name: /processing resume/i })).toBeDisabled();
  expect(screen.getByPlaceholderText('Full Name *')).toBeDisabled();

  resolvePost({});

  await screen.findByText('Thank you for applying!');

  expect(api.post).toHaveBeenCalledWith('/api/job_applications', expect.any(FormData), expect.any(Object));
  expect(screen.queryByPlaceholderText('Full Name *')).not.toBeInTheDocument();
  expect(screen.getByText('About Your Role:')).toBeInTheDocument();
});
