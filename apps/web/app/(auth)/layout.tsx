import { redirect } from 'next/navigation';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { getServerSession } from '@/features/auth/lib/server-auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (session) {
    redirect('/dashboard');
  }

  return <AuthShell>{children}</AuthShell>;
}
