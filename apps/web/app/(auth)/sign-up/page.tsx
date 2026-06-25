import { AuthCard } from "@/features/auth/components/auth-card";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Join Sentinel and start protecting what matters."
    >
      <SignUpForm />
    </AuthCard>
  );
}
