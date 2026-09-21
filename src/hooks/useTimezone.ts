import { useState, useEffect, useRef, useCallback } from "react";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "./useDataScope";
import { validTimeZone } from "@/lib/locale-format";

export const useTimezone = () => {
  const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [isUpdating, setIsUpdating] = useState(false);
  const scope = useDataScope();
  const successful = useRef<string | undefined>(undefined);
  const pending = useRef(new Set<string>());

  const updateUserTimezone = useCallback(async (newTimezone = timezone) => {
    if (!validTimeZone(newTimezone)) return false;
    const key = JSON.stringify([scope, newTimezone]);
    if (successful.current === key) return true;
    if (pending.current.has(key)) return false;
    pending.current.add(key);
    setIsUpdating(true);
    try {
      const response = await axios.put("/user/profile/timezone", { timezone: newTimezone });
      if (response.data.success) successful.current = key;
      return !!response.data.success;
    } catch {
      return false;
    } finally {
      pending.current.delete(key);
      setIsUpdating(pending.current.size > 0);
    }
  }, [scope, timezone]);

  useEffect(() => { void updateUserTimezone(); }, [updateUserTimezone]);

  return { timezone, updateUserTimezone, isUpdating };
};
