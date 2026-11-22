import { useTranslation } from "react-i18next";
import { Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/hooks/useLeads";
import { contactLinks } from "./lead-ui";

// Email, call and WhatsApp for a lead. A missing address or number keeps its button, disabled, so rows line up.
export function LeadContactActions({ lead, compact = false }: { lead: Pick<Lead, "name" | "email" | "phone">; compact?: boolean }) {
  const { t } = useTranslation();
  const links = contactLinks(lead);
  const items: { key: "email" | "call" | "whatsapp"; icon: LucideIcon; href: string | null; missing: string; tone: string }[] = [
    { key: "email", icon: Mail, href: links.email, missing: t("leadsLayout.noEmail"), tone: "text-blue-700 dark:text-blue-300" },
    { key: "call", icon: Phone, href: links.call, missing: t("leadsLayout.noPhone"), tone: "text-slate-700 dark:text-slate-300" },
    { key: "whatsapp", icon: MessageCircle, href: links.whatsapp, missing: t("leadsLayout.noPhone"), tone: "text-emerald-700 dark:text-emerald-300" },
  ];
  return <>
    {items.map(({ key, icon: Icon, href, missing, tone }) => {
      const label = t(`leadsLayout.${key}Lead`, { name: lead.name });
      const text = t(`leadsLayout.${key}`);
      if (!href) return compact
        ? <Button key={key} type="button" variant="ghost" size="icon" className="size-8 opacity-40" disabled aria-label={`${label}: ${missing}`} title={missing}><Icon className="size-4" /></Button>
        : <Button key={key} type="button" variant="outline" size="sm" className="border-dashed" disabled title={missing}><Icon className="size-4" />{text}</Button>;
      const external = key === "whatsapp" ? { target: "_blank", rel: "noreferrer" } : {};
      return compact
        ? <Button key={key} asChild variant="ghost" size="icon" className={`size-8 ${tone}`}><a href={href} aria-label={label} title={label} {...external}><Icon className="size-4" /></a></Button>
        : <Button key={key} asChild variant="outline" size="sm" className={tone}><a href={href} {...external}><Icon className="size-4" />{text}</a></Button>;
    })}
  </>;
}
