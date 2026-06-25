import Link from 'next/link';

import { AuthCard } from '@/components/auth/auth-card';

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot your password?" description="Enter your email and we’ll send you a reset link.">
      <form className="flex flex-col gap-5">
        <div>
          <label className="auth-label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            className="auth-input"
            placeholder="Enter your email"
            type="email"
          />
        </div>

        <button className="auth-button" type="submit">
          Send Reset Link
        </button>

        <p className="text-center text-sm text-slate-400">
          Remember your password?{' '}
          <Link href="/sign-in" className="auth-link">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
