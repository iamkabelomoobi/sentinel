import Link from "next/link";
import { CheckCircle2, Eye } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Join Sentinel and start protecting what matters."
    >
      <form className="flex flex-col gap-4">
        <div>
          <label className="auth-label" htmlFor="full-name">
            Full name
          </label>
          <input
            id="full-name"
            className="auth-input"
            placeholder="Enter your full name"
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
            />
            <Eye
              aria-hidden="true"
              className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs font-medium text-emerald-400">
          {[
            "At least 8 characters",
            "Contains a number",
            "Contains an uppercase letter",
          ].map((item) => (
            <p key={item} className="flex items-center gap-2">
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              {item}
            </p>
          ))}
        </div>

        <button className="auth-button" type="submit">
          Create Account
        </button>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="auth-link">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
