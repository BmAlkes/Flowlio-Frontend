import { useState } from "react";
import { addDays, format } from "date-fns";
import { Bell, X, CalendarDays, Check } from "lucide-react";
import { useSetFollowUp } from "@/hooks/useCRM";
import { useTranslation } from "react-i18next";

interface FollowUpPickerProps {
  clientId: string;
  onDismiss: () => void;
}

export const FollowUpPicker = ({ clientId, onDismiss }: FollowUpPickerProps) => {
  const { t } = useTranslation();
  const setFollowUp = useSetFollowUp();
  const [customDate, setCustomDate] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [note, setNote] = useState("");

  const QUICK_OPTIONS = [
    { label: t("pipeline.tomorrow"), days: 1 },
    { label: t("pipeline.in3Days"), days: 3 },
    { label: t("pipeline.in7Days"), days: 7 },
  ];

  const handleQuick = (days: number) => {
    const date = addDays(new Date(), days);
    setFollowUp.mutate(
      { clientId, followUpAt: date.toISOString(), followUpNote: note.trim() || null },
      { onSuccess: onDismiss }
    );
  };

  const handleCustom = () => {
    if (!customDate) return;
    setFollowUp.mutate(
      { clientId, followUpAt: new Date(customDate).toISOString(), followUpNote: note.trim() || null },
      { onSuccess: onDismiss }
    );
  };

  return (
    <div className="mt-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-900/15 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-indigo-200/60 dark:border-indigo-500/20">
        <div className="flex items-center gap-2">
          <Bell className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            {t("pipeline.followUpQuestion")}
          </span>
        </div>
        <button onClick={onDismiss} className="text-indigo-400 hover:text-indigo-600 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Note */}
      <div className="px-3 pt-3">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("pipeline.followUpNotePlaceholder")}
          maxLength={280}
          className="w-full h-9 px-3 rounded-lg border border-indigo-200 dark:border-indigo-500/40 bg-white dark:bg-gray-800 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Options */}
      <div className="p-3">
        {!showCustom ? (
          <div className="grid grid-cols-4 gap-2">
            {QUICK_OPTIONS.map(({ label, days }) => (
              <button
                key={days}
                onClick={() => handleQuick(days)}
                disabled={setFollowUp.isPending}
                className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 transition-all disabled:opacity-50"
              >
                <CalendarDays className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 text-center leading-tight">
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(addDays(new Date(), days), "d MMM")}
                </span>
              </button>
            ))}
            <button
              onClick={() => setShowCustom(true)}
              className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg bg-white dark:bg-gray-800 border border-dashed border-indigo-300 dark:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
            >
              <CalendarDays className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-500 text-center leading-tight">
                {t("pipeline.customDate")}
              </span>
              <span className="text-xs text-muted-foreground">{t("pipeline.freeDate")}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
              className="flex-1 h-9 px-3 rounded-lg border border-indigo-200 dark:border-indigo-500/40 bg-white dark:bg-gray-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleCustom}
              disabled={!customDate || setFollowUp.isPending}
              className="h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shrink-0"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors shrink-0"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
