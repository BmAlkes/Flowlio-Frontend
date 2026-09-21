import { Activity, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useUser } from "@/providers/user.provider";

export function OperationsSettingsLink({ global = false }: { global?: boolean }) {
  const { data } = useUser();
  const { t } = useTranslation();
  const user = data?.user;
  const allowed = user && (global
    ? user.role === "superadmin"
    : user.role === "superadmin" || user.role === "subadmin" ||
      (user.role === "user" && (user.isOrganizationOwner || user.isOrganizationManager)));

  if (!allowed) return null;

  return (
    <Link
      to={global ? "/superadmin/operations" : "/dashboard/settings/operations"}
      className="my-5 flex items-center gap-3 rounded-lg border border-border bg-background p-4 text-foreground transition-colors hover:border-[#1797ba] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1797ba]"
    >
      <Activity aria-hidden="true" className="size-5 shrink-0 text-[#11718c] dark:text-[#55bdd9]" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{t("operations.title")}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{t("operations.settingsDescription")}</span>
      </span>
      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
    </Link>
  );
}
