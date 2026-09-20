export interface PendingSubscription {
  userId: string;
  subscriptionId: string;
  planId: string;
  organizationName?: string;
  country?: string;
}

const key = (userId: string) => `flowlio:pending-subscription:${userId}`;

export function readPendingSubscription(userId: string): PendingSubscription | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(key(userId)) || "null");
    return value?.userId === userId && typeof value.subscriptionId === "string"
      && typeof value.planId === "string" ? value : null;
  } catch { return null; }
}

export function savePendingSubscription(value: PendingSubscription) {
  try { sessionStorage.setItem(key(value.userId), JSON.stringify(value)); }
  catch { /* The current page can still retry when browser storage is unavailable. */ }
}

export function clearPendingSubscription(userId: string) {
  try { sessionStorage.removeItem(key(userId)); }
  catch { /* Confirmation has already succeeded on the server. */ }
}
