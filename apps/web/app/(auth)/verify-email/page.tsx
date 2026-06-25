import { AuthCard } from '@/features/auth/components/auth-card';
import { VerifyEmailPanel } from '@/features/auth/components/verify-email-panel';

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Check your email"
      description="We’ve sent a verification link to your email address."
      tone="success"
    >
      <VerifyEmailPanel />
    </AuthCard>
  );
}
