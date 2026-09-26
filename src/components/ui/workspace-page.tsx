import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const workspacePage = "workspace-canvas mx-auto w-full max-w-[1600px] space-y-5 px-3 py-6 text-foreground sm:px-6";
export const workspacePanel = "workspace-panel rounded-xl border border-slate-200/80 bg-card shadow-[0_2px_8px_rgba(15,45,75,0.025)] dark:border-border";
export const workspaceToolbar = `${workspacePanel} flex flex-wrap items-end gap-4 p-4 [&_label]:space-y-2`;

export function WorkspaceHeader({ icon: Icon, title, description, actions }: {
  icon: LucideIcon; title: string; description?: ReactNode; actions?: ReactNode;
}) {
  return <header>
    <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
      <div className="flex min-w-0 flex-1 basis-full items-start gap-4 sm:basis-auto">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#079dc5] dark:bg-primary/10 dark:text-[#55bdd9]"><Icon aria-hidden="true" className="size-6" /></span>
        <div className="min-w-0 py-1"><h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-foreground">{title}</h1>{description && <div className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</div>}</div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </header>;
}

export function WorkspaceMetric({ icon: Icon, label, children, featured = false, note, tone = 'cyan' }: {
  icon: LucideIcon; label: string; children: ReactNode; featured?: boolean; note?: ReactNode; tone?: 'cyan'|'amber'|'rose'|'violet';
}) {
  const tones = {cyan:'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',amber:'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',rose:'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300',violet:'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300'};
  return <div className={cn(workspacePanel, "flex min-w-0 items-start gap-4 p-4 sm:p-5", featured && "border-primary/30")}>
    <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-full',tones[tone])}><Icon aria-hidden="true" className="size-6" /></span>
    <div className="min-w-0"><dt className="text-xs font-medium leading-5">{label}</dt>
    <dd className="mt-1 break-words text-2xl font-semibold tracking-tight tabular-nums">{children}</dd>{note && <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>}</div>
  </div>;
}

export function WorkspaceAside({icon:Icon,title,children}:{icon:LucideIcon;title:string;children:ReactNode}) {
 return <section className={`${workspacePanel} p-5`}><h2 className="flex items-center gap-3 text-sm font-semibold"><Icon aria-hidden="true" className="size-5 shrink-0 text-[#079dc5]"/>{title}</h2><div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div></section>;
}
