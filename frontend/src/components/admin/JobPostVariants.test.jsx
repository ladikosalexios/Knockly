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
  api.get.mockResolvedValue({ data: [
    { id: 1, copy: 'Variant A', view_count: 2, click_count: 1, apply_count: 0, active: false }
  ] });
  render(<JobPostVariants />);
  await screen.findByText('Variant A');
  expect(api.get).toHaveBeenCalledWith('/api/jobs/1/variants');

  api.post.mockResolvedValue({});
  fireEvent.click(screen.getByText('Activate'));
  expect(api.post).toHaveBeenCalledWith('/api/jobs/1/variants/1/activate');
});
