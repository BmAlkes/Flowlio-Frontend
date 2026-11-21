import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";
import { Button } from "@/components/ui/button";

type PrivacyRequest = {
  id: string;
  type: "export" | "deletion";
  status: "pending" | "completed" | "rejected";
  requested_at: string;
  completed_at: string | null;
  email: string | null;
  organization_name: string | null;
};
const KEY = ["superadmin-privacy-requests"];

/** LGPD data subject requests that need a person: organization owners asking to delete their account. */
export function PrivacyRequestsAdmin() {
  const { t, i18n } = useTranslation();
  const cache = useQueryClient();
  const requests = useQuery({
    queryKey: KEY,
    queryFn: async () => (await axios.get<{ data: PrivacyRequest[] }>("/superadmin/privacy-requests")).data.data,
    retry: false,
  });
  const complete = useMutation({
    mutationFn: async (id: string) => axios.post(`/superadmin/privacy-requests/${id}/complete`),
    onSuccess: () => {
      toast.success(t("privacy.admin.completedToast"));
      void cache.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error(t("privacy.admin.failed")),
  });
  if (requests.isError) return null; // Sub admins have no access.

  const pending = (requests.data ?? []).filter((request) => request.status === "pending");
  const date = (value: string) => new Date(value).toLocaleDateString(i18n.language);
  const deadline = (value: string) => new Date(new Date(value).getTime() + 15 * 86400000).toLocaleDateString(i18n.language);

  return (
    <section className="my-4 rounded-xl border bg-card p-5 space-y-4" aria-labelledby="privacy-requests-title">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400" aria-hidden="true">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h2 id="privacy-requests-title" className="font-semibold">{t("privacy.admin.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{t("privacy.admin.description")}</p>
        </div>
      </div>
      {requests.isLoading ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("privacy.admin.empty")}</p>
      ) : (
        <ul className="divide-y divide-border border border-border rounded-lg">
          {pending.map((request) => (
            <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="text-sm">
                <p className="font-medium">{request.email ?? "-"} {request.organization_name ? `· ${request.organization_name}` : ""}</p>
                <p className="text-muted-foreground">
                  {t(`privacy.admin.${request.type}`)} · {t("privacy.admin.requested", { date: date(request.requested_at) })} · {t("privacy.admin.deadline", { date: deadline(request.requested_at) })}
                </p>
              </div>
              <Button size="sm" variant="outline" disabled={complete.isPending} onClick={() => complete.mutate(request.id)}>
                {complete.isPending && complete.variables === request.id && <Loader2 className="size-3.5 me-2 animate-spin" />}
                {t("privacy.admin.complete")}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">{t("privacy.admin.hint")}</p>
    </section>
  );
}
