import Link from 'next/link';

import { AuthCard } from '@/components/auth/auth-card';

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Check your email"
      description="We’ve sent a verification link to your email address."
      tone="success"
    >
      <div className="flex flex-col gap-5 text-center">
        <p className="text-sm leading-6 text-slate-400">
          Please check your inbox and click the link to verify your account.
        </p>

        <button className="auth-button">Open Email App</button>

        <p className="text-sm text-slate-400">
          Didn&apos;t receive the email?
        </p>

        <div className="flex flex-col gap-2">
          <button className="auth-link text-sm">Resend email</button>
          <Link href="/sign-up" className="auth-link text-sm">
            Change email address
          </Link>
        </div>

        <div>
          <Link href="/sign-in" className="text-sm text-slate-400 transition hover:text-slate-200">
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
