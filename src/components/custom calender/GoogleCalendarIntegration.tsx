import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendar";
import GoogleCalendarIcon from "/dashboard/google-calendar.svg";

const units: [Intl.RelativeTimeFormatUnit, number][] = [["day", 86400], ["hour", 3600], ["minute", 60]];
export function syncedAgo(iso: string, language: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const format = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
  for (const [unit, size] of units) if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  return format.format(0, "second");
}

export const GoogleCalendarIntegration: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [, tick] = useState(0);
  const {
    isConnected,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    syncNow,
    isConnecting,
    isDisconnecting,
    isSyncing,
    syncFailed,
    syncStatus,
  } = useGoogleCalendarIntegration();

  // Opening the calendar pulls the latest changes; the server keeps syncing after that.
  const requested = useRef(false);
  useEffect(() => {
    if (!isConnected || requested.current) return;
    requested.current = true;
    syncNow();
  }, [isConnected, syncNow]);

  // Keep "synced 3 minutes ago" current.
  useEffect(() => {
    const timer = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const statusLine = isSyncing
    ? t("calendar.google.syncing")
    : syncFailed
      ? t("calendar.google.failed")
      : syncStatus?.lastSyncedAt
        ? t("calendar.google.synced", { time: syncedAgo(syncStatus.lastSyncedAt, i18n.language) })
        : t("calendar.google.neverSynced");

  return (
    <Stack className="w-full p-3">
      <Flex className="items-center justify-between">
        <Flex className="items-center gap-2">
          <img src={GoogleCalendarIcon} alt="" className="size-4" />
          <span className="font-semibold">Google Calendar</span>
          {isConnected && <Box className="w-2 h-2 bg-green-500 rounded-full" aria-hidden />}
        </Flex>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label="Google Calendar"
          className="p-1 h-6 w-6 cursor-pointer"
        >
          {isExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </Button>
      </Flex>

      {isExpanded && (
        <Flex className="flex-col gap-2 items-stretch mt-3">
          {!isConnected ? (
            <Button
              onClick={connectGoogleCalendar}
              disabled={isConnecting}
              className="w-full bg-[#1797B9] hover:bg-[#1797B9]/80 text-white text-sm h-8"
            >
              {isConnecting && <RefreshCw className="size-3 animate-spin" />}
              {isConnecting ? t("calendar.google.connecting") : t("calendar.google.connect")}
            </Button>
          ) : (
            <>
              <p role="status" className={`text-xs ${syncFailed && !isSyncing ? "text-destructive" : "text-muted-foreground"}`}>
                {statusLine}
                {!isSyncing && !syncFailed && syncStatus?.lastSyncedAt && (
                  <span className="block">{syncStatus.live ? t("calendar.google.live") : t("calendar.google.periodic")}</span>
                )}
              </p>
              <Button
                onClick={syncNow}
                disabled={isSyncing}
                variant="outline"
                className="w-full text-sm h-8"
              >
                <RefreshCw className={`size-3 ${isSyncing ? "animate-spin" : ""}`} />
                {t("calendar.google.syncNow")}
              </Button>
              <Button
                onClick={disconnectGoogleCalendar}
                disabled={isDisconnecting}
                variant="ghost"
                className="w-full text-xs h-7 text-muted-foreground"
              >
                {isDisconnecting ? t("calendar.google.disconnecting") : t("calendar.google.disconnect")}
              </Button>
            </>
          )}
        </Flex>
      )}
    </Stack>
  );
};
