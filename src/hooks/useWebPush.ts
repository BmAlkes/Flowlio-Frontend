import { useCallback, useEffect, useState } from "react";
import { axios } from "@/configs/axios.config";
import { isWebPushSupported, urlBase64ToUint8Array, VAPID_PUBLIC_KEY } from "@/utils/webPush";

export function useWebPush() {
  const supported = isWebPushSupported();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!supported) {
      setIsChecking(false);
      return;
    }
    navigator.serviceWorker
      .register("/sw-push.js")
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setIsSubscribed(!!subscription))
      .catch(() => setIsSubscribed(false))
      .finally(() => setIsChecking(false));
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported) throw new Error("Push notifications aren't supported in this browser");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission was denied");
    }

    const registration = await navigator.serviceWorker.register("/sw-push.js");
    await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    await axios.post("/notifications/push-subscribe", subscription.toJSON());
    setIsSubscribed(true);
  }, [supported]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    const registration = await navigator.serviceWorker.getRegistration("/sw-push.js");
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
      await axios.post("/notifications/push-unsubscribe", { endpoint: subscription.endpoint });
      await subscription.unsubscribe();
    }
    setIsSubscribed(false);
  }, [supported]);

  return { supported, isSubscribed, isChecking, subscribe, unsubscribe };
}
