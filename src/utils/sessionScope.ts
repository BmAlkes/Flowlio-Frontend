type Identity = { user: { id: string }; session: { id: string } };
type Profile = {
  id: string;
  organizationId?: string | null;
  role?: string;
  isOrganizationOwner?: boolean;
  isOrganizationManager?: boolean;
  isSuperAdmin?: boolean;
  clientId?: string | null;
  clientProfile?: { id: string; organizationId: string } | null;
};

export function mergeSessionProfile<T extends Identity, P extends Profile>(
  session: T | null | undefined,
  response: { data?: P | null } | null | undefined,
) {
  if (!session || !response?.data || response.data.id !== session.user.id)
    return null;
  const profile = response.data;
  return {
    ...session,
    user: {
      ...session.user,
      ...profile,
      organizationId: profile.organizationId ?? null,
      clientId: profile.clientId ?? profile.clientProfile?.id ?? null,
    } as Omit<T["user"], keyof P | "organizationId" | "clientId"> &
      Omit<P, "organizationId" | "clientId"> & {
        organizationId: string | null;
        clientId: string | null;
      },
  };
}

export function sessionScope(
  session?: Identity | null,
  profile?: Profile | null,
) {
  return JSON.stringify([
    session?.user.id ?? null,
    session?.session.id ?? null,
    profile?.organizationId ?? null,
    profile?.role ?? null,
    profile?.isSuperAdmin ?? false,
    profile?.isOrganizationOwner ?? false,
    profile?.isOrganizationManager ?? false,
    profile?.clientId ?? null,
  ]);
}
