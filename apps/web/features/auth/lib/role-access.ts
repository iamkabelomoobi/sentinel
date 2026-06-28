import { AuthUserRole } from './auth-api';
import { DashboardRole } from '@/features/dashboard/lib/dashboard-data';

const dashboardRoleByAuthRole: Partial<Record<AuthUserRole, DashboardRole>> = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ORG_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'SUPER_ADMIN',
  CONTROL_ROOM: 'CONTROL_ROOM',
  RESPONDER: 'RESPONDER',
  GUARD: 'RESPONDER',
};

export function getDashboardRole(role?: AuthUserRole) {
  if (!role) {
    return null;
  }

  return dashboardRoleByAuthRole[role] ?? null;
}

export function canAccessDashboard(role?: AuthUserRole) {
  return Boolean(getDashboardRole(role));
}
