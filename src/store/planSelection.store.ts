import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlanSelectionState {
  selectedPlanIndex: number | null;
  selectedPlanId: string | null;
  planDetails: {
    name?: string;
    price?: string | number;
    description?: string;
  } | null;
  organizationName: string | null;
  organizationWebsite: string | null;
  organizationIndustry: string | null;
  organizationSize: string | null;
  // Actions
  setSelectedPlan: (
    planIndex: number,
    planId: string,
    planDetails?: {
      name?: string;
      price?: string | number;
      description?: string;
    }
  ) => void;
  setOrganizationData: (data: {
    organizationName?: string;
    organizationWebsite?: string;
    organizationIndustry?: string;
    organizationSize?: string;
  }) => void;
  clearPlanSelection: () => void;
}

export const usePlanSelectionStore = create<PlanSelectionState>()(
  persist(
    (set) => ({
      selectedPlanIndex: null,
      selectedPlanId: null,
      planDetails: null,
      organizationName: null,
      organizationWebsite: null,
      organizationIndustry: null,
      organizationSize: null,

      setSelectedPlan: (planIndex, planId, planDetails) => {
        set({
          selectedPlanIndex: planIndex,
          selectedPlanId: planId,
          planDetails: planDetails || null,
        });
      },

      setOrganizationData: (data) => {
        set({
          organizationName: data.organizationName || null,
          organizationWebsite: data.organizationWebsite || null,
          organizationIndustry: data.organizationIndustry || null,
          organizationSize: data.organizationSize || null,
        });
      },

      clearPlanSelection: () => {
        set({
          selectedPlanIndex: null,
          selectedPlanId: null,
          planDetails: null,
          organizationName: null,
          organizationWebsite: null,
          organizationIndustry: null,
          organizationSize: null,
        });
      },
    }),
    {
      name: "plan-selection-storage", // localStorage key
    }
  )
);
