import {useEffect, useId, useRef, useState} from "react";
import {Link, useSearchParams} from "react-router";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import type {AxiosError} from "axios";
import {useTranslation} from "react-i18next";
import {AlertCircle, ArrowRight, CalendarDays, CheckCheck, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Clock3, Flag, MessageSquareText, Plus, RefreshCw, Send, UserRound} from "lucide-react";
import {axios} from "@/configs/axios.config";
import {useDataScope} from "@/hooks/useDataScope";
import {Button} from "@/components/ui/button";
import {DeliveryRequestDialog} from "./DeliveryRequestDialog";
import type {DeliveryReview, ReviewList} from "./deliveryReviewTypes";
export type {DeliveryReview} from "./deliveryReviewTypes";

export function DeliveryReviews({projectId}: {projectId: string}) {
  const scope = useDataScope();
  return <DeliveryReviewsPanel key={`${scope}:${projectId}`} projectId={projectId} />;
}

function DeliveryReviewsPanel({projectId}: {projectId: string}) {
  const {t} = useTranslation();
  const scope = useDataScope();
  const client = useQueryClient();
  const titleId = useId();
  const section = useRef<HTMLElement>(null);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<"request" | "create" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useSearchParams();
  const reviewId = search.get("reviewId") || undefined;
  const path = `/projects/${encodeURIComponent(projectId)}/delivery-reviews`;
  const query = useQuery({
    queryKey: ["delivery-reviews", scope, projectId, page, reviewId],
    queryFn: async () => (await axios.get<{data: ReviewList}>(path, {params: {page, reviewId}})).data.data,
  });
  const data = query.data;
  useEffect(() => {
    if (reviewId && !query.isPending) section.current?.scrollIntoView?.({block: "start"});
  }, [reviewId, query.isPending]);
  const refresh = async () => {
    await Promise.all(["onboarding", "client-pending", "attention"].map(key => client.invalidateQueries({queryKey: [key]})));
    await client.invalidateQueries({queryKey: ["delivery-reviews", scope, projectId]});
  };
  const refreshMilestones = async () => {
    await Promise.all(["project-milestones", "client-pending", "attention"].map(key => client.invalidateQueries({queryKey: [key]})));
    return (await query.refetch()).data;
  };
  const showReview = (id?: string) => {
    setPage(1);
    setSearch(previous => {const next = new URLSearchParams(previous); if (id) next.set("reviewId", id); else next.delete("reviewId"); return next;}, {replace: true});
  };
  const requested = async (id: string, existing: boolean) => {
    setNotice(t(existing ? "delivery.existingRequestFound" : "delivery.requested"));
    showReview(existing ? id : undefined);
    await refresh();
  };
  const blocked = data && (!data.hasClient ? "CLIENT_REQUIRED" : data.requestBlockReason);
  const canStart = !!data?.canRequest && !blocked;
  return <section ref={section} id="delivery-reviews" tabIndex={-1} className="scroll-mt-6 overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-primary" aria-labelledby={titleId}>
    <header className="flex flex-col items-stretch gap-4 border-b border-border bg-sky-50/50 sm:flex-row sm:items-center sm:justify-between px-5 py-4 dark:bg-primary/5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-white text-[#11718c] dark:border-primary/20 dark:bg-background dark:text-sky-300"><ClipboardCheck aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0"><h2 id={titleId} className="text-base font-semibold leading-6">{t("delivery.title")}</h2><p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">{t("delivery.description")}</p></div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="icon" aria-label={t("operations.refresh")} title={t("operations.refresh")} disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw aria-hidden="true" className={`size-4 ${query.isFetching ? "animate-spin motion-reduce:animate-none" : ""}`} /></Button>
        {data?.canRequest && <Button type="button" size="sm" className="bg-[#11718c] text-white hover:bg-[#0e6078]" disabled={query.isError || !!blocked} onClick={() => {setNotice(null); setDialog("request");}}><Send aria-hidden="true" className="size-4" />{t("delivery.request")}</Button>}
      </div>
    </header>
    <div className="space-y-4 p-5">
      {notice && <p role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-sm leading-6 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"><CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0" />{notice}</p>}
      {query.isPending ? <div role="status" className="space-y-3 py-4"><span className="text-sm text-muted-foreground">{t("common.loading")}</span><div aria-hidden="true" className="h-20 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" /></div> : query.isError ? <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm"><AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" /><p className="leading-6">{t("delivery.error")}</p></div> : data && <>
        {data.canRequest && blocked && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-500/10"><div className="flex min-w-0 basis-full items-start gap-3 sm:flex-1"><AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" /><p className="text-sm leading-6">{t(blocked === "CLIENT_REQUIRED" ? "delivery.noClient" : "delivery.portalRequired")}</p></div><Button type="button" size="sm" variant="outline" asChild><Link to={blocked === "CLIENT_REQUIRED" ? `/dashboard/project/edit/${encodeURIComponent(projectId)}` : `/dashboard/client-management/${encodeURIComponent(data.client?.id ?? "")}`}>{t(blocked === "CLIENT_REQUIRED" ? "delivery.linkClient" : "delivery.manageClient")}<ArrowRight aria-hidden="true" className="size-3.5 rtl:rotate-180" /></Link></Button></div>}
        {reviewId && <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"><p className="text-xs text-muted-foreground">{t("delivery.focusedReview")}</p><Button type="button" variant="ghost" size="sm" onClick={() => showReview()}>{t("delivery.allReviews")}</Button></div>}
        {data.reviews.length === 0 ? <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-border bg-muted/15 p-5 sm:flex-row sm:items-center sm:p-6">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#079dc5] dark:bg-primary/10"><Flag aria-hidden="true" className="size-6" /></span>
          <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">{t(reviewId ? "delivery.reviewNotFound" : "delivery.empty")}</h3><p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{t(reviewId ? "delivery.reviewNotFoundHint" : data.canRequest ? data.milestones.length ? "delivery.emptyReadyHint" : "delivery.noMilestones" : "delivery.emptyReaderHint")}</p>
            {canStart && !reviewId && <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => setDialog(data.milestones.length ? "request" : "create")}><Plus aria-hidden="true" className="size-4" />{t(data.milestones.length ? "delivery.firstRequest" : "delivery.createMilestone")}</Button>}
          </div>
        </div> : <>
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("delivery.history")}</h3><p className="text-xs text-muted-foreground">{t("delivery.loadedCount", {count: data.reviews.length})}</p></div>
          <ul className="space-y-3">{data.reviews.map(review => <li key={review.id}><DeliveryReviewItem projectId={projectId} review={review} onChanged={refresh} /></li>)}</ul>
        </>}
        {!reviewId && (page > 1 || data.hasMore) && <nav className="flex items-center justify-between gap-2 border-t border-border pt-4 text-xs" aria-label={t("delivery.history")}><Button type="button" variant="outline" size="sm" disabled={page <= 1 || query.isFetching} onClick={() => setPage(value => value - 1)}><ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />{t("delivery.previous")}</Button><span className="text-muted-foreground">{t("delivery.page", {page})}</span><Button type="button" variant="outline" size="sm" disabled={!data.hasMore || query.isFetching} onClick={() => setPage(value => value + 1)}>{t("delivery.next")}<ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" /></Button></nav>}
        <p className="flex items-start gap-2 border-t border-border/70 pt-4 text-xs leading-5 text-muted-foreground"><CheckCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#11718c] dark:text-sky-300" />{t("delivery.historyHint")}</p>
      </>}
    </div>
    {dialog && data?.canRequest && <DeliveryRequestDialog projectId={projectId} data={data} open initialCreate={dialog === "create"} onClose={() => setDialog(null)} onRequested={requested} onRefresh={refreshMilestones} onOpenReview={showReview} />}
  </section>;
}

