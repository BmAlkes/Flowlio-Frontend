import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ChevronDown, Loader2, Mail, UserX } from "lucide-react";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GeneralModal } from "@/components/common/generalmodal";

export const REASONS = ["price", "missing_feature", "too_complex", "payment_problem", "just_exploring", "other"] as const;
type Reason = (typeof REASONS)[number];
type Blocked = "opted_out" | "answered" | "max_reminders" | "recent_reminder" | "too_new" | null;

export type PendingSignup = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  daysSinceSignup: number;
  stage: "no_plan" | "checkout";
  planName: string | null;
  organizationName: string | null;
  lastSeenAt: string | null;
  reminders: number;
  lastReminderAt: string | null;
  reason: Reason | null;
  optedOut: boolean;
  blockedBy: Blocked;
};
type Summary = { total: number; noPlan: number; checkout: number; canRemind: number; reminded: number; answered: number; optedOut: number; reasons: Record<Reason, number> };
type Response = { data: PendingSignup[]; summary: Summary };
const KEY = ["superadmin-pending-signups"];

/** Super admin: people who signed up but never finished, where they stopped, follow-up emails and their answers. */
export function PendingSignupsPanel() {
  const { t, i18n } = useTranslation();
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [language, setLanguage] = useState<"pt" | "en">(i18n.language?.startsWith("pt") ? "pt" : "en");
  const [confirming, setConfirming] = useState(false);

  const query = useQuery({
    queryKey: KEY,
    queryFn: async () => (await axios.get<Response>("/superadmin/pending-signups")).data,
    retry: false,
  });
  const remind = useMutation({
    mutationFn: async (userIds: string[]) =>
      (await axios.post<{ data: { sent: number; skipped: { id: string; reason: string }[] } }>("/superadmin/pending-signups/remind", { userIds, language })).data.data,
    onSuccess: (result) => {
      toast.success(t("signups.sentToast", { sent: result.sent, skipped: result.skipped.length }));
      setSelected(new Set());
      setConfirming(false);
      void cache.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error(t("signups.failed")),
  });
  const [testStage, setTestStage] = useState<"no_plan" | "checkout">("no_plan");
  const sendTest = useMutation({
    mutationFn: async () => (await axios.post<{ data: { email: string } }>("/superadmin/pending-signups/test", { language, stage: testStage })).data.data,
    onSuccess: (result) => toast.success(t("signups.testSent", { email: result.email })),
    onError: () => toast.error(t("signups.testFailed")),
  });

  const signups = useMemo(() => query.data?.data ?? [], [query.data]);
  const eligible = useMemo(() => signups.filter((s) => !s.blockedBy).map((s) => s.id), [signups]);
  if (query.isError) return null; // Sub admins have no access.
  const summary = query.data?.summary;
  const date = (value: string) => new Date(value).toLocaleDateString(i18n.language);
  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allEligibleSelected = eligible.length > 0 && eligible.every((id) => selected.has(id));

  const stats: [string, number | undefined][] = [
    ["total", summary?.total],
    ["noPlan", summary?.noPlan],
    ["checkout", summary?.checkout],
    ["answered", summary?.answered],
    ["canRemind", summary?.canRemind],
  ];

  return (
    <section className="mx-4 mb-6 rounded-xl border bg-card p-5 space-y-4" aria-labelledby="pending-signups-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400" aria-hidden="true">
            <UserX className="size-5" />
          </span>
          <div>
            <h2 id="pending-signups-title" className="font-semibold">{t("signups.title")}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{t("signups.description")}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          {t(open ? "signups.hide" : "signups.show")}
          <ChevronDown className={`size-4 ms-1 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </Button>
      </div>

      {query.isLoading ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          <dl className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stats.map(([key, value]) => (
              <div key={key} className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">{t(`signups.stats.${key}`)}</dt>
                <dd className="text-xl font-semibold">{value ?? 0}</dd>
              </div>
            ))}
          </dl>
          {summary && summary.answered > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">{t("signups.reasonsTitle")}</p>
              <ul className="flex flex-wrap gap-2">
                {REASONS.filter((reason) => summary.reasons[reason] > 0).map((reason) => (
                  <li key={reason} className="rounded-full border px-3 py-1 text-sm">
                    {t(`signups.reasons.${reason}`)}: <strong>{summary.reasons[reason]}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {open && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-3">
          <p className="text-sm text-muted-foreground basis-full">{t("signups.testHint")}</p>
          <label className="flex items-center gap-2 text-sm">
            {t("signups.language")}
            <select className="rounded-md border bg-background px-2 py-1 text-sm" value={language} onChange={(event) => setLanguage(event.target.value as "pt" | "en")}>
              <option value="pt">Português</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            {t("signups.testVersion")}
            <select className="rounded-md border bg-background px-2 py-1 text-sm" value={testStage} onChange={(event) => setTestStage(event.target.value as "no_plan" | "checkout")}>
              <option value="no_plan">{t("signups.stage.no_plan")}</option>
              <option value="checkout">{t("signups.stage.checkout")}</option>
            </select>
          </label>
          <Button size="sm" variant="outline" disabled={sendTest.isPending} onClick={() => sendTest.mutate()}>
            {sendTest.isPending ? <Loader2 className="size-4 me-2 animate-spin" aria-hidden="true" /> : <Mail className="size-4 me-2" aria-hidden="true" />}
            {t("signups.sendTest")}
          </Button>
        </div>
      )}
      {open && signups.length === 0 && !query.isLoading && <p className="text-sm text-muted-foreground">{t("signups.empty")}</p>}
      {open && signups.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={allEligibleSelected} disabled={eligible.length === 0} onCheckedChange={(checked) => setSelected(checked ? new Set(eligible) : new Set())} />
              {t("signups.selectEligible", { count: eligible.length })}
            </label>
            <Button size="sm" className="ms-auto" disabled={selected.size === 0 || remind.isPending} onClick={() => setConfirming(true)}>
              <Mail className="size-4 me-2" aria-hidden="true" />
              {t("signups.send", { count: selected.size })}
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-start">
                <tr>
                  <th className="p-2 w-8"><span className="sr-only">{t("signups.select")}</span></th>
                  <th className="p-2 text-start">{t("signups.columns.person")}</th>
                  <th className="p-2 text-start">{t("signups.columns.stoppedAt")}</th>
                  <th className="p-2 text-start">{t("signups.columns.signedUp")}</th>
                  <th className="p-2 text-start">{t("signups.columns.lastSeen")}</th>
                  <th className="p-2 text-start">{t("signups.columns.followUp")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {signups.map((signup) => (
                  <tr key={signup.id}>
                    <td className="p-2">
                      <Checkbox aria-label={signup.email} checked={selected.has(signup.id)} disabled={Boolean(signup.blockedBy)} onCheckedChange={() => toggle(signup.id)} />
                    </td>
                    <td className="p-2">
                      <p className="font-medium">{signup.organizationName || signup.name}</p>
                      <p className="text-muted-foreground">{signup.email}{signup.emailVerified ? "" : ` · ${t("signups.unverified")}`}</p>
                    </td>
                    <td className="p-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${signup.stage === "checkout" ? "bg-sky-500/10 text-sky-700 dark:text-sky-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                        {t(`signups.stage.${signup.stage}`)}
                      </span>
                      {signup.planName && <span className="ms-2 text-muted-foreground">{signup.planName}</span>}
                    </td>
                    <td className="p-2 whitespace-nowrap">{date(signup.createdAt)} <span className="text-muted-foreground">({t("signups.daysAgo", { count: signup.daysSinceSignup })})</span></td>
                    <td className="p-2 whitespace-nowrap">{signup.lastSeenAt ? date(signup.lastSeenAt) : "-"}</td>
                    <td className="p-2">
                      {signup.reason ? (
                        <strong>{t(`signups.reasons.${signup.reason}`)}</strong>
                      ) : signup.optedOut ? (
                        <span className="text-muted-foreground">{t("signups.blocked.opted_out")}</span>
                      ) : signup.reminders > 0 ? (
                        <span>{t("signups.reminded", { count: signup.reminders, date: date(signup.lastReminderAt!) })}{signup.blockedBy ? ` · ${t(`signups.blocked.${signup.blockedBy}`)}` : ""}</span>
                      ) : (
                        <span className="text-muted-foreground">{signup.blockedBy ? t(`signups.blocked.${signup.blockedBy}`) : t("signups.notContacted")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <GeneralModal open={confirming} onOpenChange={setConfirming} contentProps={{ className: "max-w-md" }}>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("signups.confirmTitle", { count: selected.size })}</h2>
          <p className="text-sm text-muted-foreground">{t("signups.confirmBody")}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirming(false)}>{t("signups.cancel")}</Button>
            <Button disabled={remind.isPending} onClick={() => remind.mutate([...selected])}>
              {remind.isPending && <Loader2 className="size-3.5 me-2 animate-spin" />}
              {t("signups.confirmSend")}
            </Button>
          </div>
        </div>
      </GeneralModal>
    </section>
  );
}
