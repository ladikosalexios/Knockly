import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AdminJobForm from './AdminJobForm';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  };
});

describe('AdminJobForm status polling', () => {
  let intervalFn;

  beforeEach(() => {
    vi.clearAllMocks();
    intervalFn = null;
    vi.spyOn(global, 'setInterval').mockImplementation((fn) => {
      intervalFn = fn;
      return 1;
    });
    vi.spyOn(global, 'clearInterval').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows success when embedding generated', async () => {
    api.get
      .mockResolvedValueOnce({ data: { id: 1, company_id: 1 } })
      .mockResolvedValueOnce({ data: { embedding_state: 'processing' } })
      .mockResolvedValueOnce({ data: { embedding_state: 'generated', skill_count: 2 } });
    api.post
      .mockResolvedValueOnce({ data: { id: 10 } })
      .mockResolvedValueOnce({ data: { id: 20 } });

    render(
      <MemoryRouter>
        <AdminJobForm />
      </MemoryRouter>
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText('Job Title *'), { target: { value: 'Engineer' } });
    fireEvent.change(screen.getByPlaceholderText('Job Description *'), { target: { value: 'Desc' } });
    fireEvent.click(screen.getByLabelText('Remote Position'));
    fireEvent.click(screen.getByRole('button', { name: /Create Job \+ JD/ }));

    await waitFor(() => expect(intervalFn).toBeTruthy());

    await intervalFn();
    await intervalFn();

    await screen.findByText('Job + JD created (2 skills)');
  });

  it('shows error when processing incomplete', async () => {
    api.get
      .mockResolvedValueOnce({ data: { id: 1, company_id: 1 } })
      .mockResolvedValue({ data: { embedding_state: 'processing' } });
    api.post
      .mockResolvedValueOnce({ data: { id: 10 } })
      .mockResolvedValueOnce({ data: { id: 20 } });

    render(
      <MemoryRouter>
        <AdminJobForm />
      </MemoryRouter>
    );
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText('Job Title *'), { target: { value: 'Engineer' } });
    fireEvent.change(screen.getByPlaceholderText('Job Description *'), { target: { value: 'Desc' } });
    fireEvent.click(screen.getByLabelText('Remote Position'));
    fireEvent.click(screen.getByRole('button', { name: /Create Job \+ JD/ }));

    await waitFor(() => expect(intervalFn).toBeTruthy());

    for (let i = 0; i < 5; i++) {
      await intervalFn();
    }

    await screen.findByText('Job created but processing incomplete');
  });
});

