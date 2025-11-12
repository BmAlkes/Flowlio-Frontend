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
      window.open(data.data.authUrl, "_blank", "width=500,height=600");
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

// Google Calendar Sync Hooks
export const useGoogleCalendarSync = () => {
  const queryClient = useQueryClient();

  const syncAppToGoogle = useMutation({
    mutationFn: async (eventIds: string[]) => {
      const response = await axios.post("/google-calendar/sync/app-to-google", {
        eventIds,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
    onError: (error) => {
      console.error("Failed to sync app events to Google Calendar:", error);
      alert("Failed to sync events to Google Calendar. Please try again.");
    },
  });

  const syncGoogleToApp = useMutation({
    mutationFn: async (params: {
      calendarId?: string;
      timeMin?: string;
      timeMax?: string;
      maxResults?: number;
    }) => {
      const response = await axios.post(
        "/google-calendar/sync/google-to-app",
        params
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
    onError: (error) => {
      console.error("Failed to sync Google Calendar events to app:", error);
      alert("Failed to import events from Google Calendar. Please try again.");
    },
  });

  const fullBidirectionalSync = useMutation({
    mutationFn: async (params: { calendarId?: string }) => {
      const response = await axios.post(
        "/google-calendar/sync/bidirectional",
        params
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
    onError: (error) => {
      console.error("Failed to perform full bidirectional sync:", error);
      alert("Failed to perform full sync. Please try again.");
    },
  });

  const getUserCalendars = useQuery({
    queryKey: ["google-calendars"],
    queryFn: async () => {
      const response = await axios.get("/google-calendar/calendars");
      return response.data;
    },
    enabled: false, // Only fetch when explicitly called
  });

  const forceSyncUser = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/google-calendar/sync/force");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
    onError: (error) => {
      console.error("Failed to force sync user events:", error);
      alert("Failed to force sync events. Please try again.");
    },
  });

  const getSyncStatus = useQuery({
    queryKey: ["google-calendar-sync-status"],
    queryFn: async () => {
      const response = await axios.get("/google-calendar/sync/status");
      return response.data;
    },
  });

  return {
    syncAppToGoogle,
    syncGoogleToApp,
    fullBidirectionalSync,
    getUserCalendars,
    forceSyncUser,
    getSyncStatus,
  };
};

// Google Calendar Integration Hook
export const useGoogleCalendarIntegration = () => {
  const auth = useGoogleCalendarAuth();
  const sync = useGoogleCalendarSync();

  const connectGoogleCalendar = () => {
    auth.generateAuthUrl.mutate();
  };

  const disconnectGoogleCalendar = () => {
    auth.disconnect.mutate();
  };

  const syncAllEvents = (calendarId = "primary") => {
    sync.fullBidirectionalSync.mutate({ calendarId });
  };

  const syncSelectedEvents = (eventIds: string[]) => {
    sync.syncAppToGoogle.mutate(eventIds);
  };

  const importGoogleEvents = (params: {
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  }) => {
    sync.syncGoogleToApp.mutate(params);
  };

  const forceSyncUser = () => {
    sync.forceSyncUser.mutate();
  };

  return {
    // Auth
    isConnected: auth.checkStatus.data?.data?.isConnected || false,
    connectionStatus: auth.checkStatus.data?.data?.hasTokens || false,
    connectGoogleCalendar,
    disconnectGoogleCalendar,

    // Sync
    syncAllEvents,
    syncSelectedEvents,
    importGoogleEvents,
    forceSyncUser,

    // Loading states
    isConnecting: auth.generateAuthUrl.isPending,
    isDisconnecting: auth.disconnect.isPending,
    isSyncing: sync.fullBidirectionalSync.isPending,
    isImporting: sync.syncGoogleToApp.isPending,
    isForceSyncing: sync.forceSyncUser.isPending,

    // Data
    googleCalendars: sync.getUserCalendars.data?.data || [],
    syncStatus: sync.getSyncStatus.data?.data,

    // Methods
    fetchGoogleCalendars: sync.getUserCalendars.refetch,
  };
};
