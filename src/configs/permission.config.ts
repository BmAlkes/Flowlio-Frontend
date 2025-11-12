import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import { createAccessControl } from "better-auth/plugins/access";

const pages = {
  ...defaultStatements,
  Dashboard: ["view"],
  Projects: ["create", "read", "update", "delete"],
  "Task Management": ["create", "read", "update", "delete"],
  "Client Management": ["create", "read", "update", "delete", "impersonate"],
  "User Management": adminAc.statements.user,
  TimeTracking: ["read", "update"],
  Calender: ["create", "read", "update", "delete"],
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
  "User Management": ["list"], // Limited user management - can only list users
  Settings: ["view", "update"],
});

// User: Basic access - can view dashboard and settings
export const user = ac.newRole({
  Dashboard: ["view"],
  "Client Management": ["create", "read", "update", "delete", "impersonate"],
  "User Management": adminAc.statements.user,
  TimeTracking: ["read", "update"],
  "Sub Admin Management": ["create", "read", "update", "delete", "impersonate"],
  Projects: ["create", "read", "update", "delete"],
  "Task Management": ["create", "read", "update", "delete"],
  Calender: ["create", "read", "update", "delete"],
  Invoices: ["create", "read", "update", "delete"],
  "AI Assist": ["use", "create", "read", "update", "delete"],
  "Payment Links": ["create", "read"],
  // "My Subscriptions": ["read"],
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

// Export roles for the adminClient plugin - using the correct structure
export const roles = {
  superadmin: superAdmin,
  subadmin: subAdmin,
  user: user,
  viewer: viewer,
  operator: operator,
};
