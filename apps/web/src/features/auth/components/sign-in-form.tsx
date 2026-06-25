'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { AuthAlert } from './auth-alert';
import {
  getAuthErrorMessage,
  useSignInMutation,
} from '@/features/auth/lib/auth-queries';

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const signInMutation = useSignInMutation();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      await signInMutation.mutateAsync({ email, password });
      router.push('/dashboard');
      router.refresh();
    } catch (caught) {
      setError(getAuthErrorMessage(caught, 'Unable to sign in.'));
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <AuthAlert message={error} />

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
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <Eye
            aria-hidden="true"
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-400">
          <input
            type="checkbox"
            className="size-4 rounded border-white/20 bg-slate-950"
          />
          Remember me
        </label>

        <Link href="/forgot-password" className="auth-link">
          Forgot password?
        </Link>
      </div>

      <button
        className="auth-button disabled:opacity-60"
        type="submit"
        disabled={signInMutation.isPending}
      >
        {signInMutation.isPending ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}
