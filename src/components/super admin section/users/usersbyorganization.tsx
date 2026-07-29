import { useMemo, useState } from "react";
import { Search, Loader2, Users as UsersIcon } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFetchAllUsers, UserWithOrganizations } from "@/hooks/useFetchAllUsers";
import { useTranslation } from "react-i18next";

interface OrgGroup {
  id: string;
  name: string;
  users: UserWithOrganizations[];
}

const RoleBadge = ({ user }: { user: UserWithOrganizations }) => {
  const { t } = useTranslation();
  if (user.isSuperAdmin) {
    return <Badge className="bg-purple-100 text-purple-800">{t("superadminSettings.superAdmin", "Super Admin")}</Badge>;
  }
  if (user.subadminId) {
    return <Badge className="bg-blue-100 text-blue-800">{t("superadminSettings.subAdmin", "Sub Admin")}</Badge>;
  }
  return (
    <Badge className="bg-muted text-gray-800">
      {user.role ? t(`userManagement.roles.${user.role.toLowerCase()}`, user.role) : t("superadminSettings.user", "User")}
    </Badge>
  );
};

const StatusBadge = ({ verified }: { verified: boolean }) => {
  const { t } = useTranslation();
  return (
    <Badge className={verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
      {verified ? t("common.verified", "Verified") : t("common.unverified", "Unverified")}
    </Badge>
  );
};

const UserRow = ({ user }: { user: UserWithOrganizations }) => (
  <Flex className="items-center justify-between gap-3 py-2.5 border-b border-border last:border-b-0">
    <Flex className="items-center gap-3 min-w-0">
      {user.image ? (
        <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full shrink-0" />
      ) : (
        <Box className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </Box>
      )}
      <Box className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </Box>
    </Flex>
    <Flex className="items-center gap-2 shrink-0">
      <RoleBadge user={user} />
      <StatusBadge verified={user.emailVerified} />
    </Flex>
  </Flex>
);

export const UsersByOrganization = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  // Fetch a large page so grouping reflects the whole platform, not just
  // the current page of the flat table.
  const { data, isLoading } = useFetchAllUsers({ limit: 1000 });
  const users = data?.data?.users || [];

  const { groups, unassigned } = useMemo(() => {
    const map = new Map<string, OrgGroup>();
    const unassignedUsers: UserWithOrganizations[] = [];

    users.forEach((user) => {
      if (!user.organizations || user.organizations.length === 0) {
        unassignedUsers.push(user);
        return;
      }
      user.organizations.forEach(({ organization }) => {
        if (!organization) return;
        if (!map.has(organization.id)) {
          map.set(organization.id, { id: organization.id, name: organization.name, users: [] });
        }
        map.get(organization.id)!.users.push(user);
      });
    });

    const sorted = Array.from(map.values()).sort((a, b) => b.users.length - a.users.length);
    return { groups: sorted, unassigned: unassignedUsers };
  }, [users]);

  const query = search.trim().toLowerCase();
  const filteredGroups = query ? groups.filter((g) => g.name.toLowerCase().includes(query)) : groups;
  const showUnassigned = unassigned.length > 0 && (!query || "unassigned".includes(query));

  if (isLoading) {
    return (
      <Box className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Box>
    );
  }

  return (
    <Box className="space-y-4">
      <Box className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("superadmin.users.searchOrganizations", "Search organizations...")}
          className="pl-9"
        />
      </Box>

      {filteredGroups.length === 0 && !showUnassigned ? (
        <Box className="text-center py-12 text-sm text-muted-foreground">
          {t("superadmin.users.noOrganizationsFound", "No organizations found.")}
        </Box>
      ) : (
        <Accordion type="multiple" className="w-full border border-border rounded-xl divide-y divide-border overflow-hidden">
          {filteredGroups.map((group) => (
            <AccordionItem key={group.id} value={group.id} className="border-b-0 px-4">
              <AccordionTrigger className="hover:no-underline">
                <Flex className="items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{group.name}</span>
                  <Badge className="bg-indigo-100 text-indigo-700">{group.users.length}</Badge>
                </Flex>
              </AccordionTrigger>
              <AccordionContent>
                <Box>
                  {group.users.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </Box>
              </AccordionContent>
            </AccordionItem>
          ))}

          {showUnassigned && (
            <AccordionItem value="unassigned" className="border-b-0 px-4">
              <AccordionTrigger className="hover:no-underline">
                <Flex className="items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">
                    {t("superadmin.users.noOrganization", "No Organization")}
                  </span>
                  <Badge className="bg-gray-100 text-gray-700">{unassigned.length}</Badge>
                </Flex>
              </AccordionTrigger>
              <AccordionContent>
                <Box>
                  {unassigned.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </Box>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </Box>
  );
};
