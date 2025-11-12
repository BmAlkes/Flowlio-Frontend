import { useState, useEffect, useRef } from "react";
import { axios } from "@/configs/axios.config";

export const useTimezone = () => {
  const [timezone, setTimezone] = useState<string>("UTC");
  const [isUpdating, setIsUpdating] = useState(false);
  const hasUpdated = useRef(false);

  // Detect user's timezone
  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(detectedTimezone);
  }, []);

  // Update user timezone on server
  const updateUserTimezone = async (newTimezone?: string) => {
    const timezoneToUpdate = newTimezone || timezone;

    if (!timezoneToUpdate || isUpdating || hasUpdated.current) {
      return;
    }

    setIsUpdating(true);
    hasUpdated.current = true;

    try {
      const response = await axios.put("/user/profile/timezone", {
        timezone: timezoneToUpdate,
      });

      if (response.data.success) {
        console.log("Timezone updated successfully:", timezoneToUpdate);
      }
    } catch (error) {
      console.error("Failed to update timezone:", error);
      hasUpdated.current = false; // Reset on error to allow retry
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-update timezone when component mounts (only once)
  useEffect(() => {
    console.log("Timezone effect triggered:", {
      timezone,
      isUpdating,
      hasUpdated: hasUpdated.current,
    });
    if (timezone && timezone !== "UTC" && !isUpdating && !hasUpdated.current) {
      console.log("Calling updateUserTimezone...");
      updateUserTimezone();
    }
  }, [timezone]);

  // Manual trigger for testing
  const testTimezoneUpdate = () => {
    hasUpdated.current = false; // Reset flag for manual test
    updateUserTimezone();
  };

  // Expose test function to window for debugging
  useEffect(() => {
    (window as any).testTimezoneUpdate = testTimezoneUpdate;
  }, []);

  return {
    timezone,
    updateUserTimezone,
    isUpdating,
  };
};
