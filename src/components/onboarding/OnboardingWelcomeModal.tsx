import { X, Sparkles, Users, FolderKanban, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Props {
  organizationName?: string;
  onStart: () => void;
  onDismiss: () => void;
}

const FLOW_STEPS = [
  { icon: Users, labelKey: "onboarding.flowClients" },
  { icon: FolderKanban, labelKey: "onboarding.flowProjects" },
  { icon: FileText, labelKey: "onboarding.flowProposals" },
];

export function OnboardingWelcomeModal({ organizationName, onStart, onDismiss }: Props) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">

        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0c89af] via-cyan-400 to-[#0c89af]" />

        {/* Close */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="p-8">
          {/* Icon + title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-4 rounded-2xl bg-[#0c89af]/10 border border-[#0c89af]/20 mb-4">
              <Sparkles className="size-8 text-[#0c89af]" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {t("onboarding.welcomeTitle")}
              {organizationName ? ` ${organizationName}` : ""}!
            </h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-sm">
              {t("onboarding.welcomeDesc")}
            </p>
          </div>

          {/* Workflow visual */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {FLOW_STEPS.map(({ icon: Icon, labelKey }, i) => (
              <div key={labelKey} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="p-2.5 rounded-xl bg-[#0c89af]/10 border border-[#0c89af]/20">
                    <Icon className="size-5 text-[#0c89af]" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{t(labelKey)}</span>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <ArrowRight className="size-4 text-muted-foreground shrink-0 mb-4" />
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={onStart}
              className="w-full bg-[#0c89af] hover:bg-[#0a7a9e] text-white rounded-xl h-11 gap-2 font-semibold"
            >
              {t("onboarding.startTour")}
              <ArrowRight className="size-4" />
            </Button>
            <button
              onClick={onDismiss}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {t("onboarding.skipOnboarding")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
