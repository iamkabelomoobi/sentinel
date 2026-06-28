'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Eye } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { AuthAlert } from './auth-alert';
import {
  getAuthErrorMessage,
  useResetPasswordMutation,
} from '@/features/auth/lib/auth-queries';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(token ? '' : 'Reset token is missing.');
  const [success, setSuccess] = useState('');
  const resetPasswordMutation = useResetPasswordMutation();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token is missing.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: password,
      });
      setSuccess('Password reset. You can now sign in.');
    } catch (caught) {
      setError(getAuthErrorMessage(caught, 'Unable to reset password.'));
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Link href="/sign-in" className="auth-link text-xs">
        &larr; Back to sign in
      </Link>

      <AuthAlert message={error} />
      <AuthAlert message={success} tone="success" />

      <div>
        <label className="auth-label" htmlFor="new-password">
          New password
        </label>
        <div className="relative">
          <input
            id="new-password"
            className="auth-input pr-10"
            placeholder="Enter new password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Eye
            aria-hidden="true"
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 text-xs font-medium text-emerald-400">
        {[
          'At least 8 characters',
          'Contains a number',
          'Contains an uppercase letter',
        ].map((item) => (
          <p key={item} className="flex items-center gap-2">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            {item}
          </p>
        ))}
      </div>

      <div>
        <label className="auth-label" htmlFor="confirm-password">
          Confirm password
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            className="auth-input pr-10"
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Eye
            aria-hidden="true"
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          />
        </div>
      </div>

      <button
        className="auth-button disabled:opacity-60"
        type="submit"
        disabled={resetPasswordMutation.isPending || !token}
      >
        {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}
