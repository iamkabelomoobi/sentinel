import Link from "next/link";
import { Eye } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue to your account"
    >
      <form className="flex flex-col gap-4">
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
              placeholder="Enter your password"
              type="password"
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

        <button className="auth-button" type="submit">
          Sign In
        </button>

        {/* <p className="text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="auth-link">
            Sign up
          </Link>
        </p> */}
      </form>
    </AuthCard>
  );
}
