// Public VAPID key — safe to ship in the client bundle, this is the whole
// point of the public/private key pair. The matching private key lives only
// on the backend, used to sign outgoing push messages.
export const VAPID_PUBLIC_KEY =
  "BAk8tNQlbYbxUZnxuunkN_2TeTBCUY5da2_v2PJ3Qwi841vWd4z3bHyBo7GpwN7OVeqXchjEPYH7ic5mxBCVYK0";

/** PushManager.subscribe wants the VAPID key as a Uint8Array, not the
 * base64url string the rest of the world uses it as. */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isWebPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}
