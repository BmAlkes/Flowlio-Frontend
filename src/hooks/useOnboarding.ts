import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "./useDataScope";
import { useUser } from "@/providers/user.provider";

export interface OnboardingStep {
  completedAt: string | null;
}

export interface OnboardingData {
  role: "admin" | "manager" | "member";
  dismissed: boolean;
  completedAt: string | null;
  steps: Record<string, OnboardingStep | null>;
}

const QUERY_KEY = ["onboarding"];

export function useOnboarding() {
  const queryClient = useQueryClient();
  const scope = useDataScope();
  const { data: session } = useUser();

  const query = useQuery<OnboardingData>({
    queryKey: [...QUERY_KEY, scope],
    enabled: session?.user?.role === "user" && !!(session.user.organizationId || session.user.organization?.id),
    queryFn: async () => {
      const res = await axios.get("/onboarding");
      return res.data.data as OnboardingData;
    },
    staleTime: 30_000,
    retry: false,
  });

  const completeStep = useMutation({
    mutationFn: (step: string) => axios.patch("/onboarding/step", { step }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const dismiss = useMutation({
    mutationFn: () => axios.patch("/onboarding/dismiss"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const data = query.data;
  const steps = data?.steps ?? {};
  const totalSteps = Object.keys(steps).length;
  const completedSteps = Object.values(steps).filter((s) => s?.completedAt).length;
  const allDone = totalSteps > 0 && completedSteps === totalSteps;
  // Show as long as the user hasn't explicitly dismissed.
  // completedAt is set by the backend via auto-detection and should NOT hide the UI.
  const isFirstVisit = !!data && !data.dismissed && totalSteps > 0 && completedSteps === 0;
  const showOnboarding = !!data && !query.isError && !data.dismissed && totalSteps > 0;

  return {
    data,
    isLoading: query.isLoading,
    steps,
    totalSteps,
    completedSteps,
    allDone,
    isFirstVisit,
    showOnboarding,
    completeStep: completeStep.mutate,
    dismiss: dismiss.mutate,
    dismissPending: dismiss.isPending,
    dismissError: dismiss.isError,
    refresh: () => void query.refetch(),
    isRefreshing: query.isFetching,
  };
}

/** Call this after any action that might complete an onboarding step */
export function useInvalidateOnboarding() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });
}