export function DeliveryReviewItem({projectId, review, onChanged}: {projectId: string; review: DeliveryReview; onChanged: () => void | Promise<void>}) {
  const {t, i18n} = useTranslation();
  const commentId = useId();
  const [comment, setComment] = useState("");
  const [needsComment, setNeedsComment] = useState(false);
  const mutation = useMutation({
    mutationFn: (state: "approved" | "changes_requested") => axios.post(`/projects/${encodeURIComponent(projectId)}/delivery-reviews/${encodeURIComponent(review.id)}/decision`, {version: review.version, state, comment: comment.trim()}),
    onSuccess: onChanged, onError: onChanged,
  });
  const decide = (state: "approved" | "changes_requested") => {
    if (!review.canDecide || review.stale || mutation.isPending) return;
    if (state === "changes_requested" && !comment.trim()) {setNeedsComment(true); return;}
    setNeedsComment(false); mutation.mutate(state);
  };
  const date = (value: string, dayOnly = false) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "—" : new Intl.DateTimeFormat(i18n.language, dayOnly ? {dateStyle: "medium", timeZone: "UTC"} : {dateStyle: "medium", timeStyle: "short"}).format(parsed);
  };
  const state = review.stale ? "stale" : review.state;
  const Icon = state === "approved" ? CheckCircle2 : state === "pending" ? Clock3 : state === "changes_requested" ? MessageSquareText : AlertCircle;
  const tone = state === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300" : state === "pending" ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300" : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300";
  const failure = (mutation.error as AxiosError<{code?: string}> | null)?.response?.data?.code;
  return <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
    <header className="flex flex-col items-stretch gap-3 border-b border-border/60 sm:flex-row sm:items-start sm:justify-between px-4 py-3"><div className="flex min-w-0 flex-1 items-start gap-3"><span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border ${tone}`}><Icon aria-hidden="true" className="size-4" /></span><div className="min-w-0"><h4 className="break-words text-sm font-semibold leading-6">{review.title}</h4><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{t("delivery.requestedOn")} <time dateTime={review.requestedAt}>{date(review.requestedAt)}</time></p></div></div><span className={`inline-flex shrink-0 self-start items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}><Icon aria-hidden="true" className="size-3" />{t(`delivery.${state}`)}</span></header>
    <div className="space-y-4 p-4">
      <div><p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("delivery.reviewBrief")}</p><p className="whitespace-pre-wrap break-words text-sm leading-6">{review.note}</p></div>
      {review.dueDate && <p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays aria-hidden="true" className="size-3.5" />{t("delivery.milestoneDue")} <time dateTime={review.dueDate}>{date(review.dueDate, true)}</time></p>}
      {review.decidedAt && <div className="space-y-2 rounded-lg border border-border bg-muted/25 p-3"><p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"><UserRound aria-hidden="true" className="size-3.5" /><span className="font-medium text-foreground">{review.decidedBy || t("delivery.projectClient")}</span><span aria-hidden="true">·</span><time dateTime={review.decidedAt}>{date(review.decidedAt)}</time></p>{review.comment && <blockquote className="border-s-2 border-[#1797ba] ps-3 text-sm leading-6 whitespace-pre-wrap break-words">{review.comment}</blockquote>}</div>}
      {review.stale && <p className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-sm leading-6 text-muted-foreground"><AlertCircle aria-hidden="true" className="mt-1 size-4 shrink-0" />{t("delivery.staleNote")}</p>}
      {review.canDecide && !review.stale && <div className="space-y-3 border-t border-border pt-4">
        <label htmlFor={commentId} className="block space-y-2 text-sm font-medium">{t("delivery.comment")}<textarea id={commentId} maxLength={2000} rows={3} disabled={mutation.isPending} className="w-full rounded-md border border-input bg-background p-3 text-sm font-normal leading-6 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary" value={comment} onChange={event => {setComment(event.target.value); if (event.target.value.trim()) setNeedsComment(false);}} placeholder={t("delivery.commentPlaceholder")} aria-invalid={needsComment} /></label>
        {needsComment && <p role="alert" className="text-sm text-destructive">{t("delivery.commentRequired")}</p>}
        <p className="text-xs leading-5 text-muted-foreground">{t("delivery.decisionNote")}</p>
        <div className="flex flex-wrap gap-2"><Button type="button" className="bg-[#11718c] text-white hover:bg-[#0e6078]" disabled={mutation.isPending} onClick={() => decide("approved")}><CheckCircle2 aria-hidden="true" className="size-4" />{t("delivery.approve")}</Button><Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => decide("changes_requested")}><MessageSquareText aria-hidden="true" className="size-4" />{t("delivery.changes")}</Button></div>
      </div>}
      {mutation.isError && <p role="alert" className="text-sm leading-6 text-destructive">{t(failure === "SOURCE_CHANGED" ? "delivery.sourceChanged" : failure === "ALREADY_DECIDED" ? "delivery.alreadyDecided" : "delivery.decisionError")}</p>}
    </div>
  </article>;
}
