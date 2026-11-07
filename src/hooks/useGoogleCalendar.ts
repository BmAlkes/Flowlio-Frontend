import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

// Google Calendar Auth Hooks
export const useGoogleCalendarAuth = () => {
  const queryClient = useQueryClient();

  const generateAuthUrl = useMutation({
    mutationFn: async () => {
      const response = await axios.get("/google-calendar/auth/url");
      return response.data;
    },
    onSuccess: (data) => {
      // Open Google OAuth URL in new window
      const popup = window.open(
        data.data.authUrl,
        "google-calendar-auth",
        "width=500,height=600,left=100,top=100"
      );

      if (!popup) {
        alert(
          "Popup blocked. Please allow popups for this site and try again."
        );
        return;
      }

      // Listen for postMessage from popup
      const messageHandler = (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) return;

        if (
          event.data?.type === "google-calendar-auth" &&
          (event.data?.status === "success" || event.data?.status === "error")
        ) {
          window.removeEventListener("message", messageHandler);
          clearInterval(checkPopup);

          // Force close popup - multiple aggressive attempts
          if (popup && !popup.closed) {
            const forceClose = () => {
              try {
                // Method 1: Standard close
                popup.close();

                // Method 2: Try with focus first
                popup.focus();
                popup.close();

                // Method 3: Use about:blank as fallback
                if (!popup.closed) {
                  popup.location.href = "about:blank";
                  setTimeout(() => {
                    if (!popup.closed) {
                      popup.close();
                    }
                  }, 100);
                }
              } catch {
                // If all methods fail, try about:blank
                try {
                  popup.location.href = "about:blank";
                } catch {
                  // Ignore all errors
                }
              }
            };

            forceClose();
            setTimeout(forceClose, 50);
            setTimeout(forceClose, 100);
            setTimeout(forceClose, 200);
            setTimeout(forceClose, 500);
            setTimeout(forceClose, 1000);

            // Last resort
            setTimeout(() => {
              if (popup && !popup.closed) {
                try {
                  popup.location.href = "about:blank";
                  popup.close();
                } catch {
                  // Final fallback
                }
              }
            }, 1500);
          }

          if (event.data.status === "success") {
            // Refresh connection status
            queryClient.invalidateQueries({
              queryKey: ["google-calendar-status"],
            });
          } else {
            alert("Failed to connect to Google Calendar. Please try again.");
          }
        }
      };

      window.addEventListener("message", messageHandler);

      // Poll to check if popup has been redirected to success page
      const checkPopup = setInterval(() => {
        try {
          // Check if popup is closed
          if (popup.closed) {
            clearInterval(checkPopup);
            // Check connection status after popup closes
            setTimeout(() => {
              queryClient.invalidateQueries({
                queryKey: ["google-calendar-status"],
              });
            }, 1000);
            return;
          }

          // Try to access popup URL (will throw error if cross-origin)
          try {
            const popupUrl = popup.location.href;
            // Check if URL contains success or error parameter, or if it's on calendar page (likely OAuth redirect)
            if (
              popupUrl.includes("google_auth=success") ||
              popupUrl.includes("/dashboard/calender") ||
              popupUrl.includes("/dashboard/calendar")
            ) {
              // If it's on calendar page, wait a bit for parameter to be set, then close
              if (
                popupUrl.includes("/dashboard/calender") ||
                popupUrl.includes("/dashboard/calendar")
              ) {
                // Wait 500ms for redirect to complete with parameter
                setTimeout(() => {
                  try {
                    const finalUrl = popup.location.href;
                    if (
                      finalUrl.includes("google_auth=success") ||
                      finalUrl.includes("google_auth=error")
                    ) {
                      clearInterval(checkPopup);
                      window.removeEventListener("message", messageHandler);

                      // Force close popup immediately - multiple attempts
                      const forceClose = () => {
                        try {
                          popup.close();
                        } catch {
                          // Ignore errors
                        }
                      };

                      forceClose();
                      setTimeout(forceClose, 100);
                      setTimeout(forceClose, 200);
                      setTimeout(forceClose, 500);

                      // Refresh connection status
                      queryClient.invalidateQueries({
                        queryKey: ["google-calendar-status"],
                      });
                    }
                  } catch {
                    // If we can't access URL, assume success and close
                    clearInterval(checkPopup);
                    window.removeEventListener("message", messageHandler);
                    const forceClose = () => {
                      try {
                        popup.close();
                      } catch {
                        // Ignore errors
                      }
                    };
                    forceClose();
                    setTimeout(forceClose, 100);
                    setTimeout(forceClose, 200);
                    queryClient.invalidateQueries({
                      queryKey: ["google-calendar-status"],
                    });
                  }
                }, 500);
                return; // Don't close immediately, wait for parameter
              }

              // If URL contains success parameter directly
              if (popupUrl.includes("google_auth=success")) {
                clearInterval(checkPopup);
                window.removeEventListener("message", messageHandler);

                // Force close popup immediately - multiple attempts
                const forceClose = () => {
                  try {
                    popup.close();
                  } catch {
                    // Ignore errors
                  }
                };

                forceClose();
                setTimeout(forceClose, 100);
                setTimeout(forceClose, 200);
                setTimeout(forceClose, 500);

                // Refresh connection status
                queryClient.invalidateQueries({
                  queryKey: ["google-calendar-status"],
                });
              }
            } else if (popupUrl.includes("google_auth=error")) {
              clearInterval(checkPopup);
              window.removeEventListener("message", messageHandler);

              // Force close popup
              const forceClose = () => {
                try {
                  popup.close();
                } catch {
                  // Ignore errors
                }
              };

              forceClose();
              setTimeout(forceClose, 100);
              setTimeout(forceClose, 200);

              alert("Failed to connect to Google Calendar. Please try again.");
            }
          } catch {
            // Cross-origin error - popup is still on Google's domain or redirecting
            // This is expected, continue polling
          }
        } catch {
          // Popup might be closed or inaccessible
          clearInterval(checkPopup);
        }
      }, 300); // Check every 300ms for faster detection

      // Cleanup interval after 5 minutes (timeout)
      setTimeout(() => {
        clearInterval(checkPopup);
        window.removeEventListener("message", messageHandler);
        if (popup && !popup.closed) {
          popup.close();
        }
      }, 5 * 60 * 1000);
    },
    onError: (error) => {
      console.error("Failed to generate Google Calendar auth URL:", error);
      alert(
        "Failed to connect to Google Calendar. Please check your internet connection and try again."
      );
    },
  });

  const checkStatus = useQuery({
    queryKey: ["google-calendar-status"],
    queryFn: async () => {
      const response = await axios.get("/google-calendar/auth/status");
      return response.data;
    },
  });

  const disconnect = useMutation({
    mutationFn: async () => {
      const response = await axios.delete("/google-calendar/auth/disconnect");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-calendar-status"] });
    },
    onError: (error) => {
      console.error("Failed to disconnect Google Calendar:", error);
      alert("Failed to disconnect Google Calendar. Please try again.");
    },
  });

  return {
    generateAuthUrl,
    checkStatus,
    disconnect,
  };
};

