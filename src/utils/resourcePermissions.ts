/** UI affordances only. The server validates role, organization and visibility. */
export function canCreateResources(role?: string): boolean {
  return ["superadmin", "subadmin", "user"].includes(role ?? "");
}

export function canUpdateResources(role?: string): boolean {
  return canCreateResources(role) || role === "operator";
}

export const canDeleteResources = canCreateResources;
