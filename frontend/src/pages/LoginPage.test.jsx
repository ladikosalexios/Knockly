import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React, { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import api from '../api';
import { vi } from 'vitest';

vi.mock('../api', () => ({
  default: {
    post: vi.fn()
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

function Wrapper() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <MemoryRouter>
      <LoginPage
        loginEmail={email}
        setLoginEmail={setEmail}
        loginPassword={password}
        setLoginPassword={setPassword}
        loginMsg=""
      />
    </MemoryRouter>
  );
}

it('submits credentials and navigates on success', async () => {
  api.post.mockResolvedValueOnce({});

  render(<Wrapper />);

  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/users/sign_in', {
      user: { email: 'user@example.com', password: 'secret' }
    });
  });

  await waitFor(() => {
    expect(screen.getByText(/Login successful/i)).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });
});
