import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Download, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GeneralModal } from "@/components/common/generalmodal";
import { OPEN_COOKIE_PREFERENCES_EVENT } from "@/components/common/CookieConsentBanner";
import { useUser } from "@/providers/user.provider";

type DeleteResult = { status: "completed" | "pending" };

function errorCode(error: unknown) {
  return (error as { response?: { data?: { code?: string } } })?.response?.data?.code;
}

/** LGPD art. 18: lets every signed-in user download their data and delete their account. */
export function PrivacySettings() {
  const { t } = useTranslation();
  const { data: user } = useUser();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const isOwner = Boolean((user?.user as { isOrganizationOwner?: boolean } | undefined)?.isOrganizationOwner);

  const download = (blob: Blob, name: string) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(t("privacy.exportReady"));
  };
  const exportData = useMutation({
    mutationFn: async () => (await axios.get("/user/privacy/export", { responseType: "blob" })).data as Blob,
    onSuccess: (blob) => download(blob, "flowlio-meus-dados"),
    onError: () => toast.error(t("privacy.exportFailed")),
  });
  const exportOrganization = useMutation({
    mutationFn: async () => (await axios.get("/organizations/export", { responseType: "blob" })).data as Blob,
    onSuccess: (blob) => download(blob, "flowlio-organizacao"),
    onError: () => toast.error(t("privacy.exportFailed")),
  });

  const deleteAccount = useMutation({
    mutationFn: async () => (await axios.post<DeleteResult>("/user/privacy/delete-account", { password, confirm: true })).data,
    onSuccess: (result) => {
      setOpen(false);
      if (result.status === "pending") {
        toast.success(t("privacy.deletePending"));
        return;
      }
      toast.success(t("privacy.deleteDone"));
      // The session is already revoked on the server; a full reload clears every cached state.
      window.setTimeout(() => window.location.assign("/"), 1500);
    },
  });

  const closeDialog = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setPassword("");
      setConfirmed(false);
      deleteAccount.reset();
    }
  };

  const deleteError = deleteAccount.isError
    ? errorCode(deleteAccount.error) === "INVALID_PASSWORD" ? t("privacy.wrongPassword") : t("privacy.deleteFailed")
    : null;

  return (
    <section className="my-4 rounded-xl border bg-card p-5 space-y-4" aria-labelledby="privacy-settings-title">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400" aria-hidden="true">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h2 id="privacy-settings-title" className="font-semibold">{t("privacy.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{t("privacy.description")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={exportData.isPending} onClick={() => exportData.mutate()}>
          {exportData.isPending ? <Loader2 className="size-3.5 me-2 animate-spin" /> : <Download className="size-3.5 me-2" />}
          {t("privacy.export")}
        </Button>
        {isOwner && (
          <Button variant="outline" size="sm" disabled={exportOrganization.isPending} onClick={() => exportOrganization.mutate()} title={t("privacy.exportOrganizationHint")}>
            {exportOrganization.isPending ? <Loader2 className="size-3.5 me-2 animate-spin" /> : <Download className="size-3.5 me-2" />}
            {t("privacy.exportOrganization")}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT))}>
          {t("privacy.cookies")}
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="/privacy-policy" target="_blank" rel="noreferrer">{t("privacy.policy")}</a>
        </Button>
        <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700" onClick={() => setOpen(true)}>
          <Trash2 className="size-3.5 me-2" />
          {t("privacy.delete")}
        </Button>
      </div>

      <GeneralModal open={open} onOpenChange={closeDialog}>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("privacy.deleteTitle")}</h2>
          <p className="text-sm text-muted-foreground">{isOwner ? t("privacy.deleteOwnerWarning") : t("privacy.deleteWarning")}</p>
          <p className="text-sm text-muted-foreground">{t("privacy.deleteExportHint")}</p>
          <div className="space-y-1.5">
            <label htmlFor="privacy-delete-password" className="text-sm font-medium">{t("privacy.password")}</label>
            <Input
              id="privacy-delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <Checkbox checked={confirmed} onCheckedChange={(checked) => setConfirmed(checked === true)} className="mt-0.5" />
            <span>{t("privacy.confirm")}</span>
          </label>
          {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => closeDialog(false)}>{t("privacy.cancel")}</Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={!confirmed || deleteAccount.isPending}
              onClick={() => deleteAccount.mutate()}
            >
              {deleteAccount.isPending && <Loader2 className="size-3.5 me-2 animate-spin" />}
              {isOwner ? t("privacy.requestDeletion") : t("privacy.deleteForever")}
            </Button>
          </div>
        </div>
      </GeneralModal>
    </section>
  );
}
