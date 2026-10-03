import {useId, useState} from "react";
import {Link} from "react-router";
import {useMutation} from "@tanstack/react-query";
import type {AxiosError} from "axios";
import {useTranslation} from "react-i18next";
import {AlertCircle, ArrowRight, CheckCircle2, Flag, Pencil, Plus, Send, UserRound} from "lucide-react";
import {axios} from "@/configs/axios.config";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {DeliveryMilestoneForm} from "./DeliveryMilestoneForm";
import type {DeliveryMilestone, ReviewList} from "./deliveryReviewTypes";

export function DeliveryRequestDialog({projectId, data, open, initialCreate = false, onClose, onRequested, onRefresh, onOpenReview}: {
  projectId: string; data: ReviewList; open: boolean; initialCreate?: boolean;
  onClose: () => void; onRequested: (id: string, existing: boolean) => Promise<void>;
  onRefresh: () => Promise<ReviewList | undefined>; onOpenReview: (id: string) => void;
}) {
  const {t} = useTranslation();
  const id = useId();
  const [selected, setSelected] = useState<DeliveryMilestone | null>(null);
  const [note, setNote] = useState("");
  const [completeMilestone, setCompleteMilestone] = useState(true);
  const [recipient] = useState(data.client);
  const [milestoneSaving, setMilestoneSaving] = useState(false);
  const [editor, setEditor] = useState<DeliveryMilestone | "create" | null>(initialCreate || !data.milestones.length ? "create" : null);
  const current = data.milestones.find(row => row.id === selected?.id);
  const changed = !!selected && (!current || current.version !== selected.version);
  const clientChanged = recipient?.id !== data.client?.id;
  const existing = current?.currentReview;
  const blocked = !data.hasClient ? "CLIENT_REQUIRED" : data.requestBlockReason ?? null;
  const request = useMutation({
    mutationFn: async () => {
      if (!selected || changed || clientChanged || blocked || existing || !note.trim()) throw new Error("Review is not ready");
      return (await axios.post(`/projects/${encodeURIComponent(projectId)}/delivery-reviews`, {milestoneId: selected.id, version: selected.version, clientId: recipient?.id, note: note.trim(), completeMilestone})).data.data as {id: string; existing: boolean};
    },
    onSuccess: async result => {await onRequested(result.id, result.existing); setNote(""); onClose();},
    onError: async () => {await onRefresh();},
  });
  const code = (request.error as AxiosError<{code?: string}> | null)?.response?.data?.code;
  const errors: Record<string, string> = {CLIENT_REQUIRED: "noClient", CLIENT_PORTAL_REQUIRED: "portalRequired", CLIENT_CHANGED: "clientChanged", SOURCE_CHANGED: "sourceChanged", MILESTONE_NOT_FOUND: "sourceChanged", REVIEW_ALREADY_EXISTS: "alreadyRequested", FORBIDDEN: "requestForbidden"};
  const close = () => {if (!request.isPending && !milestoneSaving) onClose();};
  const savedMilestone = async (milestoneId: string) => {
    const fresh = await onRefresh();
    setSelected(fresh?.milestones.find(row => row.id === milestoneId) ?? null);
    setEditor(null); request.reset();
  };
  return <Dialog open={open} onOpenChange={next => {if (!next) close();}}><DialogContent className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-xl">
    <DialogHeader className="border-b border-border bg-sky-50/50 p-5 pe-12 text-start dark:bg-primary/5">
      <span className="mb-1 flex size-10 items-center justify-center rounded-xl border border-sky-100 bg-white text-[#11718c] dark:border-primary/20 dark:bg-background dark:text-sky-300"><Flag aria-hidden="true" className="size-5" /></span>
      <DialogTitle className="leading-7">{t(editor ? editor === "create" ? "delivery.createMilestone" : "delivery.editMilestone" : "delivery.request")}</DialogTitle>
      <DialogDescription className="leading-6">{t(editor ? "delivery.milestoneDialogDescription" : "delivery.requestDialogDescription")}</DialogDescription>
    </DialogHeader>
    <div className="min-w-0 p-5">
      {editor ? <DeliveryMilestoneForm key={editor === "create" ? "create" : editor.id + editor.version} projectId={projectId} milestone={editor === "create" ? undefined : editor} onSaved={savedMilestone} onPendingChange={setMilestoneSaving} onCancel={() => data.milestones.length ? setEditor(null) : close()} /> : <form className="space-y-5" onSubmit={event => {event.preventDefault(); if (!request.isPending && selected && !changed && !clientChanged && !blocked && !existing && note.trim()) request.mutate();}}>
        {blocked ? <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="flex items-start gap-2 leading-6"><AlertCircle aria-hidden="true" className="mt-1 size-4 shrink-0" />{t(blocked === "CLIENT_REQUIRED" ? "delivery.noClient" : "delivery.portalRequired")}</p>
          <Button type="button" variant="outline" size="sm" asChild><Link to={blocked === "CLIENT_REQUIRED" ? `/dashboard/project/edit/${encodeURIComponent(projectId)}` : `/dashboard/client-management/${encodeURIComponent(data.client?.id ?? "")}`}>{t(blocked === "CLIENT_REQUIRED" ? "delivery.linkClient" : "delivery.manageClient")}<ArrowRight aria-hidden="true" className="size-3.5 rtl:rotate-180" /></Link></Button>
        </div> : <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"><UserRound aria-hidden="true" className="mt-1 size-4 text-[#11718c] dark:text-sky-300" /><div className="min-w-0"><p className="text-xs text-muted-foreground">{t("delivery.recipient")}</p><p className="mt-1 break-words text-sm font-medium">{recipient?.name ?? t("delivery.projectClient")}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{t("delivery.portalDeliveryHint")}</p></div></div>}
        {clientChanged && <p role="alert" className="text-sm leading-6 text-destructive">{t("delivery.clientChanged")}</p>}
        <fieldset disabled={request.isPending} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={`${id}-milestone`} className="text-sm font-medium">{t("delivery.milestone")}</label>
            <select id={`${id}-milestone`} required className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary" value={selected?.id ?? ""} onChange={event => {setSelected(data.milestones.find(row => row.id === event.target.value) ?? null); request.reset();}}>
              <option value="">{t("delivery.select")}</option>{data.milestones.map(row => <option key={row.id} value={row.id}>{row.title}{row.currentReview ? ` · ${t(`delivery.${row.currentReview.state}`)}` : ""}</option>)}
            </select>
            <div className="flex flex-wrap gap-1"><Button type="button" size="sm" variant="ghost" onClick={() => setEditor("create")}><Plus aria-hidden="true" className="size-3.5" />{t("delivery.createMilestone")}</Button>{current && <Button type="button" size="sm" variant="ghost" onClick={() => setEditor(current)}><Pencil aria-hidden="true" className="size-3.5" />{t("delivery.editMilestone")}</Button>}</div>
            {data.milestonesTruncated && <p className="text-xs text-muted-foreground">{t("delivery.milestoneLimit")}</p>}
          </div>
          {changed && <div role="alert" className="space-y-2 rounded-lg border border-amber-200 p-3 text-sm"><p>{t("delivery.sourceChanged")}</p>{current && <Button type="button" size="sm" variant="outline" onClick={() => {setSelected(current); request.reset();}}>{t("delivery.useCurrentMilestone")}</Button>}</div>}
          {existing && !changed && <div className="space-y-2 rounded-lg border border-sky-200 bg-sky-50/40 p-3 text-sm dark:border-primary/30 dark:bg-primary/5"><p className="flex items-start gap-2 leading-6"><CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#11718c] dark:text-sky-300" />{t("delivery.alreadyRequested")}</p><Button type="button" size="sm" variant="outline" onClick={() => {onOpenReview(existing.id); onClose();}}>{t("delivery.openExistingReview")}</Button></div>}
          <label htmlFor={`${id}-note`} className="block space-y-2 text-sm font-medium">{t("delivery.note")}<textarea id={`${id}-note`} required maxLength={4000} rows={4} value={note} onChange={event => setNote(event.target.value)} placeholder={t("delivery.notePlaceholder")} className="w-full rounded-md border border-input bg-background p-3 text-sm font-normal leading-6 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary" /></label>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={completeMilestone} onChange={e => setCompleteMilestone(e.target.checked)} />{t("pending.completeDelivery")}</label><p className="text-xs leading-5 text-muted-foreground">{t("delivery.requestNote")}</p>
          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="outline" onClick={close}>{t("delivery.cancel")}</Button><Button type="submit" className="bg-[#11718c] text-white hover:bg-[#0e6078]" disabled={!selected || changed || clientChanged || !!blocked || !!existing || !note.trim() || request.isPending} isLoading={request.isPending}><Send aria-hidden="true" className="size-4" />{t("delivery.sendRequest")}</Button></div>
        </fieldset>
        {request.isError && <p role="alert" className="text-sm leading-6 text-destructive">{t(`delivery.${code && errors[code] ? errors[code] : "requestError"}`)}</p>}
      </form>}
    </div>
  </DialogContent></Dialog>;
}
