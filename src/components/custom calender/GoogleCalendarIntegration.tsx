import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  // Upload,
  Settings,
} from "lucide-react";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendar";
import GoogleCalendarIcon from "/dashboard/google-calendar.svg"; // You'll need to add this icon

interface GoogleCalendarIntegrationProps {
  onSyncComplete?: () => void;
}

export const GoogleCalendarIntegration: React.FC<
  GoogleCalendarIntegrationProps
> = ({ onSyncComplete }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSyncOptions, setShowSyncOptions] = useState(false);

  const {
    isConnected,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    syncAllEvents,
    importGoogleEvents,
    forceSyncUser,
    isConnecting,
    isDisconnecting,
    isSyncing,
    isImporting,
    isForceSyncing,
    googleCalendars,
    // fetchGoogleCalendars,
  } = useGoogleCalendarIntegration();

  const handleConnect = () => {
    connectGoogleCalendar();
  };

  const handleDisconnect = () => {
    disconnectGoogleCalendar();
  };

  const handleFullSync = () => {
    syncAllEvents();
    onSyncComplete?.();
  };

  const handleImportEvents = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    importGoogleEvents({
      calendarId: "primary",
      timeMin: thirtyDaysAgo.toISOString(),
      timeMax: thirtyDaysFromNow.toISOString(),
      maxResults: 100,
    });
    onSyncComplete?.();
  };

  const handleForceSync = () => {
    forceSyncUser();
    onSyncComplete?.();
  };

  return (
    <Stack className="w-full p-3">
      <Flex className="items-center justify-between">
        <Flex className="items-center gap-2">
          <img
            src={GoogleCalendarIcon}
            alt="Google Calendar"
            className="size-4"
          />
          <span className="font-semibold">Google Calendar</span>
          {isConnected && <Box className="w-2 h-2 bg-green-500 rounded-full" />}
        </Flex>
        <Flex className="items-center gap-1">
          {isConnected && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSyncOptions(!showSyncOptions)}
              className="p-1 h-6 w-6"
            >
              <Settings className="size-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-6 w-6 cursor-pointer"
          >
            {isExpanded ? (
              <ChevronUp className="size-4 cursor-pointer text-gray-500 transition-transform duration-300" />
            ) : (
              <ChevronDown className="size-4 cursor-pointer text-gray-500 transition-transform duration-300" />
            )}
          </Button>
        </Flex>
      </Flex>

      {isExpanded && (
        <Flex className="flex-col gap-3 items-start mt-3">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-[#1797B9] hover:bg-[#1797B9]/80 text-white text-sm h-8"
            >
              {isConnecting ? (
                <Flex className="items-center gap-2">
                  <RefreshCw className="size-3 animate-spin" />
                  Connecting...
                </Flex>
              ) : (
                "Connect Google Calendar"
              )}
            </Button>
          ) : (
            <>
              <Flex className="flex-col gap-2 w-full">
                <Button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  variant="outline"
                  className="w-full text-sm h-8"
                >
                  {isDisconnecting ? (
                    <Flex className="items-center gap-2">
                      <RefreshCw className="size-3 animate-spin" />
                      Disconnecting...
                    </Flex>
                  ) : (
                    "Disconnect"
                  )}
                </Button>

                {showSyncOptions && (
                  <Flex className="flex-col gap-2 w-full mt-2">
                    <Button
                      onClick={handleFullSync}
                      disabled={isSyncing}
                      variant="outline"
                      className="w-full text-sm h-8"
                    >
                      {isSyncing ? (
                        <Flex className="items-center gap-2">
                          <RefreshCw className="size-3 animate-spin" />
                          Syncing...
                        </Flex>
                      ) : (
                        <Flex className="items-center gap-2">
                          <RefreshCw className="size-3" />
                          Full Sync
                        </Flex>
                      )}
                    </Button>

                    <Button
                      onClick={handleImportEvents}
                      disabled={isImporting}
                      variant="outline"
                      className="w-full text-sm h-8"
                    >
                      {isImporting ? (
                        <Flex className="items-center gap-2">
                          <RefreshCw className="size-3 animate-spin" />
                          Importing...
                        </Flex>
                      ) : (
                        <Flex className="items-center gap-2">
                          <Download className="size-3" />
                          Import Events
                        </Flex>
                      )}
                    </Button>

                    <Button
                      onClick={handleForceSync}
                      disabled={isForceSyncing}
                      variant="outline"
                      className="w-full text-sm h-8"
                    >
                      {isForceSyncing ? (
                        <Flex className="items-center gap-2">
                          <RefreshCw className="size-3 animate-spin" />
                          Force Syncing...
                        </Flex>
                      ) : (
                        <Flex className="items-center gap-2">
                          <RefreshCw className="size-3" />
                          Force Sync Now
                        </Flex>
                      )}
                    </Button>

                    {/* <Button
                      onClick={handleFetchCalendars}
                      variant="outline"
                      className="w-full text-sm h-8"
                    >
                      <Flex className="items-center gap-2">
                        <Upload className="size-3" />
                        View Calendars
                      </Flex>
                    </Button> */}
                  </Flex>
                )}
              </Flex>

              {googleCalendars.length > 0 && (
                <Flex className="flex-col gap-1 w-full mt-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Available Calendars:
                  </span>
                  {googleCalendars
                    .slice(0, 3)
                    .map((calendar: any, index: number) => (
                      <Center
                        key={index}
                        className="gap-2 text-xs text-gray-600"
                      >
                        <Box className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="truncate">{calendar.summary}</span>
                      </Center>
                    ))}
                  {googleCalendars.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{googleCalendars.length - 3} more
                    </span>
                  )}
                </Flex>
              )}
            </>
          )}
        </Flex>
      )}
    </Stack>
  );
};
