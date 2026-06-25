import Link from 'next/link';
import { CheckCircle2, Eye } from 'lucide-react';

import { AuthCard } from '@/components/auth/auth-card';

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Reset your password" description="Enter your new password below.">
      <form className="flex flex-col gap-4">
        <Link href="/sign-in" className="auth-link text-xs">
          &larr; Back to sign in
        </Link>

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
            />
            <Eye
              aria-hidden="true"
              className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>

        <button className="auth-button" type="submit">
          Reset Password
        </button>
      </form>
    </AuthCard>
  );
}
