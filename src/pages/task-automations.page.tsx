import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { History, Loader2, Pencil, Plus, Trash2, Wand2 } from "lucide-react";
import { AutomationNavigation } from "@/components/ui/automation-navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useFetchCustomFields } from "@/hooks/usecustomfields";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { useFetchOrganizationUsers } from "@/hooks/usefetchorganizationusers";
import { useAutomationRuns, useDeleteAutomation, useTaskAutomations, useToggleAutomation, type Rule, type RuleDraft } from "@/features/task-automations/api";
import { describeRule, type Lookup } from "@/features/task-automations/describe";
import { emptyDraft, RECIPES } from "@/features/task-automations/recipes";
import { RuleBuilder } from "@/features/task-automations/RuleBuilder";

function RunHistory({ ruleId }: { ruleId: string }) {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useAutomationRuns(ruleId);
  if (isLoading) return <p className="text-xs text-muted-foreground">{t("taskAutomations.loading")}</p>;
  if (!data?.length) return <p className="text-xs text-muted-foreground">{t("taskAutomations.noRuns")}</p>;
  return (
    <ul className="max-h-56 divide-y divide-border overflow-y-auto rounded-lg border border-border text-xs">
      {data.map(run => (
        <li key={run.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <span>{new Date(run.createdAt).toLocaleString(i18n.language, { dateStyle: "short", timeStyle: "short" })}</span>
          <span className="min-w-0 flex-1 truncate text-muted-foreground">{run.taskTitle ?? t("taskAutomations.scheduledRun")}</span>
          <span className={run.outcome === "failed" ? "text-destructive" : "text-emerald-700 dark:text-emerald-400"}>{t(`taskAutomations.outcomes.${run.outcome}`, { defaultValue: run.outcome })}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TaskAutomationsPage() {
  const { t } = useTranslation();
  const rules = useTaskAutomations();
  const fields = useFetchCustomFields("task");
  const projects = useFetchProjects();
  const users = useFetchOrganizationUsers();
  const toggle = useToggleAutomation();
  const remove = useDeleteAutomation();
  const [editing, setEditing] = useState<{ draft: RuleDraft; id?: string } | null>(null);
  const [historyOf, setHistoryOf] = useState<string | null>(null);

  useEffect(() => { document.title = `${t("taskAutomations.title")} - Flowlio`; }, [t]);

  const lookup = useMemo<Lookup>(() => ({
    fields: fields.data?.data ?? [],
    projects: (projects.data?.data ?? []).map(project => ({ id: project.id, name: project.projectName })),
    members: (users.data?.data?.userMembers ?? []).map(user => ({ id: user.user?.id || user.id, name: user.user?.name || `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || user.email })),
  }), [fields.data, projects.data, users.data]);

  const edit = (rule: Rule) => setEditing({ id: rule.id, draft: { name: rule.name, enabled: rule.enabled, projectId: rule.projectId, trigger: rule.trigger, conditions: rule.conditions, actions: rule.actions } });
  const confirmDelete = (rule: Rule) => {
    if (!window.confirm(t("taskAutomations.deleteConfirm", { name: rule.name }))) return;
    remove.mutate(rule.id, { onError: () => toast.error(t("taskAutomations.saveFailed")) });
  };
  const forbidden = (rules.error as { response?: { status?: number } } | null)?.response?.status === 403;

  return (
    <div className="px-2">
      <AutomationNavigation />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Wand2 className="size-6" aria-hidden="true" />{t("taskAutomations.title")}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{t("taskAutomations.subtitle")}</p>
        </div>
        <Button onClick={() => setEditing({ draft: emptyDraft() })} disabled={forbidden}><Plus className="size-4" aria-hidden="true" />{t("taskAutomations.new")}</Button>
      </div>

      <section className="mb-8" aria-labelledby="recipes-title">
        <h2 id="recipes-title" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("taskAutomations.recipesTitle")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {RECIPES.map(recipe => {
            const draft = recipe.draft(t);
            return (
              <li key={recipe.key}>
                <button type="button" disabled={forbidden} className="h-full w-full rounded-xl border border-border bg-card p-4 text-start transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#1797ba] disabled:opacity-50"
                  onClick={() => setEditing({ draft })}>
                  <span className="block font-medium">{draft.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{describeRule(t, draft, lookup)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="rules-title">
        <h2 id="rules-title" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("taskAutomations.yours")}</h2>
        {rules.isLoading ? <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label={t("taskAutomations.loading")} />
          : forbidden ? <p className="text-sm text-muted-foreground">{t("taskAutomations.onlyManagers")}</p>
          : !rules.data?.length ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t("taskAutomations.empty")}</p>
          : (
            <ul className="space-y-3">
              {rules.data.map(rule => (
                <li key={rule.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <Switch checked={rule.enabled} aria-label={t("taskAutomations.toggle", { name: rule.name })} disabled={toggle.isPending}
                      onCheckedChange={enabled => toggle.mutate({ id: rule.id, enabled })} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">{describeRule(t, rule, lookup)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {rule.projectId ? lookup.projects.find(p => p.id === rule.projectId)?.name : t("taskAutomations.allProjects")}
                        {" · "}{t("taskAutomations.runs", { count: rule.runCount })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="size-8" aria-label={t("taskAutomations.history", { name: rule.name })} aria-expanded={historyOf === rule.id}
                        onClick={() => setHistoryOf(current => (current === rule.id ? null : rule.id))}><History className="size-4" aria-hidden="true" /></Button>
                      <Button size="icon" variant="ghost" className="size-8" aria-label={t("taskAutomations.editRule", { name: rule.name })} onClick={() => edit(rule)}><Pencil className="size-4" aria-hidden="true" /></Button>
                      <Button size="icon" variant="ghost" className="size-8 text-destructive" aria-label={t("taskAutomations.deleteRule", { name: rule.name })} onClick={() => confirmDelete(rule)}><Trash2 className="size-4" aria-hidden="true" /></Button>
                    </div>
                  </div>
                  {historyOf === rule.id && <RunHistory ruleId={rule.id} />}
                </li>
              ))}
            </ul>
          )}
      </section>

      {editing && <RuleBuilder initial={editing.draft} ruleId={editing.id} lookup={lookup} onClose={() => setEditing(null)} />}
    </div>
  );
}
