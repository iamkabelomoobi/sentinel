'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useSignOutMutation } from '@/features/auth/lib/auth-queries';

export function SignOutButton() {
  const router = useRouter();
  const signOutMutation = useSignOutMutation();

  async function onClick() {
    try {
      await signOutMutation.mutateAsync();
    } finally {
      router.replace('/sign-in');
      router.refresh();
    }
  }

  return (
    <button
      className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/8 bg-slate-950/35 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-60"
      disabled={signOutMutation.isPending}
      onClick={onClick}
      type="button"
    >
      <LogOut className="size-3.5" />
      {signOutMutation.isPending ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
