import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  FolderOpen,
} from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Project } from "@/hooks/useFetchClientProjects";
import type { ClientTask } from "@/hooks/useFetchClientTasks";
import type { ClientInvoice } from "@/hooks/useFetchClientInvoices";
import type { ClientProposal } from "@/hooks/useFetchClientProposals";
import type { MediaCenterItem } from "@/hooks/usefetchclientmedia";
import type { ClientInteraction } from "@/hooks/useCRM";
import {
  formatAmount,
  formatDate,
  normalizeStatus,
  progressValue,
  safeExternalUrl,
} from "./client-detail.utils";
import { StatusBadge } from "./ClientDetailUI";

export function ProjectList({ projects }: { projects: Project[] }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="cd-list">
      {projects.map((project) => (
        <Link
          className="cd-project-row"
          key={project.id}
          to={`/dashboard/project/view/${project.id}`}
        >
          <span className="cd-row-icon">
            <FolderOpen size={18} />
          </span>
          <div className="cd-row-main">
            <strong>{project.projectName}</strong>
            <small>
              <CalendarDays size={12} />
              {formatDate(project.endDate, i18n.resolvedLanguage || "en")}
            </small>
          </div>
          <div className="cd-project-progress">
            <span>{progressValue(project.progress)}%</span>
            <progress
              max={100}
              value={progressValue(project.progress)}
              aria-label={`${project.projectName}: ${t("clientDetail.progress")}`}
            />
          </div>
          <StatusBadge status={project.status} />
          <ArrowUpRight size={15} className="cd-row-arrow rtl:-scale-x-100" />
        </Link>
      ))}
    </div>
  );
}

export function TaskList({ tasks }: { tasks: ClientTask[] }) {
  const { i18n } = useTranslation();
  return (
    <div className="cd-list">
      {tasks.map((task) => (
        <Link
          key={task.id}
          className="cd-task-row"
          to={`/dashboard/project/view/${task.projectId}`}
        >
          {normalizeStatus(task.status) === "completed" ? (
            <CheckCircle2 size={18} className="cd-success" />
          ) : (
            <Circle size={18} className="cd-muted" />
          )}
          <div className="cd-row-main">
            <strong>{task.title}</strong>
            <small>
              {task.projectName}
              {task.assigneeName && ` · ${task.assigneeName}`}
            </small>
          </div>
          <StatusBadge status={task.status} />
          <time className="cd-row-date">
            {formatDate(task.endDate, i18n.resolvedLanguage || "en")}
          </time>
        </Link>
      ))}
    </div>
  );
}

export function InvoiceList({ invoices }: { invoices: ClientInvoice[] }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || "en";
  return (
    <div className="cd-list">
      {invoices.map((invoice) => {
        const pdf = safeExternalUrl(invoice.pdfUrl);
        return (
          <div key={invoice.id} className="cd-document-row">
            <span className="cd-row-icon">
              <FileText size={18} />
            </span>
            <div className="cd-row-main">
              <strong>{invoice.invoiceNumber}</strong>
              <small>
                {t("clientDetail.due")} · {formatDate(invoice.dueDate, locale)}
              </small>
            </div>
            <StatusBadge status={invoice.status} />
            <span className="cd-amount">
              <small>{t("clientDetail.amount")}</small>
              {formatAmount(invoice.amount, locale)}
            </span>
            {pdf && (
              <a
                className="cd-icon-button"
                href={pdf}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("clientDetail.download")}: ${invoice.invoiceNumber}`}
              >
                <Download size={16} />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ProposalList({ proposals }: { proposals: ClientProposal[] }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="cd-list">
      {proposals.map((proposal) => {
        const pdf = safeExternalUrl(proposal.pdfUrl);
        return (
          <div key={proposal.id} className="cd-document-row">
            <span className="cd-row-icon">
              <FileText size={18} />
            </span>
            <div className="cd-row-main">
              <strong>{proposal.title}</strong>
              <small>
                {formatDate(proposal.createdAt, i18n.resolvedLanguage || "en")}
              </small>
            </div>
            <StatusBadge status={proposal.status} />
            {proposal.totalValue != null && (
              <span className="cd-amount">
                <small>{t("clientDetail.amount")}</small>
                {formatAmount(
                  String(proposal.totalValue),
                  i18n.resolvedLanguage || "en",
                )}
              </span>
            )}
            {pdf && (
              <a
                className="cd-text-link"
                href={pdf}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("clientDetail.open")}: ${proposal.title}`}
              >
                {t("clientDetail.open")}
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FileList({ files }: { files: MediaCenterItem[] }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="cd-list">
      {files.map((file) => {
        const url = safeExternalUrl(file.fileUrl);
        return (
          <div key={file.fileId} className="cd-document-row">
            <span className="cd-row-icon">
              <FileText size={18} />
            </span>
            <div className="cd-row-main">
              <strong>{file.fileName}</strong>
              <small>
                {formatDate(file.createdAt, i18n.resolvedLanguage || "en")}
                {file.projectName && ` · ${file.projectName}`}
              </small>
            </div>
            {url && (
              <a
                className="cd-icon-button"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("clientDetail.open")}: ${file.fileName}`}
              >
                <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ActivityList({ items }: { items: ClientInteraction[] }) {
  const { t, i18n } = useTranslation();
  return (
    <ol className="cd-activity">
      {items.map((item) => (
        <li key={item.id}>
          <span className="cd-activity-dot" aria-hidden="true" />
          <div>
            <div className="cd-activity-meta">
              <strong>{item.user?.name || t("clientDetail.team")}</strong>
              <time>
                {formatDate(item.createdAt, i18n.resolvedLanguage || "en")}
              </time>
            </div>
            <p>{item.content}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
