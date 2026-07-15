import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { PartyPopper, Calendar, Clock, Sparkles, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface Props {
  onClose: () => void;
}

export function OnboardingCelebration({ onClose }: Props) {
  const { t } = useTranslation();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const end = Date.now() + 3000;

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#0c89af", "#06b6d4", "#34d399", "#f59e0b", "#ec4899"],
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#0c89af", "#06b6d4", "#34d399", "#f59e0b", "#ec4899"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-background rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0c89af] via-cyan-400 to-emerald-400" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="px-8 py-8 flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c89af]/10 to-cyan-50 dark:to-cyan-950/30">
            <PartyPopper className="size-10 text-[#0c89af]" />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-foreground leading-tight">
              {t("onboarding.celebrationTitle")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("onboarding.celebrationDesc")}
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 w-full">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-foreground font-medium">
              <Calendar className="size-3.5 text-[#0c89af]" />
              {t("onboarding.celebrationHintCalendar")}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-foreground font-medium">
              <Clock className="size-3.5 text-[#0c89af]" />
              {t("onboarding.celebrationHintTime")}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-foreground font-medium">
              <Sparkles className="size-3.5 text-[#0c89af]" />
              {t("onboarding.celebrationHintAI")}
            </div>
          </div>

          {/* CTA */}
          <Button onClick={onClose} className="w-full bg-[#0c89af] hover:bg-[#0a7a9e] text-white">
            {t("onboarding.celebrationCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
