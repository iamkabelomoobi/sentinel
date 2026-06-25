'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

import { AuthAlert } from './auth-alert';
import {
  getAuthErrorMessage,
  useSendVerificationEmailMutation,
  useVerifyEmailMutation,
} from '@/features/auth/lib/auth-queries';

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(
    token ? '' : 'Please check your inbox and click the link to verify your account.',
  );
  const verifyEmailMutation = useVerifyEmailMutation();
  const sendVerificationEmailMutation = useSendVerificationEmailMutation();
  const verifiedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token || verifiedTokenRef.current === token) {
      return;
    }

    let cancelled = false;
    verifiedTokenRef.current = token;

    verifyEmailMutation
      .mutateAsync({ token })
      .then(() => {
        if (!cancelled) {
          setSuccess('Email verified. You can now sign in.');
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(getAuthErrorMessage(caught, 'Unable to verify email.'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, verifyEmailMutation]);

  async function onResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await sendVerificationEmailMutation.mutateAsync({
        email,
        callbackURL: `${window.location.origin}/sign-in`,
      });
      setSuccess('Verification email sent.');
    } catch (caught) {
      setError(getAuthErrorMessage(caught, 'Unable to resend email.'));
    }
  }

  const loading =
    verifyEmailMutation.isPending || sendVerificationEmailMutation.isPending;

  return (
    <div className="flex flex-col gap-5 text-center">
      <AuthAlert message={error} />
      <AuthAlert message={success} tone="success" />

      {loading ? (
        <p className="text-sm leading-6 text-slate-400">Working on it...</p>
      ) : null}

      {!token ? (
        <form className="flex flex-col gap-3 text-left" onSubmit={onResend}>
          <label className="auth-label" htmlFor="verification-email">
            Email address
          </label>
          <input
            id="verification-email"
            className="auth-input"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button className="auth-button disabled:opacity-60" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Resend email'}
          </button>
        </form>
      ) : null}

      <div className="flex flex-col gap-2">
        <Link href="/sign-up" className="auth-link text-sm">
          Change email address
        </Link>
        <Link href="/sign-in" className="text-sm text-slate-400 transition hover:text-slate-200">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
