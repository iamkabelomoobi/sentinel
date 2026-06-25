import Link from 'next/link';

import { AuthCard } from '@/components/auth/auth-card';

export default function AuthErrorPage() {
  return (
    <AuthCard
      title="Authentication failed"
      description="We couldn’t verify your credentials. Please check your details and try again."
      tone="danger"
    >
      <div className="flex flex-col gap-5 text-center">
        <Link href="/sign-in" className="auth-button block">
          Try Again
        </Link>

        <Link href="/sign-in" className="auth-link text-sm">
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
