export type DeliveryReview = {
  id: string; milestoneId: string | null; title: string; note: string; version: string;
  state: "pending" | "approved" | "changes_requested"; requestedAt: string;
  dueDate?: string | null; decidedAt: string | null; decidedBy: string | null;
  comment: string | null; stale: boolean; canDecide: boolean;
};

export type DeliveryMilestone = {
  id: string; title: string; version: string;
  status?: "pending" | "in_progress" | "completed"; dueDate?: string | null;
  currentReview?: {id: string; state: DeliveryReview["state"]} | null;
};

export type ReviewList = {
  reviews: DeliveryReview[]; page: number; hasMore: boolean; canRequest: boolean;
  hasClient: boolean; milestonesTruncated: boolean; milestones: DeliveryMilestone[];
  client?: {id: string; name: string; portalReady: boolean} | null;
  requestBlockReason?: "CLIENT_REQUIRED" | "CLIENT_PORTAL_REQUIRED" | null;
};
