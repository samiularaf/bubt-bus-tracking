import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { ToastProvider } from '../components/Toast';
import * as authApi from '../features/auth/api';

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <LoginPage />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email and password fields', () => {
    renderLoginPage();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('shows an error message when login fails', async () => {
    vi.spyOn(authApi, 'mockLogin').mockRejectedValue(new Error('Incorrect email/ID or password.'));

    renderLoginPage();
    await userEvent.type(screen.getByLabelText('Email'), 'wrong@bubt.edu.bd');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(screen.getByText('Incorrect email/ID or password.')).toBeInTheDocument();
    });
  });

  it('calls mockLogin with the entered credentials on submit', async () => {
    const loginSpy = vi
      .spyOn(authApi, 'mockLogin')
      .mockResolvedValue({ role: 'user', name: 'Rafi Ahmed', mustChangePassword: false });

    renderLoginPage();
    await userEvent.type(screen.getByLabelText('Email'), 'rafi@bubt.edu.bd');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({
        identifier: 'rafi@bubt.edu.bd',
        password: 'password123',
      });
    });
  });

  it('has links to register, forgot password, driver login, and admin login', () => {
    renderLoginPage();
    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText('Driver login')).toBeInTheDocument();
    expect(screen.getByText('Admin login')).toBeInTheDocument();
  });
});
