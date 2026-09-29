import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { OnboardingCurrencySetup } from "./OnboardingCurrencySetup";

interface Props {
  organizationName?: string;
  member?: boolean;
  currencyStep?: boolean;
  currencyConfigured?: boolean;
  onStart: () => void;
  onDismiss: () => void;
}

export function OnboardingWelcomeModal({ organizationName, member, currencyStep = false, currencyConfigured = false, onStart, onDismiss }: Props) {
  const { t } = useTranslation();
  return <Dialog open onOpenChange={open => { if (!open) onStart(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
    <DialogHeader><DialogTitle>{t("coreOnboarding.title")}</DialogTitle><DialogDescription>{organizationName || t("coreOnboarding.start")}</DialogDescription></DialogHeader>
    <p className="text-sm text-muted-foreground">{t(member ? "coreOnboarding.memberDescription" : currencyStep ? "coreOnboarding.ownerDescription" : "coreOnboarding.managerDescription")}</p>
    {currencyStep && <>
      {!currencyConfigured && <p className="text-sm text-muted-foreground">{t("coreOnboarding.currencyDescription")}</p>}
      <OnboardingCurrencySetup configured={currencyConfigured} />
    </>}
    <p className="text-xs text-muted-foreground">{t("coreOnboarding.evidence")}</p>
    <div className="flex flex-wrap gap-2"><Button type="button" disabled={currencyStep && !currencyConfigured} onClick={onStart}>{t("coreOnboarding.start")}</Button><Button type="button" variant="ghost" onClick={onDismiss}>{t("coreOnboarding.dismiss")}</Button></div>
  </DialogContent></Dialog>;
}
