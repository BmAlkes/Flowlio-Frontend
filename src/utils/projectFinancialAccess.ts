/**
 * Internal project financials (budget, spend, expense log, vendor-style detail)
 * must not be visible to portal clients or external viewers.
 *
 * Visible only to: organization account owner, or platform super/sub admins.
 * (Org managers do not see this unless you extend the condition below.)
 */
export function canViewInternalProjectFinancials(user: {
  role?: string;
  isOrganizationOwner?: boolean;
} | null | undefined): boolean {
  if (!user?.role) return false;
  if (user.role === "client" || user.role === "viewer") return false;
  return (
    user.role === "superadmin" ||
    user.role === "subadmin" ||
    user.isOrganizationOwner === true
  );
}
