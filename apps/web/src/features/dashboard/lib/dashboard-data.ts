import {
  Bell,
  ClipboardList,
  FileBarChart,
  Headphones,
  Home,
  MessageSquare,
  RadioTower,
  Settings,
  Shield,
  Siren,
  User,
  Users,
} from "lucide-react";

export type DashboardRole = "SUPER_ADMIN" | "CONTROL_ROOM" | "RESPONDER";

export type NavItem = {
  label: string;
  icon: typeof Home;
  roles: DashboardRole[];
};

export type Metric = {
  label: string;
  value: string;
  delta: string;
  tone: "good" | "danger" | "neutral";
  caption: string;
};

export type Incident = {
  title: string;
  location: string;
  time: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  tone: "red" | "amber" | "yellow" | "green";
};

export const roles: Array<{
  id: DashboardRole;
  label: string;
  title: string;
  userName: string;
  userMeta: string;
}> = [
  {
    id: "SUPER_ADMIN",
    label: "Super Admin",
    title: "Super Admin Dashboard",
    userName: "Kabelo Admin",
    userMeta: "Super Admin",
  },
  {
    id: "CONTROL_ROOM",
    label: "Control Room",
    title: "Control Room Dashboard",
    userName: "Sarah Control",
    userMeta: "Control Room",
  },
  {
    id: "RESPONDER",
    label: "Responder",
    title: "Responder Dashboard",
    userName: "James Responder",
    userMeta: "Vehicle 12",
  },
];

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: Home,
    roles: ["SUPER_ADMIN", "CONTROL_ROOM", "RESPONDER"],
  },
  {
    label: "Incidents",
    icon: Siren,
    roles: ["SUPER_ADMIN", "CONTROL_ROOM"],
  },
  {
    label: "Dispatch",
    icon: RadioTower,
    roles: ["SUPER_ADMIN", "CONTROL_ROOM"],
  },
  {
    label: "Responders",
    icon: Users,
    roles: ["SUPER_ADMIN", "CONTROL_ROOM"],
  },
  {
    label: "Customers",
    icon: Users,
    roles: ["SUPER_ADMIN", "CONTROL_ROOM"],
  },
  {
    label: "Reports",
    icon: FileBarChart,
    roles: ["SUPER_ADMIN", "CONTROL_ROOM", "RESPONDER"],
  },
  {
    label: "Audit Logs",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN", "CONTROL_ROOM"],
  },
  {
    label: "Notifications",
    icon: Bell,
    roles: ["SUPER_ADMIN", "CONTROL_ROOM"],
  },
  {
    label: "My Incidents",
    icon: Shield,
    roles: ["RESPONDER"],
  },
  {
    label: "Dispatches",
    icon: RadioTower,
    roles: ["RESPONDER"],
  },
  {
    label: "Messages",
    icon: MessageSquare,
    roles: ["RESPONDER"],
  },
  {
    label: "Profile",
    icon: User,
    roles: ["RESPONDER"],
  },
  {
    label: "Settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "CONTROL_ROOM", "RESPONDER"],
  },
  {
    label: "System Admin",
    icon: Headphones,
    roles: ["SUPER_ADMIN"],
  },
];

export const metricsByRole: Record<DashboardRole, Metric[]> = {
  SUPER_ADMIN: [
    {
      label: "Total Incidents",
      value: "1,248",
      delta: "+12%",
      tone: "good",
      caption: "vs last 30 days",
    },
    {
      label: "Active Incidents",
      value: "48",
      delta: "+8%",
      tone: "danger",
      caption: "vs last 30 days",
    },
    {
      label: "Responders Online",
      value: "126",
      delta: "+15%",
      tone: "good",
      caption: "vs last 30 days",
    },
    {
      label: "Customers",
      value: "342",
      delta: "+7%",
      tone: "good",
      caption: "vs last 30 days",
    },
  ],
  CONTROL_ROOM: [
    {
      label: "Active Incidents",
      value: "24",
      delta: "+4",
      tone: "danger",
      caption: "vs last hour",
    },
    {
      label: "Responders Deployed",
      value: "18",
      delta: "",
      tone: "neutral",
      caption: "vs last hour",
    },
    {
      label: "Responders Available",
      value: "7",
      delta: "+2",
      tone: "good",
      caption: "vs last hour",
    },
    {
      label: "Avg. Response Time",
      value: "4m 32s",
      delta: "-1m",
      tone: "good",
      caption: "vs last hour",
    },
  ],
  RESPONDER: [
    {
      label: "Current ETA",
      value: "2 min",
      delta: "En Route",
      tone: "good",
      caption: "to active incident",
    },
    {
      label: "Distance",
      value: "2.3 km",
      delta: "Route active",
      tone: "neutral",
      caption: "to incident location",
    },
    {
      label: "Priority",
      value: "Critical",
      delta: "Armed Robbery",
      tone: "danger",
      caption: "Main Street, Sandton",
    },
    {
      label: "Messages",
      value: "1",
      delta: "New",
      tone: "good",
      caption: "from control room",
    },
  ],
};

export const incidents: Incident[] = [
  {
    title: "Armed Robbery",
    location: "Main Street, Sandton",
    time: "2 min ago",
    priority: "CRITICAL",
    tone: "red",
  },
  {
    title: "Store Break-in",
    location: "Oak Avenue, Randburg",
    time: "5 min ago",
    priority: "HIGH",
    tone: "amber",
  },
  {
    title: "Panic Alarm",
    location: "West Road, Roodepoort",
    time: "8 min ago",
    priority: "MEDIUM",
    tone: "yellow",
  },
  {
    title: "Medical Emergency",
    location: "Riverside Drive, Sandton",
    time: "10 min ago",
    priority: "MEDIUM",
    tone: "green",
  },
];

export const responderQueue = [
  { name: "Vehicle 12", status: "On Scene", tone: "green" },
  { name: "Vehicle 18", status: "En Route", tone: "yellow" },
  { name: "Vehicle 21", status: "Available", tone: "green" },
  { name: "Vehicle 34", status: "Available", tone: "green" },
  { name: "Vehicle 07", status: "On Break", tone: "red" },
];

export const routeSteps = [
  { label: "Incident Reported", time: "10:24 AM", complete: true },
  { label: "Dispatched", time: "10:26 AM", complete: true },
  { label: "En Route", time: "10:27 AM", complete: true },
  { label: "On Scene", time: "--", complete: false },
  { label: "Resolved", time: "--", complete: false },
];

export const mapPins = [
  { left: "27%", top: "33%", tone: "red" },
  { left: "52%", top: "57%", tone: "green" },
  { left: "78%", top: "42%", tone: "blue" },
  { left: "39%", top: "70%", tone: "cyan" },
  { left: "66%", top: "25%", tone: "amber" },
];

export const routePoints = [
  { left: "18%", top: "70%" },
  { left: "25%", top: "48%" },
  { left: "43%", top: "38%" },
  { left: "58%", top: "25%" },
  { left: "79%", top: "20%" },
];

export const roleAccent: Record<DashboardRole, string> = {
  SUPER_ADMIN: "from-cyan-400 to-blue-600",
  CONTROL_ROOM: "from-cyan-400 to-sky-500",
  RESPONDER: "from-blue-400 to-indigo-600",
};
