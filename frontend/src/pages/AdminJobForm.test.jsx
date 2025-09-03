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

//
// Polling tests
//
describe('AdminJobForm status polling', () => {
  let intervalFn: (() => Promise<void> | void) | null;

  beforeEach(() => {
    vi.clearAllMocks();
    intervalFn = null;

    vi.spyOn(global, 'setInterval').mockImplementation((fn: TimerHandler) => {
      // capture the polling callback so we can invoke it manually
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      intervalFn = fn as any;
      return 1 as unknown as NodeJS.Timer;
    });

    vi.spyOn(global, 'clearInterval').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows success when embedding generated', async () => {
    api.get
      // initial current_user / company fetch
      .mockResolvedValueOnce({ data: { id: 1, company_id: 1 } })
      // first poll -> processing
      .mockResolvedValueOnce({ data: { embedding_state: 'processing' } })
      // second poll -> generated w/ skill_count
      .mockResolvedValueOnce({ data: { embedding_state: 'generated', skill_count: 2 } });

    api.post
      // /api/jobs
      .mockResolvedValueOnce({ data: { id: 10 } })
      // /api/job_descriptions
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
    fireEvent.click(screen.getByRole('button', { name: /Create Job \+ JD/i }));

    await waitFor(() => expect(intervalFn).toBeTruthy());

    // simulate two polling ticks
    await (intervalFn as Function)();
    await (intervalFn as Function)();

    await screen.findByText('Job + JD created (2 skills)');
  });

  it('shows error when processing incomplete', async () => {
    api.get
      // initial current_user / company fetch
      .mockResolvedValueOnce({ data: { id: 1, company_id: 1 } })
      // subsequent polls always processing
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
    fireEvent.click(screen.getByRole('button', { name: /Create Job \+ JD/i }));

    await waitFor(() => expect(intervalFn).toBeTruthy());

    // simulate several polling ticks with no completion
    for (let i = 0; i < 5; i++) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      await (intervalFn as Function)();
    }

    await screen.findByText('Job created but processing incomplete');
  });
});

//
// Basic validation & submit flow tests
//
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

  expect(
    await screen.findByText('Location is required unless the job is remote.')
  ).toBeInTheDocument();
  expect(api.post).not.toHaveBeenCalled();
});

test('submits form and shows success message', async () => {
  api.get.mockResolvedValueOnce({ data: { id: 1, company_id: 1 } });

  api.post.mockImplementation((url: string) => {
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
  fireEvent.change(
    screen.getByPlaceholderText('Location (leave blank if remote)'),
    { target: { value: 'NYC' } }
  );

  fireEvent.click(screen.getByRole('button', { name: /create job \+ jd/i }));

  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/jobs', expect.anything()));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/job_descriptions', expect.anything()));

  expect(await screen.findByText('Job + JD created!')).toBeInTheDocument();
});
