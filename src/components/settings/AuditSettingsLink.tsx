import { Link } from "react-router";
import { History, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/providers/user.provider";

export function AuditSettingsLink() {
  const { data } = useUser();
  const { t } = useTranslation();
  const user = data?.user;
  if (!user || !(["superadmin", "subadmin"].includes(user.role) || (user.role === "user" && (user.isOrganizationOwner || user.isOrganizationManager)))) return null;
  return <Link to="/dashboard/settings/audit" className="my-4 flex items-center gap-4 rounded-xl border border-[#1797ba]/20 bg-[#1797ba]/5 p-5 text-foreground transition-colors hover:bg-[#1797ba]/10 focus-visible:outline-2 focus-visible:outline-[#1797ba]"><History aria-hidden="true" className="size-5 shrink-0 text-[#1797ba]" /><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">{t("audit.title")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("audit.description")}</p></div><ArrowUpRight className="size-4 shrink-0" aria-hidden="true" /></Link>;
}
