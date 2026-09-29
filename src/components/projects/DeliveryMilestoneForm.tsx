import {useEffect, useId, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import type {AxiosError} from "axios";
import {useTranslation} from "react-i18next";
import {Flag, Save} from "lucide-react";
import {axios} from "@/configs/axios.config";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import type {DeliveryMilestone} from "./deliveryReviewTypes";

export function DeliveryMilestoneForm({projectId, milestone, onSaved, onCancel, onPendingChange}: {
  projectId: string; milestone?: DeliveryMilestone;
  onSaved: (id: string) => Promise<void>; onCancel: () => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const {t} = useTranslation();
  const id = useId();
  const [title, setTitle] = useState(milestone?.title ?? "");
  const [dueDate, setDueDate] = useState(milestone?.dueDate?.slice(0, 10) ?? "");
  const save = useMutation({
    mutationFn: async () => {
      const path = `/projects/${encodeURIComponent(projectId)}/milestones`;
      const data = {title: title.trim(), dueDate: dueDate || null};
      const response = milestone
        ? await axios.patch(`${path}/${encodeURIComponent(milestone.id)}`, {...data, version: milestone.version})
        : await axios.post(path, data);
      return response.data.data.id as string;
    },
    onSuccess: onSaved,
  });
  const code = (save.error as AxiosError<{code?: string}> | null)?.response?.data?.code;
  useEffect(() => {onPendingChange(save.isPending); return () => onPendingChange(false);}, [save.isPending, onPendingChange]);
  return <form className="space-y-5" onSubmit={event => {event.preventDefault(); if (title.trim() && !save.isPending) save.mutate();}}>
    <div className="flex items-start gap-3 rounded-lg border border-sky-100 bg-sky-50/60 p-4 dark:border-primary/20 dark:bg-primary/5">
      <Flag aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#11718c] dark:text-sky-300" />
      <p className="text-sm leading-6 text-muted-foreground">{t(milestone ? "delivery.editMilestoneHint" : "delivery.createMilestoneHint")}</p>
    </div>
    <fieldset disabled={save.isPending} className="space-y-4">
      <label htmlFor={`${id}-title`} className="block space-y-2 text-sm font-medium">{t("delivery.milestoneTitle")}<Input id={`${id}-title`} autoFocus required maxLength={255} value={title} onChange={event => setTitle(event.target.value)} placeholder={t("delivery.milestonePlaceholder")} /></label>
      <label htmlFor={`${id}-due`} className="block space-y-2 text-sm font-medium">{t("delivery.dueDateOptional")}<Input id={`${id}-due`} type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} /></label>
      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>{t("delivery.cancel")}</Button>
        <Button type="submit" className="bg-[#11718c] text-white hover:bg-[#0e6078]" disabled={!title.trim()} isLoading={save.isPending}><Save aria-hidden="true" className="size-4" />{t(milestone ? "delivery.saveMilestone" : "delivery.createMilestone")}</Button>
      </div>
    </fieldset>
    {save.isError && <p role="alert" className="text-sm leading-6 text-destructive">{t(code === "SOURCE_CHANGED" ? "delivery.milestoneChanged" : "delivery.milestoneSaveError")}</p>}
  </form>;
}
