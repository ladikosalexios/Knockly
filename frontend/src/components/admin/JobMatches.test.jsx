import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../api', () => ({
  default: { get: vi.fn() }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ id: '1' }) };
});

import api from '../../api';
import JobMatches from './JobMatches';

afterEach(() => {
  vi.clearAllMocks();
});

test('displays scoring breakdowns for candidates', async () => {
  api.get.mockResolvedValue({ data: [{ id: 1, name: 'Alice', score: 87.34 }] });
  render(<JobMatches />);
  await screen.findByText('Alice');
  expect(screen.getByText(/87.3%/)).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith('/api/jobs/1/matches');
});
