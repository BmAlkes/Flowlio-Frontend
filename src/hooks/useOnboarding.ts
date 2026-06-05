import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface OnboardingStep {
  completedAt: string | null;
}

export interface OnboardingData {
  dismissed: boolean;
  completedAt: string | null;
  steps: Record<string, OnboardingStep | null>;
}

const QUERY_KEY = ["onboarding"];

export function useOnboarding() {
  const queryClient = useQueryClient();

  const query = useQuery<OnboardingData>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await axios.get("/onboarding");
      return res.data.data as OnboardingData;
    },
    staleTime: 5 * 60 * 1000,
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
  const isFirstVisit = !data?.dismissed && completedSteps === 0;
  const showOnboarding = !data?.dismissed;

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
  };
}

/** Call this after any action that might complete an onboarding step */
export function useInvalidateOnboarding() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });
}
