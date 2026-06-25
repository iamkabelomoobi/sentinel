import Link from 'next/link';

import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { requireServerSession } from '@/features/auth/lib/server-auth';

export default async function UnauthorizedDashboardPage() {
  const session = await requireServerSession();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#02050b] px-4 text-slate-100">
      <section className="w-full max-w-md rounded-xl border border-cyan-300/10 bg-[#041225]/85 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
          Access Restricted
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          No dashboard for this role yet
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The signed-in account is assigned to {session.user.role || 'CLIENT'}.
          This dashboard is currently available to operations, control room,
          responder, and guard roles.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            className="rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            href="/dashboard"
          >
            Try dashboard again
          </Link>
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
