import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { agentScopeForPath, openAgentContext } from "@/components/ai assist/agent-context";
import type { OngoingTask } from "@/hooks/useFetchOngoingTasks";
import { daysLate, taskUrgency } from "./home-insights";

// Lio's line for today is worked out from the dashboard's own data, so it costs no AI tokens.
// Asking a question opens Lio with it, where the person sends it.
export function LioBrief({ tasks, weeklyHours, delayedProjects, canAsk }: { tasks?: OngoingTask[]; weeklyHours?: number | null; delayedProjects?: number; canAsk: boolean }) {
  const { t } = useTranslation();
  const [question, setQuestion] = useState("");
  const ask = (prompt: string) => { if (prompt.trim()) openAgentContext(agentScopeForPath("/dashboard"), prompt.trim()); };
  const urgency = taskUrgency(tasks ?? []);
  const dueToday = (tasks ?? []).filter(task => daysLate(task) === 0);
  const lines = [
    urgency.overdue > 0 && { warn: true, text: t("dashboard.home.brief.overdue", { count: urgency.overdue, days: urgency.oldestLate }) },
    dueToday.length === 1 && { text: t("dashboard.home.brief.dueTodayOne", { title: dueToday[0].title }) },
    dueToday.length > 1 && { text: t("dashboard.home.brief.dueToday", { count: dueToday.length }) },
    !!delayedProjects && { warn: true, text: t("dashboard.home.brief.delayedProjects", { count: delayedProjects }) },
    weeklyHours === 0 && { text: t("dashboard.home.brief.noHours") },
  ].filter(Boolean) as { text: string; warn?: boolean }[];
  const suggestions = [urgency.overdue > 0 && "replan", "deliver", "week"].filter(Boolean) as string[];

  return <section className="home-lio" aria-label={t("dashboard.home.brief.label")}>
    <img src="/dashboard/lio/lio-head.webp" alt="" width={56} height={56} className="home-lio-face" />
    <div className="min-w-0 flex-[999_1_420px] space-y-3">
      <p className="home-lio-eyebrow">{t("dashboard.home.brief.eyebrow")}</p>
      <p className="home-lio-text">{tasks ? (lines.length ? lines.map((line, i) => <span key={i} className={line.warn ? "home-lio-warn" : undefined}>{i ? " " : ""}{line.text}</span>) : t("dashboard.home.brief.clear")) : t("dashboard.home.brief.loading")}</p>
      {canAsk && <div className="flex flex-wrap gap-2">{suggestions.map(key => <button key={key} type="button" className="home-lio-chip" onClick={() => ask(t(`dashboard.home.brief.ask.${key}`))}>{t(`dashboard.home.brief.ask.${key}`)}</button>)}</div>}
    </div>
    {canAsk && <form className="home-lio-form" onSubmit={event => { event.preventDefault(); ask(question); setQuestion(""); }}>
      <label htmlFor="home-ask-lio" className="sr-only">{t("dashboard.home.brief.askLabel")}</label>
      <input id="home-ask-lio" value={question} onChange={event => setQuestion(event.target.value)} placeholder={t("dashboard.home.brief.askPlaceholder")} maxLength={2000} />
      <button type="submit" aria-label={t("dashboard.home.brief.askLabel")} disabled={!question.trim()}><ArrowRight className="size-[18px] rtl:rotate-180" aria-hidden="true" /></button>
    </form>}
  </section>;
}
