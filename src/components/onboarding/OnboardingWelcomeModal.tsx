import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface Props {
  organizationName?: string;
  member?: boolean;
  onStart: () => void;
  onDismiss: () => void;
}

export function OnboardingWelcomeModal({ organizationName, member, onStart, onDismiss }: Props) {
  const { t } = useTranslation();
  return <Dialog open onOpenChange={open => { if (!open) onStart(); }}><DialogContent className="max-w-md">
    <DialogHeader><DialogTitle>{t("coreOnboarding.title")}</DialogTitle><DialogDescription>{organizationName || t("coreOnboarding.start")}</DialogDescription></DialogHeader>
    <p className="text-sm text-muted-foreground">{t(member ? "coreOnboarding.memberDescription" : "coreOnboarding.ownerDescription")}</p>
    <p className="text-xs text-muted-foreground">{t("coreOnboarding.evidence")}</p>
    <div className="flex flex-wrap gap-2"><Button onClick={onStart}>{t("coreOnboarding.start")}</Button><Button variant="ghost" onClick={onDismiss}>{t("coreOnboarding.dismiss")}</Button></div>
  </DialogContent></Dialog>;
}
