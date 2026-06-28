import type {
  EmailChangeInput,
  ProfileUpdateInput,
} from "@sentinel/schemas/profile";

import { AuthUserRole, AuthUserStatus } from "@/features/auth/lib/auth-api";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type ProfileOrganization = {
  id: string;
  name: string;
  slug: string;
  type: string;
};

export type DashboardProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: AuthUserRole;
  status: AuthUserStatus;
  organizationId: string;
  organization: ProfileOrganization;
};

export type DashboardProfileResponse = {
  user: DashboardProfile;
  organizations: ProfileOrganization[];
};

export async function updateDashboardProfile(input: ProfileUpdateInput) {
  const response = await fetch(`${apiUrl}/api/profile/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String(data.message)
        : "Unable to update profile.";

    throw new Error(message);
  }

  return data as DashboardProfileResponse;
}

export async function requestEmailChange(
  newEmail: EmailChangeInput["newEmail"],
) {
  const callbackURL =
    typeof window === "undefined"
      ? "/dashboard/profile"
      : `${window.location.origin}/dashboard/profile`;
  const response = await fetch(`${apiUrl}/api/auth/change-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      newEmail,
      callbackURL,
    }),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String(data.message)
        : "Unable to request email change.";

    throw new Error(message);
  }

  return data as {
    status: boolean;
    message?: string | null;
  };
}
