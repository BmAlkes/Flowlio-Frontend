import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient, useUser } from "@/providers/user.provider";
import { useSubscriptionStatus } from "@/hooks/usesubscription";

/** Subscription status of the signed-in organization member; other roles have no organization subscription. */
function useOrganizationSubscription() {
  const { data } = useUser();
  const user = data?.user;
  const inOrganization = user?.role === "user" && !!(user.organizationId || user.organization?.id);
  const query = useSubscriptionStatus({ enabled: inOrganization });
  return { user, status: inOrganization ? query.data?.data : undefined };
}

/** Owners can subscribe from here; checkout opens with the trial's plan. */
function useSubscribe(planId?: string) {
  const navigate = useNavigate();
  return () => navigate("/checkout", { state: { selectedPlanId: planId } });
}

/** A slim reminder above the page while a free trial runs. Only owners see it, since only they can subscribe. */
export function TrialBanner() {
  const { t } = useTranslation();
  const { user, status } = useOrganizationSubscription();
  const subscribe = useSubscribe(status?.plan?.id);
  if (!status?.isTrial || !user?.isOrganizationOwner) return null;
  const days = status.trialDaysRemaining ?? 0;
  return (
    <div role="status" className="mx-4 mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-[#1797B9]/30 bg-[#1797B9]/5 px-4 py-2.5 text-sm">
      <Clock className="size-4 shrink-0 text-[#11718c] dark:text-[#55bdd9]" aria-hidden="true" />
      <span className="flex-1">{days > 0 ? t("conversion.trial.banner", { count: days }) : t("conversion.trial.bannerToday")}</span>
      <Button size="sm" className="bg-[#1797B9] text-white hover:bg-[#1797B9]/90" onClick={subscribe}>
        {t("conversion.trial.subscribe")}
      </Button>
    </div>
  );
}

/** Covers the app once a free trial has ended: the owner picks a plan, members are told to ask the owner. */
export function TrialEndedGate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, status } = useOrganizationSubscription();
  const subscribe = useSubscribe(status?.plan?.id);
  if (status?.status !== "trial_expired") return null;
  const owner = !!user?.isOrganizationOwner;
  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await authClient.signOut().catch(() => undefined);
    navigate("/auth/signin", { replace: true });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="trial-ended-title">
      <div className="w-full max-w-md space-y-4 rounded-2xl border bg-card p-6 text-center shadow-lg">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#1797B9]/10 text-[#11718c] dark:text-[#55bdd9]" aria-hidden="true">
          <Sparkles className="size-6" />
        </span>
        <h2 id="trial-ended-title" className="text-xl font-semibold">{t("conversion.trial.endedTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t(owner ? "conversion.trial.endedOwner" : "conversion.trial.endedMember")}</p>
        <div className="flex flex-col gap-2">
          {owner && (
            <Button autoFocus className="bg-[#1797B9] text-white hover:bg-[#1797B9]/90" onClick={subscribe}>
              {t("conversion.trial.choosePlan")}
            </Button>
          )}
          <Button variant="ghost" onClick={signOut}>{t("conversion.trial.signOut")}</Button>
        </div>
      </div>
    </div>
  );
}
