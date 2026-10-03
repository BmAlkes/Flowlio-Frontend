import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";

export function AutomationNavigation() {
 const { t } = useTranslation();
 return <nav className="mb-5 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2" aria-label={t("workflows.navigation")}>
  {[["automations", "readyMade"], ["workflows", "customRules"]].map(([path, label]) => <NavLink key={path} to={`/dashboard/settings/${path}`} className={({ isActive }) => `rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-primary ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{t(`workflows.${label}`)}</NavLink>)}
 </nav>;
}
