import { useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";
import { Button } from "@/components/ui/button";

export type DeliveryReview = {
  id: string; milestoneId: string | null; title: string; note: string; version: string;
  state: "pending" | "approved" | "changes_requested"; requestedAt: string;
  decidedAt: string | null; decidedBy: string | null; comment: string | null;
  stale: boolean; canDecide: boolean;
};
type ReviewList = {
  reviews: DeliveryReview[]; page: number; hasMore: boolean; canRequest: boolean;
  hasClient: boolean; milestonesTruncated: boolean;
  milestones: { id: string; title: string; version: string }[];
};
const areaClass = "w-full rounded-md border border-border bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-[#1797ba]";

export function DeliveryReviews({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const scope = useDataScope();
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [milestoneId, setMilestoneId] = useState("");
  const [note, setNote] = useState("");
  const path = `/projects/${encodeURIComponent(projectId)}/delivery-reviews`;
  const [search] = useSearchParams(); const reviewId = search.get("reviewId") || undefined;
  const query = useQuery({ queryKey: ["delivery-reviews", scope, projectId, page, reviewId], queryFn: async () => (await axios.get<{ data: ReviewList }>(path, { params: { page, reviewId } })).data.data });
  const refresh = () => { void client.invalidateQueries({ queryKey: ["delivery-reviews"] }); };
  const request = useMutation({
    mutationFn: () => axios.post(path, { milestoneId, version: query.data?.milestones.find(row => row.id === milestoneId)?.version, note }),
    onSuccess: () => { setNote(""); setPage(1); refresh(); },
    onError: refresh,
  });
  return <section id="delivery-reviews" className="space-y-4 rounded-xl border border-border bg-card p-5 text-foreground" aria-labelledby="delivery-reviews-title">
    <header className="flex flex-wrap items-center justify-between gap-3"><h2 id="delivery-reviews-title" className="text-lg font-medium">{t("delivery.title")}</h2><Button variant="ghost" size="sm" disabled={query.isFetching} onClick={refresh}>{t("operations.refresh")}</Button></header>
    <p className="text-sm text-muted-foreground">{t("delivery.description")}</p>
    {query.isPending ? <p role="status" className="text-sm">{t("common.loading")}</p> : query.isError ? <p role="alert" className="text-sm">{t("delivery.error")}</p> : query.data && <>
      {query.data.canRequest && <details className="rounded-md border border-border p-3"><summary className="cursor-pointer text-sm font-medium">{t("delivery.request")}</summary>
        {!query.data.hasClient ? <p className="mt-3 text-sm">{t("delivery.noClient")}</p> : !query.data.milestones.length ? <p className="mt-3 text-sm">{t("delivery.noMilestones")}</p> : <form className="mt-4 space-y-3" onSubmit={event => { event.preventDefault(); if (!request.isPending) request.mutate(); }}>
          <fieldset disabled={request.isPending} className="space-y-3">
            <label className="block text-sm">{t("delivery.milestone")}<select required className={areaClass} value={milestoneId} onChange={event => setMilestoneId(event.target.value)}><option value="">{t("delivery.select")}</option>{query.data.milestones.map(row => <option key={row.id} value={row.id}>{row.title}</option>)}</select></label>
            <label className="block text-sm">{t("delivery.note")}<textarea required maxLength={4000} rows={3} className={areaClass} value={note} onChange={event => setNote(event.target.value)} /></label>
            <p className="text-xs text-muted-foreground">{t("delivery.requestNote")}</p>
            {query.data.milestonesTruncated && <p className="text-xs">{t("delivery.milestoneLimit")}</p>}
            <Button type="submit">{t("delivery.request")}</Button>
          </fieldset>
          {request.isError && <p role="alert" className="text-sm">{t("delivery.requestError")}</p>}
          {request.isSuccess && <p role="status" className="text-sm">{t("delivery.requested")}</p>}
        </form>}
      </details>}
      {query.data.reviews.length === 0 ? <p className="py-5 text-sm text-muted-foreground">{t("delivery.empty")}</p> : <ul className="divide-y divide-border">{query.data.reviews.map(review => <li key={review.id} className="py-4"><DeliveryReviewItem projectId={projectId} review={review} onChanged={refresh} /></li>)}</ul>}
      <nav className="flex items-center justify-between gap-3 text-sm" aria-label={t("delivery.history")}><Button variant="outline" disabled={page <= 1 || query.isFetching} onClick={() => setPage(value => value - 1)}>{t("delivery.previous")}</Button><span>{t("delivery.page", { page })}</span><Button variant="outline" disabled={!query.data.hasMore || query.isFetching} onClick={() => setPage(value => value + 1)}>{t("delivery.next")}</Button></nav>
    </>}
  </section>;
}

export function DeliveryReviewItem({ projectId, review, onChanged }: { projectId: string; review: DeliveryReview; onChanged: () => void }) {
  const { t, i18n } = useTranslation();
  const [comment, setComment] = useState("");
  const [needsComment, setNeedsComment] = useState(false);
  const mutation = useMutation({
    mutationFn: (state: "approved" | "changes_requested") => axios.post(`/projects/${encodeURIComponent(projectId)}/delivery-reviews/${encodeURIComponent(review.id)}/decision`, { version: review.version, state, comment: comment.trim() }),
    onSuccess: onChanged, onError: onChanged,
  });
  const date = (value: string) => new Intl.DateTimeFormat(i18n.language, { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  return <article className="space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-sm font-medium">{review.title}</h3><span className="rounded-md border border-border px-2 py-1 text-xs">{t(`delivery.${review.stale ? "stale" : review.state}`)}</span></div>
    <p className="whitespace-pre-wrap break-words text-sm">{review.note}</p>
    <p className="text-xs text-muted-foreground"><time dateTime={review.requestedAt}>{date(review.requestedAt)}</time> · {t("delivery.version")} <span dir="ltr">{review.version.slice(0, 10)}</span></p>
    {review.comment && <blockquote className="border-s-2 border-[#1797ba] ps-3 text-sm whitespace-pre-wrap break-words">{review.comment}</blockquote>}
    {review.decidedAt && <p className="text-xs text-muted-foreground">{review.decidedBy} · <time dateTime={review.decidedAt}>{date(review.decidedAt)}</time></p>}
    {review.stale && <p className="text-sm text-muted-foreground">{t("delivery.staleNote")}</p>}
    {review.canDecide && !review.stale && <form className="space-y-3" onSubmit={event => {
      event.preventDefault();
      const state = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
      if (state !== "approved" && state !== "changes_requested") return;
      if (state === "changes_requested" && !comment.trim()) { setNeedsComment(true); return; }
      setNeedsComment(false); if (!mutation.isPending) mutation.mutate(state);
    }}>
      <label className="block text-sm">{t("delivery.comment")}<textarea maxLength={2000} rows={2} disabled={mutation.isPending} className={areaClass} value={comment} onChange={event => setComment(event.target.value)} /></label>
      {needsComment && <p role="alert" className="text-sm">{t("delivery.commentRequired")}</p>}
      <p className="text-xs text-muted-foreground">{t("delivery.decisionNote")}</p>
      <div className="flex flex-wrap gap-2"><Button type="submit" value="approved" disabled={mutation.isPending} className="bg-[#11718c] text-white hover:bg-[#11718c]/90">{t("delivery.approve")}</Button><Button type="submit" value="changes_requested" variant="outline" disabled={mutation.isPending}>{t("delivery.changes")}</Button></div>
    </form>}
    {mutation.isError && <p role="alert" className="text-sm">{t("delivery.decisionError")}</p>}
  </article>;
}
