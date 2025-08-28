import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../api', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}));

import api from '../api';
import JobApplicationPage from './JobApplicationPage';

test('hides form and shows thank you after submission', async () => {
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
  api.post.mockResolvedValue({});

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
  fireEvent.change(screen.getByPlaceholderText('Paste your resume here *'), { target: { value: 'My resume' } });

  fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

  await screen.findByText('Thank you for applying!');

  expect(api.post).toHaveBeenCalled();
  expect(screen.queryByPlaceholderText('Full Name *')).not.toBeInTheDocument();
  expect(screen.getByText('About Your Role:')).toBeInTheDocument();
});
