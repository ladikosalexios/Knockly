import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../api', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ id: '1' }) };
});

import api from '../../api';
import JobPostVariants from './JobPostVariants';

afterEach(() => {
  vi.clearAllMocks();
});

test('renders variants and activates one', async () => {
  api.get.mockImplementation(url => {
    if (url === '/api/jobs/1/variants') {
      return Promise.resolve({ data: [
        { id: 1, title: 'Variant A', description: 'Desc', view_count: 2, click_count: 1, apply_count: 0, active: false }
      ] });
    }
    if (url === '/api/admin/dashboard') {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: [] });
  });
  render(<JobPostVariants />);
  await screen.findByText('Variant A');
  expect(api.get).toHaveBeenCalledWith('/api/jobs/1/variants');

  api.post.mockResolvedValue({});
  fireEvent.click(screen.getByText('Activate'));
  expect(api.post).toHaveBeenCalledWith('/api/jobs/1/variants/1/activate');
});

test('prefills form from selected job', async () => {
  api.get.mockImplementation(url => {
    if (url === '/api/jobs/1/variants') {
      return Promise.resolve({ data: [] });
    }
    if (url === '/api/admin/dashboard') {
      return Promise.resolve({ data: [
        { id: 2, title: 'Template Job', location: 'SF', is_remote: true, description: 'Desc', requirements: 'Req', skills: ['JS'], job_type: 'contract', years_experience_min: 3, years_experience_max: 5, salary_min: 10, salary_max: 20, salary_currency: 'USD', variant_count: 0 }
      ] });
    }
    return Promise.resolve({ data: [] });
  });

  render(<JobPostVariants />);

  const select = await screen.findByTestId('variant-template');
  fireEvent.change(select, { target: { value: '2' } });
  expect(screen.getByPlaceholderText('Job Title *')).toHaveValue('Template Job');
  expect(screen.getByLabelText('Remote Position')).toBeChecked();
});
