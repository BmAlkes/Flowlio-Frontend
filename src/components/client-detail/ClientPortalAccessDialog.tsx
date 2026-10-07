import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { axios, type ErrorWithMessage } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = { clientId: string; email: string; onClose: () => void; onManage: () => void };
type Status = { state: "not_invited" | "active" | "queued" | "pending" | "expired" | "failed" | "uncertain"; expiresAt: string | null };
export function ClientPortalAccessDialog(props: Props) {
  const scope = useDataScope();
  return <PortalDialog key={`${scope}:${props.clientId}`} {...props} scope={scope} />;
}
function PortalDialog({ clientId, email, onClose, onManage, scope }: Props & { scope: string }) {
  const { t, i18n } = useTranslation();
  const cache = useQueryClient();
  const [key, setKey] = useState(() => crypto.randomUUID());
  const queryKey = ["portal-invitation", scope, clientId];
  const endpoint = `/portal-invitations/${encodeURIComponent(clientId)}`;
  const status = useQuery({ queryKey, queryFn: async ({ signal }) => (await axios.get<{ data: Status }>(endpoint, { signal })).data.data, refetchInterval: 5000 });
  const action = useMutation({
    mutationFn: async (kind: "issue" | "revoke") => {
      const language = i18n.language.split("-")[0];
      return kind === "revoke" ? axios.delete(endpoint) : axios.post(endpoint, { key, language: ["pt", "en", "es", "he"].includes(language) ? language : "en" });
    },
    onSuccess: async () => { setKey(crypto.randomUUID()); await cache.invalidateQueries({ queryKey }); },
  });
  const state = status.data?.state;
  const code = (action.error as ErrorWithMessage | null)?.response?.data.code;
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent><DialogHeader>
    <DialogTitle>{t("portalInvite.title")}</DialogTitle><DialogDescription>{t("portalInvite.hint", { email })}</DialogDescription>
  </DialogHeader>
    {status.isPending && <p role="status">{t("common.loading")}</p>}
    {status.isError && <div role="alert"><p>{t("portalInvite.error")}</p><Button variant="outline" onClick={() => status.refetch()}>{t("portalInvite.retry")}</Button></div>}
    {state && <div className="space-y-4">
      <p role="status">{t(`portalInvite.states.${state}`)}</p>
      {status.data?.expiresAt && <p className="text-sm text-muted-foreground">{t("portalInvite.expires", { date: new Date(status.data.expiresAt).toLocaleString(i18n.language) })}</p>}
      {state === "active" ? <Button onClick={onManage}>{t("portalInvite.manage")}</Button> : <div className="flex flex-wrap gap-2">
        <Button disabled={action.isPending || state === "queued" || status.isError} onClick={() => action.mutate("issue")}>{t(`portalInvite.${state === "not_invited" ? "send" : "resend"}`)}</Button>
        {state !== "not_invited" && <Button variant="outline" disabled={action.isPending} onClick={() => action.mutate("revoke")}>{t("portalInvite.revoke")}</Button>}
      </div>}
    </div>}
    {action.isError && <p role="alert" className="text-sm text-destructive">{t(`portalInvite.${code === "INVITATION_COOLDOWN" ? "cooldown" : code === "PORTAL_ALREADY_ACTIVE" ? "alreadyActive" : "error"}`)}</p>}
  </DialogContent></Dialog>;
}
