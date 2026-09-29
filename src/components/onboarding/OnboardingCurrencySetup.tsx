import { CurrencySettings } from "@/components/settings/CurrencySettings";
import { useUser } from "@/providers/user.provider";
import { useTranslation } from "react-i18next";

export function OnboardingCurrencySetup({ configured }: { configured: boolean }) {
  const { data } = useUser();
  const { t } = useTranslation();
  if (data?.user?.role !== "user" || !data.user.isOrganizationOwner) return null;

  return configured ? (
    <p role="status" className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
      {t("coreOnboarding.currencyReady")}
    </p>
  ) : <CurrencySettings showReconciliation={false} />;
}
