import type { ReactNode } from "react";
import { ArrowUpRight, RefreshCw, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeStatus } from "./client-detail.utils";

export interface ResourceState {
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
}

export function ResourceContent({
  state,
  empty,
  children,
}: {
  state: ResourceState;
  empty?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  if (state.isLoading)
    return (
      <div
        className="cd-loading"
        aria-busy="true"
        aria-label={t("common.loading")}
      >
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  if (state.isError)
    return (
      <div className="cd-empty" role="status">
        <p>{t("clientDetail.loadError")}</p>
        <button className="cd-text-link" onClick={() => state.refetch()}>
          <RefreshCw size={14} />
          {t("clientDetail.retry")}
        </button>
      </div>
    );
  if (empty) return <p className="cd-empty">{empty}</p>;
  return <>{children}</>;
}

export function Section({
  title,
  subtitle,
  action,
  actionLabel,
  children,
  className = "",
  icon: Icon,
  tone = "blue",
}: {
  title: string;
  subtitle?: string;
  action?: () => void;
  actionLabel?: string;
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
  tone?: "blue" | "green" | "purple" | "amber";
}) {
  const { t } = useTranslation();
  return (
    <section className={`cd-section cd-tone-${tone} ${className}`}>
      <header className="cd-section-heading">
        <div className="cd-section-title">
          {Icon && <span className="cd-section-icon" aria-hidden="true"><Icon size={19} /></span>}
          <div><h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        {action && (
          <button
            className="cd-text-link"
            onClick={action}
            aria-label={`${actionLabel || t("clientDetail.viewAll")}: ${title}`}
          >
            {actionLabel || t("clientDetail.viewAll")}
            <ArrowUpRight size={14} className="rtl:-scale-x-100" />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const key = normalizeStatus(status);
  const tone = ["active", "completed", "approved", "accepted", "paid"].includes(
    key,
  )
    ? "success"
    : ["overdue", "delay", "delayed", "rejected", "churned"].includes(key)
      ? "danger"
      : [
            "ongoing",
            "in_progress",
            "pending",
            "sent",
            "onboarding",
            "under_review",
          ].includes(key)
        ? "accent"
        : "neutral";
  return (
    <span className={`cd-badge cd-badge-${tone}`}>
      <span aria-hidden="true" />
      {t(`clientDetail.status.${key}`, {
        defaultValue: status.replace(/_/g, " "),
      })}
    </span>
  );
}
