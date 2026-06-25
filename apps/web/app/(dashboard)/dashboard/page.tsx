import { redirect } from "next/navigation";

import { requireServerSession } from "@/features/auth/lib/server-auth";
import { getDashboardRole } from "@/features/auth/lib/role-access";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default async function DashboardPage() {
  const session = await requireServerSession();

  const dashboardRole = getDashboardRole(session.user.role);

  if (!dashboardRole) {
    redirect("/dashboard/unauthorized");
  }

  return (
    <DashboardShell
      initialRole={dashboardRole}
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role || "CLIENT",
        status: session.user.status,
      }}
    />
  );
}
