"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Eye, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import {
  registerAdminSchema,
  registerOrganizationSchema,
  signUpSchema,
} from "@sentinel/schemas/auth";

import { AuthAlert } from "./auth-alert";
import {
  getAuthErrorMessage,
  useSignUpMutation,
} from "@/features/auth/lib/auth-queries";

type SignUpStep = "organization" | "admin";

function firstIssueMessage(result: {
  success: false;
  error: { issues: { message: string }[] };
}) {
  return result.error.issues[0]?.message ?? "Check the highlighted details.";
}

export function SignUpForm() {
  const router = useRouter();
  const [step, setStep] = useState<SignUpStep>("organization");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationEmail, setOrganizationEmail] = useState("");
  const [organizationPhone, setOrganizationPhone] = useState("");
  const [organizationWebsite, setOrganizationWebsite] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const signUpMutation = useSignUpMutation();

  const organizationInput = {
    organizationName,
    organizationEmail,
    organizationPhone,
    organizationWebsite,
  };
  const adminInput = {
    adminName,
    adminEmail,
    adminPassword,
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (step === "organization") {
      const parsedOrganization =
        registerOrganizationSchema.safeParse(organizationInput);

      if (!parsedOrganization.success) {
        setError(firstIssueMessage(parsedOrganization));
        return;
      }

      setOrganizationName(parsedOrganization.data.organizationName);
      setOrganizationEmail(parsedOrganization.data.organizationEmail);
      setOrganizationPhone(parsedOrganization.data.organizationPhone ?? "");
      setOrganizationWebsite(parsedOrganization.data.organizationWebsite ?? "");
      setStep("admin");
      return;
    }

    const parsedAdmin = registerAdminSchema.safeParse(adminInput);

    if (!parsedAdmin.success) {
      setError(firstIssueMessage(parsedAdmin));
      return;
    }

    const parsedSignUp = signUpSchema.safeParse({
      ...organizationInput,
      ...adminInput,
    });

    if (!parsedSignUp.success) {
      setError(firstIssueMessage(parsedSignUp));
      return;
    }

    try {
      await signUpMutation.mutateAsync(parsedSignUp.data);
      router.push(
        `/verify-email?email=${encodeURIComponent(parsedSignUp.data.adminEmail)}`,
      );
    } catch (caught) {
      setError(getAuthErrorMessage(caught, "Unable to create account."));
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
        <button
          className={`flex h-9 items-center justify-center gap-2 rounded-md border transition ${
            step === "organization"
              ? "border-cyan-300/35 bg-cyan-400/10 text-cyan-200"
              : "border-white/10 bg-white/[0.03] text-slate-500"
          }`}
          onClick={() => setStep("organization")}
          type="button"
        >
          <Building2 className="size-3.5" />
          Organization
        </button>
        <button
          className={`flex h-9 items-center justify-center gap-2 rounded-md border transition ${
            step === "admin"
              ? "border-cyan-300/35 bg-cyan-400/10 text-cyan-200"
              : "border-white/10 bg-white/[0.03] text-slate-500"
          }`}
          onClick={() => setStep("admin")}
          type="button"
        >
          <UserRound className="size-3.5" />
          Admin
        </button>
      </div>

      <AuthAlert message={error} />

      {step === "organization" ? (
        <>
          <div>
            <label className="auth-label" htmlFor="organization-name">
              Organization name
            </label>
            <input
              id="organization-name"
              className="auth-input"
              placeholder="Sentinel Security"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              autoComplete="organization"
              required
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="organization-email">
              Organization email
            </label>
            <input
              id="organization-email"
              className="auth-input"
              placeholder="ops@example.com"
              type="email"
              value={organizationEmail}
              onChange={(event) => setOrganizationEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="organization-phone">
              Organization phone
            </label>
            <input
              id="organization-phone"
              className="auth-input"
              placeholder="+27 10 555 0199"
              value={organizationPhone}
              onChange={(event) => setOrganizationPhone(event.target.value)}
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="organization-website">
              Website
            </label>
            <input
              id="organization-website"
              className="auth-input"
              placeholder="https://example.com"
              type="url"
              value={organizationWebsite}
              onChange={(event) => setOrganizationWebsite(event.target.value)}
              autoComplete="url"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="auth-label" htmlFor="admin-name">
              Admin full name
            </label>
            <input
              id="admin-name"
              className="auth-input"
              placeholder="Enter admin full name"
              value={adminName}
              onChange={(event) => setAdminName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="admin-email">
              Admin email
            </label>
            <input
              id="admin-email"
              className="auth-input"
              placeholder="admin@example.com"
              type="email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="admin-password">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                className="auth-input pr-10"
                placeholder="Create a strong password"
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
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
        </>
      )}

      <div className="flex gap-2">
        {step === "admin" ? (
          <button
            className="h-11 flex-1 rounded-md border border-white/10 bg-white/[0.03] text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06]"
            onClick={() => setStep("organization")}
            type="button"
          >
            Back
          </button>
        ) : null}
        <button
          className="auth-button flex-1 disabled:opacity-60"
          type="submit"
          disabled={signUpMutation.isPending}
        >
          {signUpMutation.isPending
            ? "Creating Account..."
            : step === "organization"
              ? "Continue"
              : "Create Account"}
        </button>
      </div>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="auth-link">
          Sign in
        </Link>
      </p>
    </form>
  );
}
