import {
  Building2,
  CalendarDays,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, normalizeStatus } from "./client-detail.utils";

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  address?: string;
  cpfcnpj?: string;
  businessIndustry?: string;
  status: string;
  createdAt: string;
  portalAccessEnabled?: boolean;
  followUpAt?: string | null;
  followUpNote?: string | null;
}

export function ClientDetailSidebar({
  client,
  onStatusChange,
  updating,
  onPortal,
}: {
  client: ClientProfile;
  onStatusChange: (status: string) => void;
  updating: boolean;
  onPortal: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || "en";
  const initials = client.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();
  const statuses = Array.from(
    new Set([
      client.status,
      "Active",
      "Onboarding",
      "On Hold",
      "Inactive",
      "Completed",
      "Churned",
    ]),
  ).filter(Boolean);
  return (
    <aside className="cd-profile" aria-label={t("clientDetail.profile")}>
      <div className="cd-profile-identity">
        <Avatar className="cd-avatar">
          <AvatarImage src={client.image} alt={client.name} />
          <AvatarFallback>{initials || <UserRound />}</AvatarFallback>
        </Avatar>
        <p className="cd-eyebrow">{t("clientDetail.clientProfile")}</p>
        <h1>{client.name}</h1>
        <p className="cd-industry">
          {client.businessIndustry || t("clientDetail.client")}
        </p>
        <Select
          value={client.status}
          onValueChange={onStatusChange}
          disabled={updating}
        >
          <SelectTrigger
            className="cd-status-select"
            aria-label={t("clientDetail.changeStatus")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`clientDetail.status.${normalizeStatus(status)}`, {
                  defaultValue: status,
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="cd-profile-group">
        <h2>{t("clientDetail.contact")}</h2>
        {client.email && (
          <a className="cd-contact" href={`mailto:${client.email}`}>
            <Mail size={16} />
            <span dir="auto">{client.email}</span>
          </a>
        )}
        {client.phone && (
          <a
            className="cd-contact"
            href={`tel:${client.phone.replace(/[^+\d]/g, "")}`}
          >
            <Phone size={16} />
            <span dir="auto">{client.phone}</span>
          </a>
        )}
        {client.address && (
          <div className="cd-contact">
            <MapPin size={16} />
            <span>{client.address}</span>
          </div>
        )}
        {!client.email && !client.phone && !client.address && (
          <p className="cd-muted">{t("clientDetail.noContact")}</p>
        )}
      </div>
      <div className="cd-profile-group">
        <h2>{t("clientDetail.details")}</h2>
        <dl className="cd-details">
          <div>
            <dt>
              <CalendarDays size={14} />
              {t("clientDetail.clientSince")}
            </dt>
            <dd>{formatDate(client.createdAt, locale)}</dd>
          </div>
          {client.cpfcnpj && (
            <div>
              <dt>
                <Building2 size={14} />
                {t("table.vat")}
              </dt>
              <dd dir="auto">{client.cpfcnpj}</dd>
            </div>
          )}
        </dl>
      </div>
      {client.followUpAt && (
        <div className="cd-followup">
          <p className="cd-eyebrow">{t("clientDetail.nextFollowUp")}</p>
          <strong>{formatDate(client.followUpAt, locale)}</strong>
          {client.followUpNote && <p>{client.followUpNote}</p>}
        </div>
      )}
      <button className="cd-portal" onClick={onPortal}>
        <KeyRound size={18} />
        <span>
          <strong>{t("clientDetail.portal")}</strong>
          <small>{t("clientDetail.manageAccess")}</small>
        </span>
      </button>
    </aside>
  );
}
