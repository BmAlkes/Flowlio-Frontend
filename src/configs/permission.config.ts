import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import { createAccessControl } from "better-auth/plugins/access";

/**
 * Role-based permissions. Note: Invoices, Payment Links, Client Management, User Management
 * are also allowed for role "user" when isOrganizationOwner === true (org owner / purchaser).
 * That condition is enforced in frontend route guards (AdminManagerOrOrgOwnerRoute) and in backend API checks.
 */
const pages = {
  ...defaultStatements,
  Dashboard: ["view"],
  Projects: ["create", "read", "update", "delete"],
  "Task Management": ["create", "read", "update", "delete"],
  "Client Management": ["create", "read", "update", "delete", "impersonate"],
  "User Management": adminAc.statements.user,
  TimeTracking: ["read", "update"],
  Calender: ["create", "read", "update", "delete"],
  Companies: ["create", "read", "update", "delete", "impersonate"],
  Invoices: ["create", "read", "update", "delete"],
  "AI Assist": ["use", "create", "read", "update", "delete"],
  "Sub Admin Management": ["create", "read", "update", "delete", "impersonate"],
  "Demo Accounts": ["create", "read", "update", "delete"],
  "My Tasks": ["read", "update"],
  "Support Tickets": ["create", "read", "update", "delete"],
  "Payment Links": ["create", "read"],
  Notifications: ["read", "view", "update", "delete"],
  // "My Subscriptions": ["read"],
  Settings: ["view", "update"],
} as const;

export const ac = createAccessControl(pages);

// Super Admin: Full system access - can manage everything
export const superAdmin = ac.newRole({
  Dashboard: ["view"],
  "Client Management": ["create", "read", "update", "delete", "impersonate"],
  "User Management": adminAc.statements.user,
  "Sub Admin Management": ["create", "read", "update", "delete", "impersonate"],
  Companies: ["create", "read", "update", "delete", "impersonate"],
  "Demo Accounts": ["create", "read", "update", "delete"],
  Projects: ["create", "read", "update", "delete"],
  "Task Management": ["create", "read", "update", "delete"],
  Calender: ["create", "read", "update", "delete"],
  Invoices: ["create", "read", "update", "delete"],
  "AI Assist": ["use", "create", "read", "update", "delete"],
  Settings: ["view", "update"],
  Notifications: ["read", "view", "update", "delete"],
  ...adminAc.statements,
});

// Sub Admin: Can manage specific areas assigned by super admin
export const subAdmin = ac.newRole({
  Dashboard: ["view"],
  Projects: ["create", "read", "update", "delete"],
  "Task Management": ["create", "read", "update", "delete"],
  Companies: ["create", "read", "update", "delete", "impersonate"],
  "Support Tickets": ["create", "read", "update", "delete"],
  Notifications: ["read", "view", "update", "delete"],
  "User Management": ["list"], // Limited user management - can only list users
  Settings: ["view", "update"],
});

// User (Member): No access to financial/sensitive unless isOrganizationOwner (see comment above)
export const user = ac.newRole({
  Dashboard: ["view"],
  TimeTracking: ["read", "update"],
  Projects: ["create", "read", "update", "delete"],
  "Task Management": ["create", "read", "update", "delete"],
  Calender: ["create", "read", "update", "delete"],
  "AI Assist": ["use", "create", "read", "update", "delete"],
  "Support Tickets": ["create", "read", "update", "delete"],
  Settings: ["view", "update"],
  Notifications: ["read", "view", "update", "delete"],
});

// Viewer: Read-only access
export const viewer = ac.newRole({
  Dashboard: ["view"],
  Projects: ["read"],
  "My Tasks": ["read"],
  TimeTracking: ["read", "update"],
  Calender: ["create", "read", "update", "delete"],
  "AI Assist": ["use", "create", "read", "update", "delete"],
  "Support Tickets": ["create", "read"],
  Settings: ["view", "update"],
  Notifications: ["read", "view", "update", "delete"],
});

// Operator: Limited management access
export const operator = ac.newRole({
  Dashboard: ["view"],
  Projects: ["read", "update"],
  "My Tasks": ["read", "update"],
  "Support Tickets": ["create", "read", "update", "delete"],
  Settings: ["view", "update"],
  Notifications: ["read", "view", "update", "delete"],
});

// Client: Portal access only - projects, tasks, invoices for their own data
export const client = ac.newRole({
  Dashboard: ["view"],
  Projects: ["read", "update"],
  "Task Management": ["read", "update"],
  Invoices: ["read"],
});

// Export roles for the adminClient plugin - using the correct structure
export const roles = {
  superadmin: superAdmin,
  subadmin: subAdmin,
  user: user,
  viewer: viewer,
  operator: operator,
  client: client,
};