export type GoogleCalendarSyncStatus = {
  isRunning: boolean;
  lastSyncedAt: string | null;
  lastError: string | null;
  live: boolean;
};

// The server keeps calendars in sync on its own (Google push notifications plus a periodic pass).
// The page only asks for a sync when it opens or on demand, and follows the status.
export const useGoogleCalendarSync = (enabled: boolean) => {
  const queryClient = useQueryClient();

  const status = useQuery({
    queryKey: ["google-calendar-sync-status"],
    queryFn: async () => {
      const response = await axios.get("/google-calendar/sync/status");
      return response.data.data as GoogleCalendarSyncStatus;
    },
    enabled,
    refetchInterval: (query) => (query.state.data?.isRunning ? 3000 : 60000),
  });

  const syncNow = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/google-calendar/sync/force");
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["google-calendar-sync-status"] });
    },
  });

  // Show what a finished sync brought in.
  const lastSyncedAt = status.data ? status.data.lastSyncedAt : undefined;
  const seen = useRef(lastSyncedAt);
  useEffect(() => {
    if (lastSyncedAt && seen.current !== undefined && lastSyncedAt !== seen.current) {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    }
    seen.current = lastSyncedAt;
  }, [lastSyncedAt, queryClient]);

  return { status: status.data, syncNow };
};

// Google Calendar Integration Hook
export const useGoogleCalendarIntegration = () => {
  const auth = useGoogleCalendarAuth();
  const isConnected = auth.checkStatus.data?.data?.isConnected || false;
  const sync = useGoogleCalendarSync(isConnected);

  return {
    isConnected,
    connectGoogleCalendar: () => auth.generateAuthUrl.mutate(),
    disconnectGoogleCalendar: () => auth.disconnect.mutate(),
    syncNow: () => sync.syncNow.mutate(),
    isConnecting: auth.generateAuthUrl.isPending,
    isDisconnecting: auth.disconnect.isPending,
    isSyncing: sync.syncNow.isPending || !!sync.status?.isRunning,
    syncFailed: sync.syncNow.isError || !!sync.status?.lastError,
    syncStatus: sync.status,
  };
};
