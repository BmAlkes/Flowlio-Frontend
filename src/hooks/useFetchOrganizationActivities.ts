import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import type { ApiResponse } from "@/configs/axios.config";

export interface OrganizationActivity {
  id: string;
  type: string; // Activity type (auth, user, task, audit, notification, etc.)
  source?: "recent" | "audit" | "notification"; // Which table it came from
  user: string;
  userImage: string | null;
  activity: string;
  date: string | Date;
  timestamp: number;
}

interface OrganizationActivitiesResponse {
  activities: OrganizationActivity[];
}

export const useFetchOrganizationActivities = () => {
  return useQuery<ApiResponse<OrganizationActivitiesResponse>>({
    queryKey: ["organization-activities"],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<OrganizationActivitiesResponse>>(
        "/organizations/activities"
      );
      return res.data;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};
