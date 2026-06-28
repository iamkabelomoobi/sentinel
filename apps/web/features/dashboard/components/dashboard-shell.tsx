"use client";

import {
  Bell,
  Camera,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Crosshair,
  KeyRound,
  Headphones,
  MapPin,
  MonitorSmartphone,
  Navigation,
  Phone,
  Plus,
  Save,
  Search,
  Shield,
  ShieldCheck,
  Target,
  UserCog,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  emailChangeSchema,
  profileImageDataUrlSchema,
  profileUpdateSchema,
} from "@sentinel/schemas/profile";
import { toast } from "sonner";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import {
  type DashboardRole,
  type Incident,
  type NavItem,
  incidents,
  mapPins,
  metricsByRole,
  navItems,
  responderQueue,
  roleAccent,
  roles,
  routePoints,
  routeSteps,
} from "../lib/dashboard-data";
import {
  type DashboardProfileResponse,
  requestEmailChange,
  updateDashboardProfile,
} from "../lib/profile-api";

const toneStyles = {
  good: "text-emerald-300",
  danger: "text-red-300",
  neutral: "text-slate-300",
};

const incidentTone = {
  red: "bg-red-500/15 text-red-300 ring-red-400/30",
  amber: "bg-orange-500/15 text-orange-300 ring-orange-400/30",
  yellow: "bg-yellow-500/15 text-yellow-300 ring-yellow-400/30",
  green: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getValidationMessage(
  result: { success: false; error: { issues: { message: string }[] } },
  fallback: string,
) {
  return result.error.issues[0]?.message ?? fallback;
}

type DashboardUser = {
  name: string;
  email: string;
  role: string;
  status?: string;
  image?: string | null;
};

export function DashboardShell({
  initialRole,
  user,
}: {
  initialRole: DashboardRole;
  user: DashboardUser;
}) {
  const role = initialRole;
  const roleConfig = roles.find((item) => item.id === role) ?? roles[0]!;
  const visibleNav = useMemo(
    () => navItems.filter((item) => item.roles.includes(role)),
    [role],
  );

  return (
    <DashboardFrame
      navItems={visibleNav}
      role={role}
      roleLabel={roleConfig.label}
      user={{
        userName: user.name || roleConfig.userName,
        userMeta: user.role,
        email: user.email,
        image: user.image,
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            {roleConfig.title}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-white">Overview</h1>
        </div>
        {role === "RESPONDER" ? (
          <div className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300">
            En Route
          </div>
        ) : null}
      </div>

      {role === "RESPONDER" ? (
        <ResponderDashboard />
      ) : (
        <OperationsDashboard role={role} />
      )}
    </DashboardFrame>
  );
}

export function ProfileManagementShell({
  initialRole,
  profile,
  user,
}: {
  initialRole: DashboardRole;
  profile: DashboardProfileResponse | null;
  user: DashboardUser;
}) {
  const role = initialRole;
  const roleConfig = roles.find((item) => item.id === role) ?? roles[0]!;
  const visibleNav = useMemo(
    () => navItems.filter((item) => item.roles.includes(role)),
    [role],
  );

  return (
    <DashboardFrame
      navItems={visibleNav}
      role={role}
      roleLabel={roleConfig.label}
      user={{
        userName: user.name || roleConfig.userName,
        userMeta: user.role,
        email: user.email,
        image: profile?.user.image ?? user.image,
      }}
    >
      <ProfileManagementView
        profile={profile}
        roleLabel={roleConfig.label}
        user={user}
      />
    </DashboardFrame>
  );
}

function DashboardFrame({
  children,
  navItems: visibleNav,
  role,
  roleLabel,
  user,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  role: DashboardRole;
  roleLabel: string;
  user: {
    userName: string;
    userMeta: string;
    email: string;
    image?: string | null;
  };
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#02050b] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_28%_0%,rgba(14,165,233,0.16),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(37,99,235,0.12),transparent_28%),linear-gradient(180deg,#02050b_0%,#030712_100%)]" />

      <div className="relative flex min-h-screen w-full gap-3 p-0">
        <Sidebar navItems={visibleNav} role={role} user={user} />

        <section className="min-w-0 flex-1 p-3">
          <TopBar roleLabel={roleLabel} />
          {children}
        </section>
      </div>
    </main>
  );
}

function Sidebar({
  navItems: items,
  role,
  user,
}: {
  navItems: NavItem[];
  role: DashboardRole;
  user: {
    userName: string;
    userMeta: string;
    email: string;
    image?: string | null;
  };
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-[260px] shrink-0 border-r border-cyan-300/10 bg-[#031122]/88 p-4 shadow-[20px_0_70px_rgba(0,0,0,0.32)] backdrop-blur-xl lg:flex lg:flex-col">
      <div className="mb-7 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg border border-cyan-300/45 bg-cyan-400/8 text-cyan-300">
          <Shield className="size-6" strokeWidth={1.8} />
        </div>
        <span className="text-sm font-semibold tracking-[0.34em] text-white">
          SENTINEL
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {items.map(({ label, icon: Icon, href }) => {
          const active = href !== "#" && pathname === href;
          const className = `flex h-10 items-center gap-3 rounded-md px-3 text-left text-xs font-medium transition ${
            active
              ? "bg-blue-600/45 text-cyan-200 shadow-[0_12px_28px_rgba(37,99,235,0.22)]"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
          }`;

          return href === "#" ? (
            <button key={label} className={className} type="button">
              <Icon className="size-4" strokeWidth={1.8} />
              {label}
            </button>
          ) : (
            <Link
              key={label}
              aria-current={active ? "page" : undefined}
              className={className}
              href={href}
            >
              <Icon className="size-4" strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-lg border border-white/8 bg-white/[0.035] p-3">
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center overflow-hidden rounded-full bg-slate-700 text-xs font-bold text-white">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="h-full w-full object-cover"
                src={user.image}
              />
            ) : (
              user.userName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
            )}
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border border-[#031122] bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {user.userName}
            </p>
            <p className="truncate text-[0.68rem] text-slate-500">
              {user.userMeta}
            </p>
          </div>
          <ChevronRight className="size-3.5 text-slate-500" />
        </div>
        <p className="mt-2 truncate text-[0.65rem] text-slate-600">
          {user.email}
        </p>
        <SignOutButton />
      </div>

      <div
        className={`mt-4 h-1 rounded-full bg-gradient-to-r ${roleAccent[role]}`}
      />
    </aside>
  );
}

function ProfileManagementView({
  profile,
  roleLabel,
  user,
}: {
  profile: DashboardProfileResponse | null;
  roleLabel: string;
  user: DashboardUser;
}) {
  const [activeTab, setActiveTab] = useState("Profile Information");
  const profileUser = profile?.user;
  const [fullName, setFullName] = useState(profileUser?.name ?? user.name);
  const [phone, setPhone] = useState(profileUser?.phone ?? "");
  const [organizationId, setOrganizationId] = useState(
    profileUser?.organizationId ?? "",
  );
  const [organizations, setOrganizations] = useState(
    profile?.organizations ?? [],
  );
  const [profileImage, setProfileImage] = useState(
    profileUser?.image ?? user.image ?? null,
  );
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [emailChangeState, setEmailChangeState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [newEmail, setNewEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const email = profileUser?.email ?? user.email;
  const initials = (fullName || user.email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
          Profile
        </p>
        <h1 className="mt-1 text-xl font-semibold text-white">My Profile</h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage your personal information and account security.
        </p>
      </div>

      <Panel className="overflow-hidden">
        <div className="border-b border-cyan-300/10 px-5 pt-5">
          <div className="flex flex-wrap gap-2">
            {[
              "Profile Information",
              "Change Email",
              "Change Password",
              "Two-Factor Authentication",
              "Sessions",
            ].map((tab) => (
              <button
                key={tab}
                className={`border-b-2 px-1 pb-3 text-[0.68rem] font-semibold transition sm:text-xs ${
                  activeTab === tab
                    ? "border-cyan-300 text-cyan-200"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setSaveState("idle");
                  setEmailChangeState("idle");
                }}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Profile Information" ? (
          <form
            className="grid gap-6 p-5 lg:grid-cols-[180px_1fr]"
            onSubmit={(event) => {
              event.preventDefault();
              const parsedProfile = profileUpdateSchema.safeParse({
                name: fullName,
                phone: phone || null,
                image: profileImage ?? null,
                organizationId,
              });

              if (!parsedProfile.success) {
                setSaveState("error");
                toast.error(
                  getValidationMessage(
                    parsedProfile,
                    "Check your profile details.",
                  ),
                );
                return;
              }

              const toastId = toast.loading("Saving profile...");
              setSaveState("saving");
              updateDashboardProfile(parsedProfile.data)
                .then((nextProfile) => {
                  setFullName(nextProfile.user.name);
                  setPhone(nextProfile.user.phone ?? "");
                  setOrganizationId(nextProfile.user.organizationId);
                  setOrganizations(nextProfile.organizations);
                  setProfileImage(nextProfile.user.image);
                  setSaveState("saved");
                  toast.success("Profile changes saved.", { id: toastId });
                })
                .catch((error: unknown) => {
                  setSaveState("error");
                  toast.error(
                    getErrorMessage(error, "Unable to update profile."),
                    { id: toastId },
                  );
                });
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex size-28 items-center justify-center overflow-hidden rounded-full border border-cyan-300/20 bg-slate-800 text-2xl font-bold text-white shadow-[0_0_34px_rgba(14,165,233,0.16)]">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    src={profileImage}
                  />
                ) : (
                  initials
                )}
                <span className="absolute bottom-2 right-2 size-3.5 rounded-full border-2 border-[#06162a] bg-emerald-400" />
              </div>
              <input
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  if (!file.type.startsWith("image/")) {
                    setSaveState("error");
                    toast.error("Choose an image file.");
                    event.target.value = "";
                    return;
                  }

                  if (file.size > 1_000_000) {
                    setSaveState("error");
                    toast.error("Profile image must be under 1MB.");
                    event.target.value = "";
                    return;
                  }

                  const reader = new FileReader();

                  reader.onload = () => {
                    if (typeof reader.result !== "string") {
                      setSaveState("error");
                      toast.error("Unable to read image.");
                      return;
                    }

                    const parsedImage = profileImageDataUrlSchema.safeParse(
                      reader.result,
                    );

                    if (!parsedImage.success) {
                      setSaveState("error");
                      toast.error(
                        getValidationMessage(
                          parsedImage,
                          "Choose a smaller PNG, JPG, WebP, or GIF.",
                        ),
                      );
                      return;
                    }

                    setProfileImage(parsedImage.data);
                    setSaveState("idle");
                    toast.info("Photo selected. Save changes to upload it.");
                  };
                  reader.onerror = () => {
                    setSaveState("error");
                    toast.error("Unable to read image.");
                  };
                  reader.readAsDataURL(file);
                }}
                type="file"
              />
              <button
                className="h-8 rounded-md border border-blue-400/30 bg-blue-500/10 px-3 text-[0.68rem] font-semibold text-blue-200 transition hover:bg-blue-500/16"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                Change Photo
              </button>
            </div>

            <div className="grid gap-4">
              <ProfileField label="Full Name">
                <input
                  className="profile-input"
                  onChange={(event) => setFullName(event.target.value)}
                  value={fullName}
                />
              </ProfileField>

              <ProfileField label="Phone">
                <input
                  className="profile-input"
                  onChange={(event) => setPhone(event.target.value)}
                  value={phone}
                />
              </ProfileField>

              <ProfileField label="Role">
                <select
                  className="profile-input"
                  value={roleLabel}
                  onChange={() => undefined}
                >
                  <option>{roleLabel}</option>
                </select>
              </ProfileField>

              <ProfileField label="Organization">
                <select
                  className="profile-input"
                  onChange={(event) => setOrganizationId(event.target.value)}
                  value={organizationId}
                >
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
              </ProfileField>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-4 text-xs font-semibold text-white shadow-[0_14px_32px_rgba(37,99,235,0.34)] transition hover:brightness-110 sm:flex-none sm:px-8"
                  disabled={saveState === "saving" || !organizationId}
                  type="submit"
                >
                  <Save className="size-4" />
                  {saveState === "saving" ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        ) : null}

        {activeTab === "Change Email" ? (
          <form
            className="grid gap-6 p-5 lg:grid-cols-[180px_1fr]"
            onSubmit={(event) => {
              event.preventDefault();
              const parsedEmail = emailChangeSchema.safeParse({ newEmail });

              if (!parsedEmail.success) {
                setEmailChangeState("error");
                toast.error(
                  getValidationMessage(
                    parsedEmail,
                    "Please enter a valid email address.",
                  ),
                );
                return;
              }

              const toastId = toast.loading("Requesting email change...");
              setEmailChangeState("sending");
              requestEmailChange(parsedEmail.data.newEmail)
                .then((result) => {
                  setEmailChangeState("sent");
                  toast.success(
                    result.message ||
                      "Check the new email address to verify this change.",
                    { id: toastId },
                  );
                  setNewEmail("");
                })
                .catch((error: unknown) => {
                  setEmailChangeState("error");
                  toast.error(
                    getErrorMessage(error, "Unable to request email change."),
                    { id: toastId },
                  );
                });
            }}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-20 items-center justify-center rounded-full border border-cyan-300/15 bg-cyan-400/8 text-cyan-200">
                <ShieldCheck className="size-8" strokeWidth={1.7} />
              </span>
              <p className="max-w-44 text-xs leading-5 text-slate-500">
                Email changes are applied after verification from the new
                address.
              </p>
            </div>
            <div className="grid gap-4">
              <ProfileField label="Current Email">
                <input
                  className="profile-input opacity-75"
                  readOnly
                  type="email"
                  value={email}
                />
              </ProfileField>
              <ProfileField label="New Email">
                <input
                  className="profile-input"
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                  type="email"
                  value={newEmail}
                />
              </ProfileField>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-4 text-xs font-semibold text-white shadow-[0_14px_32px_rgba(37,99,235,0.34)] transition hover:brightness-110 sm:flex-none sm:px-8"
                  disabled={emailChangeState === "sending" || !newEmail}
                  type="submit"
                >
                  <ShieldCheck className="size-4" />
                  {emailChangeState === "sending"
                    ? "Sending..."
                    : "Request Email Change"}
                </button>
              </div>
            </div>
          </form>
        ) : null}

        {activeTab === "Change Password" ? (
          <ProfilePlaceholder
            action="Update Password"
            description="Set a new password for this Sentinel account."
            icon={KeyRound}
            rows={["Current password", "New password", "Confirm new password"]}
            type="password"
          />
        ) : null}

        {activeTab === "Two-Factor Authentication" ? (
          <ProfilePlaceholder
            action="Enable Two-Factor Authentication"
            description="Add a verification step for sensitive account access."
            icon={ShieldCheck}
            rows={[
              "Authenticator app",
              "Recovery codes",
              `${roleLabel} access policy`,
            ]}
          />
        ) : null}

        {activeTab === "Sessions" ? (
          <ProfilePlaceholder
            action="Review Sessions"
            description="Monitor recent sign-ins for this account."
            icon={MonitorSmartphone}
            rows={["Current browser", "Mobile device", "Last API session"]}
          />
        ) : null}
      </Panel>
    </div>
  );
}

function ProfileField({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.68rem] font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function ProfilePlaceholder({
  action,
  description,
  icon: Icon,
  rows,
  type = "text",
}: {
  action: string;
  description: string;
  icon: LucideIcon;
  rows: string[];
  type?: string;
}) {
  return (
    <div className="grid gap-6 p-5 lg:grid-cols-[180px_1fr]">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-20 items-center justify-center rounded-full border border-cyan-300/15 bg-cyan-400/8 text-cyan-200">
          <Icon className="size-8" strokeWidth={1.7} />
        </span>
        <p className="max-w-40 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
      <div className="grid gap-4">
        {rows.map((row) => (
          <ProfileField key={row} label={row}>
            <input className="profile-input" placeholder={row} type={type} />
          </ProfileField>
        ))}
        <button
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-4 text-xs font-semibold text-white shadow-[0_14px_32px_rgba(37,99,235,0.34)] transition hover:brightness-110 sm:w-fit sm:px-8"
          type="button"
        >
          <UserCog className="size-4" />
          {action}
        </button>
      </div>
    </div>
  );
}

function TopBar({ roleLabel }: { roleLabel: string }) {
  return (
    <header className="mb-5 grid gap-3 rounded-xl border border-cyan-300/10 bg-[#041225]/75 p-3 backdrop-blur lg:grid-cols-[minmax(260px,1fr)_auto_auto]">
      <label className="flex h-10 items-center gap-2 rounded-md border border-white/8 bg-slate-950/40 px-3 text-slate-500">
        <Search className="size-4" />
        <input
          className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-600"
          placeholder="Search incidents, locations, responders..."
        />
      </label>

      <div className="flex items-center gap-2">
        <button
          className="flex size-10 items-center justify-center rounded-md border border-white/8 bg-slate-950/35 text-slate-400"
          type="button"
        >
          <Bell className="size-4" />
        </button>
        <button
          className="flex size-10 items-center justify-center rounded-md border border-white/8 bg-slate-950/35 text-slate-400"
          type="button"
        >
          <Headphones className="size-4" />
        </button>
      </div>

      <div className="flex items-center rounded-md border border-white/8 bg-slate-950/40 px-3 text-[0.7rem] font-semibold text-cyan-200">
        {roleLabel}
      </div>
    </header>
  );
}

function OperationsDashboard({
  role,
}: {
  role: Exclude<DashboardRole, "RESPONDER">;
}) {
  const isControl = role === "CONTROL_ROOM";

  return (
    <div className="space-y-4">
      <MetricGrid role={role} />

      <div className="grid gap-4 xl:grid-cols-[0.88fr_1.45fr]">
        <IncidentList
          title="Active Incidents"
          action="View all"
          incidents={incidents.slice(0, isControl ? 4 : 3)}
        />
        <LiveMap
          title={isControl ? "Live Operations Map" : "Live Map"}
          route={isControl}
        />
      </div>

      {isControl ? (
        <div className="grid gap-4 xl:grid-cols-[0.82fr_1.08fr_0.92fr]">
          <DispatchQueue />
          <ActivityPanel title="Recent Activity" />
          <RespondersOnline />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[0.88fr_0.88fr_0.78fr]">
          <ActivityPanel title="Recent Activity" />
          <ChartPanel />
          <IncidentTypes />
        </div>
      )}
    </div>
  );
}

function MetricGrid({ role }: { role: DashboardRole }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricsByRole[role].map((metric) => (
        <Panel key={metric.label} className="p-4">
          <p className="text-xs text-slate-400">{metric.label}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold text-white">{metric.value}</p>
            {metric.delta ? (
              <span
                className={`text-xs font-semibold ${toneStyles[metric.tone]}`}
              >
                {metric.delta}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[0.66rem] text-slate-600">{metric.caption}</p>
        </Panel>
      ))}
    </div>
  );
}

function IncidentList({
  title,
  action,
  incidents,
}: {
  title: string;
  action?: string;
  incidents: Incident[];
}) {
  return (
    <Panel className="p-4">
      <SectionHeader action={action} title={title} />
      <div className="mt-3 space-y-2">
        {incidents.map((incident) => (
          <div
            key={incident.title}
            className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg border border-white/6 bg-slate-950/28 p-2.5"
          >
            <div
              className={`flex size-8 items-center justify-center rounded-md ring-1 ${incidentTone[incident.tone]}`}
            >
              <MapPin className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {incident.title}
              </p>
              <p className="truncate text-[0.68rem] text-slate-500">
                {incident.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.62rem] text-slate-600">{incident.time}</p>
              <p
                className={`mt-1 rounded px-1.5 py-0.5 text-[0.58rem] font-bold ${incidentTone[incident.tone]}`}
              >
                {incident.priority}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function LiveMap({ title, route = false }: { title: string; route?: boolean }) {
  return (
    <Panel className="relative min-h-[260px] overflow-hidden p-4">
      <SectionHeader title={title} />
      <div className="absolute inset-x-4 bottom-4 top-12 overflow-hidden rounded-lg border border-cyan-300/10 bg-[#03101f]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_34%,rgba(14,165,233,0.2),transparent_16%),radial-gradient(circle_at_78%_46%,rgba(239,68,68,0.18),transparent_14%)]" />
        {route ? <RouteLine /> : null}
        {mapPins.map((pin) => (
          <span
            key={`${pin.left}-${pin.top}`}
            className={`absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-slate-950 shadow-[0_0_22px_currentColor] ${
              pin.tone === "red"
                ? "border-red-300 text-red-400"
                : pin.tone === "green"
                  ? "border-emerald-300 text-emerald-400"
                  : pin.tone === "amber"
                    ? "border-orange-300 text-orange-400"
                    : pin.tone === "cyan"
                      ? "border-cyan-300 text-cyan-300"
                      : "border-blue-300 text-blue-400"
            }`}
            style={{ left: pin.left, top: pin.top }}
          >
            <MapPin className="size-4" fill="currentColor" />
          </span>
        ))}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {[Target, Crosshair, Plus].map((Icon, index) => (
            <button
              key={index}
              className="flex size-8 items-center justify-center rounded-md border border-white/10 bg-slate-950/70 text-slate-400"
              type="button"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function RouteLine() {
  const points = routePoints
    .map(
      (point) =>
        `${Number.parseFloat(point.left)} ${Number.parseFloat(point.top)}`,
    )
    .join(", ");

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <polyline
        fill="none"
        points={points}
        stroke="#06b6d4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function ActivityPanel({ title }: { title: string }) {
  const activity = [
    ["New incident reported", "Armed Robbery", "2 min ago", "red"],
    ["Responder assigned", "Vehicle 12 accepted #1248", "3 min ago", "cyan"],
    ["Incident updated", "Store Break-in", "6 min ago", "amber"],
    ["Evidence uploaded", "Incident #1247", "7 min ago", "blue"],
  ];

  return (
    <Panel className="p-4">
      <SectionHeader title={title} />
      <div className="mt-3 space-y-2">
        {activity.map(([label, detail, time, tone]) => (
          <div
            key={`${label}-${detail}`}
            className="grid grid-cols-[1.6rem_1fr_auto] items-center gap-2 rounded-md bg-slate-950/24 p-2"
          >
            <span
              className={`flex size-6 items-center justify-center rounded ${
                tone === "red"
                  ? "bg-red-400/15 text-red-300"
                  : tone === "amber"
                    ? "bg-orange-400/15 text-orange-300"
                    : tone === "cyan"
                      ? "bg-cyan-400/15 text-cyan-300"
                      : "bg-blue-400/15 text-blue-300"
              }`}
            >
              <CircleDot className="size-3" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.72rem] font-semibold text-white">
                {label}
              </p>
              <p className="truncate text-[0.64rem] text-slate-500">{detail}</p>
            </div>
            <p className="text-[0.6rem] text-slate-600">{time}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ChartPanel() {
  return (
    <Panel className="p-4">
      <SectionHeader title="Incident Statistics" />
      <div className="mt-4 h-[145px] rounded-lg border border-white/6 bg-slate-950/20 p-3">
        <svg className="h-full w-full" viewBox="0 0 320 160">
          <defs>
            <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M5 128 C42 88 61 40 105 70 C148 99 160 124 207 77 C246 38 279 92 315 34 L315 160 L5 160 Z"
            fill="url(#chartFill)"
          />
          <path
            d="M5 128 C42 88 61 40 105 70 C148 99 160 124 207 77 C246 38 279 92 315 34"
            fill="none"
            stroke="#0ea5e9"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <path
            d="M5 144 C56 112 89 108 133 128 C186 151 215 102 315 106"
            fill="none"
            stroke="#1d4ed8"
            strokeOpacity="0.48"
            strokeWidth="2"
          />
        </svg>
      </div>
    </Panel>
  );
}

function IncidentTypes() {
  const rows = [
    ["Armed Robbery", "32%", "bg-red-400"],
    ["Burglary", "28%", "bg-orange-400"],
    ["Panic Alarm", "18%", "bg-yellow-400"],
    ["Medical Emergency", "12%", "bg-emerald-400"],
    ["Other", "10%", "bg-blue-400"],
  ];

  return (
    <Panel className="p-4">
      <SectionHeader title="Top Incident Types" />
      <div className="mt-4 space-y-3">
        {rows.map(([label, value, color]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-[0.7rem]">
              <span className="text-slate-300">{label}</span>
              <span className="font-semibold text-white">{value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: value }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DispatchQueue() {
  return (
    <Panel className="p-4">
      <SectionHeader title="Dispatch Queue" />
      <div className="mt-3 space-y-2">
        {["#1248", "#1247", "#1246"].map((id, index) => (
          <div
            key={id}
            className="flex items-center justify-between rounded-lg bg-slate-950/28 p-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-md bg-red-500/15 text-red-300">
                <MapPin className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">
                  Incident {id}
                </p>
                <p className="text-[0.65rem] text-slate-500">
                  {index === 0
                    ? "Armed Robbery"
                    : index === 1
                      ? "Store Break-in"
                      : "Panic Alarm"}
                </p>
              </div>
            </div>
            <button
              className="rounded border border-red-400/30 bg-red-500/10 px-2 py-1 text-[0.62rem] font-bold text-red-300"
              type="button"
            >
              ASSIGN
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RespondersOnline() {
  return (
    <Panel className="p-4">
      <SectionHeader action="View all" title="Responders Online" />
      <div className="mt-3 space-y-2">
        {responderQueue.map((responder) => (
          <div
            key={responder.name}
            className="flex items-center justify-between rounded-md bg-slate-950/24 p-2"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-slate-700 text-[0.62rem] text-white">
                {responder.name.slice(-2)}
              </span>
              <p className="text-xs font-semibold text-white">
                {responder.name}
              </p>
            </div>
            <span
              className={`text-[0.64rem] font-semibold ${
                responder.tone === "green"
                  ? "text-emerald-300"
                  : responder.tone === "yellow"
                    ? "text-yellow-300"
                    : "text-red-300"
              }`}
            >
              {responder.status}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ResponderDashboard() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_0.86fr]">
        <AssignmentCard />
        <NavigationCard />
        <TimelineCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[0.95fr_0.85fr]">
        <IncidentDetailsCard />
        <ResponderTools />
        <MessagesCard />
        <QuickActions />
      </div>
    </div>
  );
}

function AssignmentCard() {
  return (
    <Panel className="p-5">
      <SectionHeader title="Current Assignment" />
      <div className="mt-4">
        <p className="text-sm font-bold text-red-300">Incident #1248</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Armed Robbery
        </h2>
        <p className="mt-1 text-sm text-slate-400">Main Street, Sandton</p>
      </div>
      <div className="mt-6 grid grid-cols-2 divide-x divide-white/10 rounded-lg border border-white/8 bg-slate-950/28">
        <div className="p-4">
          <p className="text-[0.66rem] uppercase text-slate-500">Priority</p>
          <p className="mt-1 text-sm font-bold text-red-300">CRITICAL</p>
        </div>
        <div className="p-4">
          <p className="text-[0.66rem] uppercase text-slate-500">ETA</p>
          <p className="mt-1 text-sm font-bold text-white">2 min</p>
        </div>
      </div>
      <button
        className="mt-5 h-11 w-full rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(37,99,235,0.34)]"
        type="button"
      >
        View Incident
      </button>
    </Panel>
  );
}

function NavigationCard() {
  return (
    <Panel className="relative min-h-[290px] overflow-hidden p-5">
      <SectionHeader title="Navigation" />
      <div className="mt-4">
        <p className="text-4xl font-semibold text-white">2.3 km</p>
        <p className="mt-1 text-sm text-slate-400">to Incident Location</p>
      </div>
      <div className="absolute inset-x-5 bottom-16 top-28 overflow-hidden rounded-lg bg-[#03101f]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <RouteLine />
        <span className="absolute bottom-[18%] left-[25%] flex size-8 items-center justify-center rounded-full border border-cyan-300 bg-cyan-400/15 text-cyan-300 shadow-[0_0_20px_#06b6d4]">
          <Navigation className="size-4" fill="currentColor" />
        </span>
      </div>
      <button
        className="absolute inset-x-5 bottom-5 h-10 rounded-md bg-blue-500/50 text-sm font-semibold text-white"
        type="button"
      >
        Open Maps
      </button>
    </Panel>
  );
}

function IncidentDetailsCard() {
  const details: Array<[string, string, LucideIcon]> = [
    ["Type", "Armed Robbery", Shield],
    ["Reported", "10:24 AM", Clock3],
    ["Location", "Main Street, Sandton", MapPin],
    ["Customer", "John Doe", UserRound],
  ];

  return (
    <Panel className="p-5">
      <SectionHeader title="Incident Details" />
      <div className="mt-4 space-y-3">
        {details.map(([label, value, Icon]) => (
          <div key={label as string} className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-blue-500/12 text-blue-300">
              <Icon className="size-4" />
            </span>
            <div>
              <p className="text-[0.66rem] text-slate-500">{label}</p>
              <p className="text-xs font-semibold text-white">
                {value as string}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-5 h-10 w-full rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-semibold text-white"
        type="button"
      >
        View Full Details
      </button>
    </Panel>
  );
}

function ResponderTools() {
  const tools: Array<[string, LucideIcon]> = [
    ["Start Navigation", Navigation],
    ["Call Control Room", Phone],
    ["Start On Scene", Camera],
    ["Upload Evidence", Camera],
  ];

  return (
    <Panel className="p-5">
      <SectionHeader title="Tools" />
      <div className="mt-4 space-y-3">
        {tools.map(([label, Icon]) => (
          <button
            key={label as string}
            className="flex h-12 w-full items-center gap-3 rounded-lg border border-white/8 bg-slate-950/24 px-4 text-left text-xs font-semibold text-white transition hover:border-cyan-300/30"
            type="button"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-300">
              <Icon className="size-4" />
            </span>
            {label as string}
          </button>
        ))}
      </div>
    </Panel>
  );
}

function TimelineCard() {
  return (
    <Panel className="p-5 lg:col-span-2">
      <SectionHeader title="Incident Timeline" />
      <div className="mt-7 grid grid-cols-5 gap-2">
        {routeSteps.map((step, index) => (
          <div key={step.label} className="relative">
            {index < routeSteps.length - 1 ? (
              <span
                className={`absolute left-1/2 top-4 h-0.5 w-full ${
                  step.complete ? "bg-cyan-400" : "bg-slate-700"
                }`}
              />
            ) : null}
            <span
              className={`relative z-10 mx-auto flex size-8 items-center justify-center rounded-full border ${
                step.complete
                  ? "border-cyan-300 bg-cyan-400 text-white"
                  : "border-slate-700 bg-slate-900 text-slate-600"
              }`}
            >
              <ChevronDown className="size-4" />
            </span>
            <p className="mt-3 truncate text-center text-[0.67rem] text-slate-300">
              {step.label}
            </p>
            <p className="mt-1 text-center text-[0.62rem] text-slate-600">
              {step.time}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MessagesCard() {
  return (
    <Panel className="p-5">
      <SectionHeader title="Messages" />
      <div className="mt-4 flex gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-slate-700 text-white">
          <Headphones className="size-5" />
        </span>
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-white">Control Room</p>
            <p className="text-[0.62rem] text-slate-600">10:26 AM</p>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Please proceed with caution. Suspects may be armed.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function QuickActions() {
  return (
    <Panel className="p-5">
      <SectionHeader title="Quick Actions" />
      <div className="mt-5 space-y-3">
        <button
          className="h-11 w-full rounded-md bg-blue-600 text-sm font-semibold text-white"
          type="button"
        >
          Update Status
        </button>
        <button
          className="h-11 w-full rounded-md bg-red-600/85 text-sm font-semibold text-white"
          type="button"
        >
          Request Backup
        </button>
      </div>
    </Panel>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-cyan-300/10 bg-[#06162a]/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_55px_rgba(0,0,0,0.28)] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {action ? (
        <button
          className="text-[0.66rem] font-semibold text-blue-300"
          type="button"
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}
