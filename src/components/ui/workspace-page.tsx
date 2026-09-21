import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const workspacePanel = "rounded-xl border border-border bg-card shadow-sm";
export const workspaceToolbar = "flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-sm [&_label]:space-y-2";

export function WorkspaceHeader({ icon: Icon, title, description, actions }: {
  icon: LucideIcon; title: string; description?: ReactNode; actions?: ReactNode;
}) {
  return <header className="relative overflow-hidden rounded-xl border border-[#1797ba]/20 bg-card shadow-sm">
    <div className="absolute inset-y-0 start-0 w-1 bg-[#1797ba]" />
    <div className="flex flex-wrap items-center justify-between gap-5 bg-[#1797ba]/5 p-5 sm:p-6">
      <div className="flex min-w-0 flex-1 basis-full items-start gap-4 sm:basis-auto">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[#1797ba]/20 bg-background text-[#11718c] dark:text-[#55bdd9]"><Icon aria-hidden="true" className="size-6" /></span>
        <div className="min-w-0"><h1 className="text-2xl font-medium tracking-tight">{title}</h1>{description && <div className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</div>}</div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </header>;
}

export function WorkspaceMetric({ icon: Icon, label, children, featured = false }: {
  icon: LucideIcon; label: string; children: ReactNode; featured?: boolean;
}) {
  return <div className={cn(workspacePanel, "min-w-0 p-5", featured && "border-[#1797ba]/35 bg-[#1797ba]/10")}>
    <dt className="flex items-center gap-2 text-sm text-muted-foreground"><Icon aria-hidden="true" className="size-4 shrink-0 text-[#11718c] dark:text-[#55bdd9]" />{label}</dt>
    <dd className="mt-4 break-words text-2xl font-medium tracking-tight tabular-nums">{children}</dd>
  </div>;
}
