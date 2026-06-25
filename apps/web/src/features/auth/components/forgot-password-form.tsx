'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

import { AuthAlert } from './auth-alert';
import {
  getAuthErrorMessage,
  useRequestPasswordResetMutation,
} from '@/features/auth/lib/auth-queries';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const requestPasswordResetMutation = useRequestPasswordResetMutation();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      await requestPasswordResetMutation.mutateAsync({ email, redirectTo });
      setSuccess('Reset link sent. Check your email for the next step.');
    } catch (caught) {
      setError(getAuthErrorMessage(caught, 'Unable to send reset link.'));
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <AuthAlert message={error} />
      <AuthAlert message={success} tone="success" />

      <div>
        <label className="auth-label" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          className="auth-input"
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <button
        className="auth-button disabled:opacity-60"
        type="submit"
        disabled={requestPasswordResetMutation.isPending}
      >
        {requestPasswordResetMutation.isPending
          ? 'Sending...'
          : 'Send Reset Link'}
      </button>

      <p className="text-center text-sm text-slate-400">
        Remember your password?{' '}
        <Link href="/sign-in" className="auth-link">
          Sign in
        </Link>
      </p>
    </form>
  );
}
