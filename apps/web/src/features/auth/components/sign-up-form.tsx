'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Eye } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { AuthAlert } from './auth-alert';
import {
  getAuthErrorMessage,
  useSignUpMutation,
} from '@/features/auth/lib/auth-queries';

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const signUpMutation = useSignUpMutation();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      await signUpMutation.mutateAsync({ name, email, password });
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (caught) {
      setError(getAuthErrorMessage(caught, 'Unable to create account.'));
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <AuthAlert message={error} />

      <div>
        <label className="auth-label" htmlFor="full-name">
          Full name
        </label>
        <input
          id="full-name"
          className="auth-input"
          placeholder="Enter your full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
      </div>

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

      <div>
        <label className="auth-label" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            className="auth-input pr-10"
            placeholder="Create a strong password"
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

      <button
        className="auth-button disabled:opacity-60"
        type="submit"
        disabled={signUpMutation.isPending}
      >
        {signUpMutation.isPending ? 'Creating Account...' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link href="/sign-in" className="auth-link">
          Sign in
        </Link>
      </p>
    </form>
  );
}
