import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getDashboardRole } from "@/features/auth/lib/role-access";
import { requireServerSession } from "@/features/auth/lib/server-auth";
import { ProfileManagementShell } from "@/features/dashboard/components/dashboard-shell";
import { DashboardProfileResponse } from "@/features/dashboard/lib/profile-api";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getProfileData() {
  const headersList = await headers();
  const cookie = headersList.get("cookie");

  const response = await fetch(`${apiUrl}/api/profile/me`, {
    headers: cookie ? { cookie } : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as DashboardProfileResponse;
}

export default async function ProfilePage() {
  const session = await requireServerSession();
  const dashboardRole = getDashboardRole(session.user.role);

  if (!dashboardRole) {
    redirect("/dashboard/unauthorized");
  }

  const profile = await getProfileData();

  return (
    <ProfileManagementShell
      initialRole={dashboardRole}
      profile={profile}
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role || "CLIENT",
        status: session.user.status,
        image: session.user.image,
      }}
    />
  );
}
