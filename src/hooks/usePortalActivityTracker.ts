import { useEffect, useRef } from 'react';
import { useUser } from '@/providers/user.provider';
import { axios as axiosInstance } from '@/configs/axios.config';

/**
 * Hook to track portal activity for clients.
 * It pings the backend every minute if the user is a client and active in the tab.
 */
export const usePortalActivityTracker = () => {
  const { data: userData } = useUser();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only track for clients
    if (!userData?.user || userData.user.role !== 'client') {
      return;
    }

    const pingActivity = async () => {
      try {
        // Only ping if the document is visible to avoid ghost tracking
        if (document.visibilityState === 'visible') {
          await axiosInstance.post('/user/ping-activity');
        }
      } catch (error) {
        // Silent fail for background tracking
        console.error('Portal activity tracking failed', error);
      }
    };

    // Initial ping
    pingActivity();

    // Set up interval for every 60 seconds
    intervalRef.current = setInterval(pingActivity, 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userData]);
};
