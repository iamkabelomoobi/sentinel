import { requireServerSession } from '@/features/auth/lib/server-auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireServerSession();

  return children;
}
