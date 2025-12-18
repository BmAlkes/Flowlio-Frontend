import { PageWrapper } from "@/components/common/pagewrapper";
import { Box } from "@/components/ui/box";
import { Input } from "@/components/ui/input";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { MdDataSaverOn } from "react-icons/md";
import { Flex } from "@/components/ui/flex";
import { IoTrashSharp } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { SubscribtionTabele } from "./subscribtiontabele";
import { PlanAccessModal, PlanAccessSettings } from "./PlanAccessModal";
import { useUpsertPlan } from "@/hooks/useupsertplan";
import { useDeleteCustomFeatures } from "@/hooks/usedeletecustomfeatures";
import { toast } from "sonner";
import { PlanFeature } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchPlans } from "@/hooks/usefetchplans";

const PLAN_LIST = [
  { key: "basic", label: "Basic" },
  { key: "standard", label: "Standard" },
  { key: "premium", label: "Premium" },
];

type PlanKey = "basic" | "standard" | "premium";

type PlanState = {
  id?: string; // Plan ID from database (for updates)
  name: string; // Original plan name (from database)
  customPlanName: string; // Custom display name (user-editable)
  slug: string; // Plan slug (editable)
  subheading: string;
  price: string;
  durationValue: string;
  durationType: "days" | "monthly" | "yearly" | "";
  trialDays: string; // Trial days (0 = no trial, any number = trial days)
  features: string[];
  newFeature: string;
  adding: boolean;
  accessSettings: PlanAccessSettings; // Plan access configuration
};

type PlansState = {
  [key in PlanKey]: PlanState;
};

const initialAccessSettings: PlanAccessSettings = {
  maxUsers: 0,
  maxProjects: 0,
  maxStorage: 0,
  maxTasks: 0,
  aiAssist: false,
  prioritySupport: false,
  calendarAccess: false,
  taskManagement: false,
  timeTracking: false,
};

const initialPlanState: PlanState = {
  id: undefined,
  name: "",
  customPlanName: "", // Custom display name
  slug: "",
  subheading: "",
  price: "",
  durationValue: "",
  durationType: "",
  trialDays: "7", // Default 7 days trial
  features: [""],
  newFeature: "",
  adding: false,
  accessSettings: { ...initialAccessSettings },
};

export const SubscriptionsHeader = () => {
  const { data: plansResponse, isLoading, error } = useFetchPlans();
  const fetchedPlans = plansResponse?.data || [];

  const [plans, setPlans] = useState<PlansState>({
    basic: { ...initialPlanState },
    standard: { ...initialPlanState },
    premium: { ...initialPlanState },
  });

  // Add individual loading states for each plan
  const [savingPlans, setSavingPlans] = useState<Record<PlanKey, boolean>>({
    basic: false,
    standard: false,
    premium: false,
  });

  // Track original features from database to distinguish between saved and new features
  const [originalFeatures, setOriginalFeatures] = useState<
    Record<PlanKey, string[]>
  >({
    basic: [],
    standard: [],
    premium: [],
  });

  // Modal state for plan access configuration
  const [accessModalOpen, setAccessModalOpen] = useState<{
    open: boolean;
    planKey: PlanKey | null;
  }>({
    open: false,
    planKey: null,
  });

  // Pre-populate form with fetched plans
  useEffect(() => {
    if (fetchedPlans.length > 0) {
      const updatedPlans = { ...plans };

      fetchedPlans.forEach((plan) => {
        // Match by slug instead of name to allow name changes
        // First try to match by slug, then by name
        const planSlug = (plan.slug || "").toLowerCase();
        let planKey: PlanKey | null = null;

        // Try to match slug to one of our plan keys
        if (
          planSlug === "basic" ||
          planSlug === "standard" ||
          planSlug === "premium"
        ) {
          planKey = planSlug as PlanKey;
        } else {
          // Fallback to matching by name
          const planNameLower = (plan.name || "").toLowerCase();
          if (
            planNameLower === "basic" ||
            planNameLower === "standard" ||
            planNameLower === "premium"
          ) {
            planKey = planNameLower as PlanKey;
          }
        }

        if (planKey && planKey in updatedPlans) {
          // Handle both snake_case and camelCase from API
          // Check all possible property names
          const durationValue =
            (plan as any).durationValue ?? (plan as any).duration_value ?? null;
          const durationType =
            (plan as any).durationType ?? (plan as any).duration_type ?? null;
          const trialDays =
            (plan as any).trialDays ?? (plan as any).trial_days ?? 7;

          // Convert features object back to string array for UI
          const featureStrings: string[] = [];

          // Add custom features if they exist
          if (
            plan.features?.customFeatures &&
            plan.features.customFeatures.length > 0
          ) {
            featureStrings.push(...plan.features.customFeatures);
          }

          // Format durationValue - ensure it's a string for the input
          let formattedDurationValue = "";
          if (durationValue !== null && durationValue !== undefined) {
            // Convert to number first to handle string numbers, then back to string
            const numValue = Number(durationValue);
            if (!isNaN(numValue) && numValue >= 0) {
              formattedDurationValue = numValue.toString();
            }
          }

          // Format durationType - ensure it's a valid value or empty string
          let formattedDurationType: "days" | "monthly" | "yearly" | "" = "";
          if (
            durationType &&
            typeof durationType === "string" &&
            (durationType === "days" ||
              durationType === "monthly" ||
              durationType === "yearly")
          ) {
            formattedDurationType = durationType;
          }

          // Format trialDays - ensure it's a string for the input
          let formattedTrialDays = "7"; // Default to 7
          if (trialDays !== null && trialDays !== undefined) {
            const numValue = Number(trialDays);
            if (!isNaN(numValue) && numValue >= 0) {
              formattedTrialDays = numValue.toString();
            }
          }

          // IMPORTANT: name and slug are IMMUTABLE (always "Basic"/"basic", "Standard"/"standard", "Premium"/"premium")
          // Only customPlanName is user-editable and displayed on pricing page

          // Get the original name from database (IMMUTABLE - e.g., "Basic", "Standard", "Premium")
          const originalName =
            plan.name && plan.name.trim() !== "" ? plan.name.trim() : "";

          // Get the slug from database (IMMUTABLE - e.g., "basic", "standard", "premium")
          const originalSlug =
            plan.slug && plan.slug.trim() !== "" ? plan.slug.trim() : planKey;

          // Get customPlanName from API - this is what user can edit and what displays on pricing page
          // If customPlanName is null/empty, show empty string so user can type their own custom name
          // DO NOT use original name as fallback - customPlanName should be independent
          const apiCustomPlanName =
            (plan as any).customPlanName ??
            (plan as any).custom_plan_name ??
            null;

          // Use customPlanName if it exists, otherwise empty string (user will type their own)
          const customPlanName =
            apiCustomPlanName !== null &&
            apiCustomPlanName !== undefined &&
            apiCustomPlanName !== "" &&
            apiCustomPlanName.trim() !== ""
              ? apiCustomPlanName.trim()
              : ""; // Empty string - user will type their custom name independently

          // Load access settings from plan features
          const accessSettings: PlanAccessSettings = {
            maxUsers: plan.features?.maxUsers ?? 1,
            maxProjects: plan.features?.maxProjects ?? 1,
            maxStorage: plan.features?.maxStorage ?? 1,
            maxTasks: plan.features?.maxTasks ?? 1,
            aiAssist: plan.features?.aiAssist ?? false,
            prioritySupport: plan.features?.prioritySupport ?? false,
            calendarAccess: plan.features?.calendarAccess ?? false,
            taskManagement: plan.features?.taskManagement ?? false,
            timeTracking: plan.features?.timeTracking ?? false,
          };

          updatedPlans[planKey] = {
            id: plan.id, // Store plan ID for updates
            name: originalName, // Original plan name (IMMUTABLE - "Basic", "Standard", "Premium")
            customPlanName: customPlanName, // Custom display name (USER-EDITABLE - shows on pricing page)
            slug: originalSlug, // Slug (IMMUTABLE - "basic", "standard", "premium")
            subheading: plan.description || "",
            price: plan.price.toString(),
            durationValue: formattedDurationValue,
            durationType: formattedDurationType,
            trialDays: formattedTrialDays,
            features: featureStrings.length > 0 ? featureStrings : [""],
            newFeature: "",
            adding: false,
            accessSettings: accessSettings,
          };

          // Store original features from database for this plan
          setOriginalFeatures((prev) => ({
            ...prev,
            [planKey]: featureStrings.length > 0 ? [...featureStrings] : [],
          }));
        }
      });

      setPlans(updatedPlans);

      // Log final state to verify customPlanName is set
    }
  }, [fetchedPlans]);

  // Debug: Log current plans state when it changes
  useEffect(() => {
    // Warn if customPlanName matches planKey (this should never happen)
    if (plans.basic.customPlanName === "basic") {
      console.warn(
        "⚠️ WARNING: customPlanName matches planKey 'basic' - this should not happen!"
      );
    }
    if (plans.standard.customPlanName === "standard") {
      console.warn(
        "⚠️ WARNING: customPlanName matches planKey 'standard' - this should not happen!"
      );
    }
    if (plans.premium.customPlanName === "premium") {
      console.warn(
        "⚠️ WARNING: customPlanName matches planKey 'premium' - this should not happen!"
      );
    }
  }, [plans]);

  const handleInputChange = (
    planKey: PlanKey,
    field: keyof PlanState,
    value: string | "days" | "monthly" | "yearly" | ""
  ) => {
    setPlans((prev) => ({
      ...prev,
      [planKey]: { ...prev[planKey], [field]: value },
    }));
  };

  const handleAddFeature = (planKey: PlanKey) => {
    setPlans((prev) => ({
      ...prev,
      [planKey]: { ...prev[planKey], adding: true },
    }));
  };

  const handleSaveFeature = (planKey: PlanKey) => {
    const { newFeature, features } = plans[planKey];
    if (newFeature.trim()) {
      setPlans((prev) => ({
        ...prev,
        [planKey]: {
          ...prev[planKey],
          features: [...features, newFeature.trim()],
          newFeature: "",
          adding: false,
        },
      }));
    }
  };

  const handleRemoveFeature = async (planKey: PlanKey, idx: number) => {
    const featureToRemove = plans[planKey].features[idx];

    // Check if this feature exists in the original features from database
    const isFeatureInDatabase =
      originalFeatures[planKey].includes(featureToRemove);

    // If feature exists in database, delete it from database
    if (isFeatureInDatabase) {
      // Find the plan ID from fetched plans
      const plan = fetchedPlans.find((p) => {
        const planSlug = (p.slug || "").toLowerCase();
        const planNameLower = (p.name || "").toLowerCase();
        return planSlug === planKey || planNameLower === planKey;
      });

      if (plan) {
        try {
          await deleteCustomFeaturesMutation.mutateAsync({
            planId: plan.id,
            featuresToDelete: [featureToRemove],
          });

          // Remove from original features tracking
          setOriginalFeatures((prev) => ({
            ...prev,
            [planKey]: prev[planKey].filter((f) => f !== featureToRemove),
          }));

          toast.success(
            `Feature "${featureToRemove}" deleted from database successfully`
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          toast.error(
            `Failed to delete feature "${featureToRemove}": ${errorMessage}`
          );
          return; // Don't update local state if API call failed
        }
      }
    } else {
      // Feature is newly added (not in database), just remove from local state
      toast.info(
        `Feature "${featureToRemove}" removed (not saved to database yet)`
      );
    }

    // Update local state (remove from UI)
    setPlans((prev) => {
      const features = prev[planKey].features.filter(
        (_: string, i: number) => i !== idx
      );
      return {
        ...prev,
        [planKey]: { ...prev[planKey], features },
      };
    });
  };

  const upsertPlanMutation = useUpsertPlan();
  const deleteCustomFeaturesMutation = useDeleteCustomFeatures();
  const queryClient = useQueryClient();

  // Handler to update access settings and save to database
  const handleUpdateAccessSettings = async (
    planKey: PlanKey,
    settings: PlanAccessSettings
  ) => {
    // Get the current plan and update with new settings
    const currentPlan = plans[planKey];
    const updatedPlan = {
      ...currentPlan,
      accessSettings: settings,
    };

    // Update local state
    setPlans((prev) => ({
      ...prev,
      [planKey]: updatedPlan,
    }));

    // Check if plan has required data to save
    if (!updatedPlan.id && (!updatedPlan.subheading || !updatedPlan.price)) {
      toast.info(
        "Access settings saved locally. Please complete plan details and click Save to persist to database."
      );
      return;
    }

    // Check if any other plan is currently being saved
    const isAnyPlanSaving = Object.values(savingPlans).some(
      (isSaving) => isSaving
    );
    if (isAnyPlanSaving) {
      toast.error("Please wait for the current save operation to complete");
      throw new Error("Another plan is currently being saved");
    }

    // Set loading state
    setSavingPlans((prev) => ({ ...prev, [planKey]: true }));

    try {
      // Use the same save logic as handleSavePlan
      const validation = validatePlan(updatedPlan);
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(", ");
        toast.error("Cannot save access settings", {
          description: errorMessage,
        });
        setSavingPlans((prev) => ({ ...prev, [planKey]: false }));
        throw new Error(errorMessage);
      }

      // Map features with updated access settings
      const mapFeaturesToApi = (
        features: string[],
        accessSettings: PlanAccessSettings
      ) => {
        const featureMap: PlanFeature = {
          maxUsers: accessSettings.maxUsers,
          maxProjects: accessSettings.maxProjects,
          maxStorage: accessSettings.maxStorage,
          maxTasks: accessSettings.maxTasks,
          aiAssist: accessSettings.aiAssist,
          prioritySupport: accessSettings.prioritySupport,
          calendarAccess: accessSettings.calendarAccess,
          taskManagement: accessSettings.taskManagement,
          timeTracking: accessSettings.timeTracking,
          customFeatures: [],
        } as PlanFeature;

        const validFeatures = features.filter(
          (feature) => feature.trim() !== ""
        );
        const uniqueFeatures = [...new Set(validFeatures)];

        uniqueFeatures.forEach((feature) => {
          if (feature.trim() !== "") {
            featureMap.customFeatures?.push(feature.trim());
          }
        });

        if (!featureMap.customFeatures) {
          featureMap.customFeatures = [];
        }

        return featureMap;
      };

      const parsedDurationValue =
        updatedPlan.durationValue &&
        updatedPlan.durationValue !== "" &&
        updatedPlan.durationValue.trim() !== "" &&
        !isNaN(parseInt(updatedPlan.durationValue, 10))
          ? parseInt(updatedPlan.durationValue, 10)
          : null;

      const validDurationType =
        updatedPlan.durationType === "days" ||
        updatedPlan.durationType === "monthly" ||
        updatedPlan.durationType === "yearly"
          ? updatedPlan.durationType
          : null;

      const planName = updatedPlan.id
        ? updatedPlan.name && updatedPlan.name.trim() !== ""
          ? updatedPlan.name.trim()
          : ""
        : PLAN_LIST.find((p) => p.key === planKey)?.label ||
          planKey.charAt(0).toUpperCase() + planKey.slice(1);
      const planSlug = updatedPlan.id
        ? updatedPlan.slug && updatedPlan.slug.trim() !== ""
          ? updatedPlan.slug.trim()
          : planKey
        : planKey.toLowerCase();

      let customPlanNameValue: string | null = null;
      if (
        updatedPlan.customPlanName !== undefined &&
        updatedPlan.customPlanName !== null &&
        updatedPlan.customPlanName !== ""
      ) {
        const trimmed = updatedPlan.customPlanName.trim();
        if (trimmed.length > 0) {
          customPlanNameValue = trimmed;
        }
      }

      // Parse trialDays - convert to number if valid, otherwise default to 7
      const parsedTrialDays =
        updatedPlan.trialDays &&
        updatedPlan.trialDays !== "" &&
        updatedPlan.trialDays.trim() !== "" &&
        !isNaN(parseInt(updatedPlan.trialDays, 10)) &&
        parseInt(updatedPlan.trialDays, 10) >= 0
          ? parseInt(updatedPlan.trialDays, 10)
          : 7;

      const planData = {
        id: updatedPlan.id,
        name: planName,
        slug: planSlug,
        customPlanName: customPlanNameValue,
        description: updatedPlan.subheading,
        price: parseFloat(updatedPlan.price),
        features: mapFeaturesToApi(updatedPlan.features, settings),
        isActive: true,
        sortOrder: 1,
        currency: "USD",
        billingCycle: "monthly" as const,
        durationValue: parsedDurationValue,
        durationType: validDurationType,
        trialDays: parsedTrialDays,
      };

      const result = await upsertPlanMutation.mutateAsync(planData);
      const isUpdate = result.data?.isUpdate;

      toast.success(
        `Access settings for ${
          PLAN_LIST.find((p) => p.key === planKey)?.label
        } plan ${isUpdate ? "updated" : "saved"} successfully`
      );

      // Update originalFeatures
      const savedFeatures = updatedPlan.features.filter((f) => f.trim() !== "");
      setOriginalFeatures((prev) => ({
        ...prev,
        [planKey]: [...savedFeatures],
      }));

      // Invalidate and refetch plans
      await new Promise((resolve) => setTimeout(resolve, 500));
      await queryClient.invalidateQueries({ queryKey: ["fetch plans"] });
      await queryClient.refetchQueries({ queryKey: ["fetch plans"] });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save access settings";
      toast.error("Failed to save access settings", {
        description: errorMessage,
      });
      // Re-throw error so modal can handle it
      throw error;
    } finally {
      setSavingPlans((prev) => ({ ...prev, [planKey]: false }));
    }
  };

  const validatePlan = (
    plan: PlanState
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // customPlanName is optional - user can create plan without it and add it later
    // No validation needed for customPlanName

    if (!plan.subheading.trim()) {
      errors.push("Subheading is required");
    }

    if (!plan.price || parseFloat(plan.price) <= 0) {
      errors.push("Valid price is required");
    }

    if (plan.features.length === 0) {
      errors.push("At least one feature is required");
    }

    // Validate durationValue - REQUIRED
    if (
      !plan.durationValue ||
      plan.durationValue.trim() === "" ||
      isNaN(parseInt(plan.durationValue, 10)) ||
      parseInt(plan.durationValue, 10) <= 0
    ) {
      errors.push("Duration value is required and must be a positive number");
    }

    // Validate durationType - REQUIRED
    const validDurationTypes = ["days", "monthly", "yearly"] as const;
    if (
      !plan.durationType ||
      !validDurationTypes.includes(
        plan.durationType as (typeof validDurationTypes)[number]
      )
    ) {
      errors.push(
        "Duration type is required and must be 'days', 'monthly', or 'yearly'"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleSavePlan = async (planKey: PlanKey) => {
    const plan = plans[planKey];

    // Check if any other plan is currently being saved
    const isAnyPlanSaving = Object.values(savingPlans).some(
      (isSaving) => isSaving
    );
    if (isAnyPlanSaving) {
      toast.error("Please wait for the current save operation to complete");
      return;
    }

    // Set loading state for this specific plan
    setSavingPlans((prev) => ({ ...prev, [planKey]: true }));

    // Validate the plan
    const validation = validatePlan(plan);
    if (!validation.isValid) {
      toast.error("Validation failed", {
        description: validation.errors.join(", "),
      });
      setSavingPlans((prev) => ({ ...prev, [planKey]: false }));
      return;
    }

    // Map dynamic features to API structure
    const mapFeaturesToApi = (
      features: string[],
      accessSettings: PlanAccessSettings
    ) => {
      const featureMap: PlanFeature = {
        maxUsers: accessSettings.maxUsers,
        maxProjects: accessSettings.maxProjects,
        maxStorage: accessSettings.maxStorage,
        maxTasks: accessSettings.maxTasks,
        aiAssist: accessSettings.aiAssist,
        prioritySupport: accessSettings.prioritySupport,
        calendarAccess: accessSettings.calendarAccess,
        taskManagement: accessSettings.taskManagement,
        timeTracking: accessSettings.timeTracking,
        customFeatures: [], // Initialize custom features array
      } as PlanFeature;

      // Filter out empty strings and duplicates
      const validFeatures = features.filter((feature) => feature.trim() !== "");
      const uniqueFeatures = [...new Set(validFeatures)];

      // Add all features as custom features (no automatic mapping)
      uniqueFeatures.forEach((feature) => {
        // Add as custom feature (only if it's not empty)
        if (feature.trim() !== "") {
          featureMap.customFeatures?.push(feature.trim());
        }
      });

      // Ensure customFeatures is always an array
      if (!featureMap.customFeatures) {
        featureMap.customFeatures = [];
      }

      return featureMap;
    };

    // Parse durationValue - convert to number if valid, otherwise null
    const parsedDurationValue =
      plan.durationValue &&
      plan.durationValue !== "" &&
      plan.durationValue.trim() !== "" &&
      !isNaN(parseInt(plan.durationValue, 10))
        ? parseInt(plan.durationValue, 10)
        : null;

    // Validate durationType - only include if it's a valid value, otherwise null
    const validDurationType =
      plan.durationType === "days" ||
      plan.durationType === "monthly" ||
      plan.durationType === "yearly"
        ? plan.durationType
        : null;

    // IMPORTANT: name and slug are IMMUTABLE - always use database values
    // Only customPlanName is user-editable
    // For new plans (no ID), use proper capitalized name and lowercase slug based on planKey
    // For existing plans (has ID), use database values
    const planName = plan.id
      ? plan.name && plan.name.trim() !== ""
        ? plan.name.trim()
        : ""
      : PLAN_LIST.find((p) => p.key === planKey)?.label ||
        planKey.charAt(0).toUpperCase() + planKey.slice(1);
    const planSlug = plan.id
      ? plan.slug && plan.slug.trim() !== ""
        ? plan.slug.trim()
        : planKey
      : planKey.toLowerCase(); // For new plans, use lowercase planKey as slug

    // Handle customPlanName - validate and send the actual value (trimmed)
    // This allows users to set customPlanName even when creating a new plan
    // Validate: if provided, must be a non-empty string after trimming
    let customPlanNameValue: string | null = null;
    if (
      plan.customPlanName !== undefined &&
      plan.customPlanName !== null &&
      plan.customPlanName !== ""
    ) {
      const trimmed = plan.customPlanName.trim();
      // Only send if it's a non-empty string after trimming
      if (trimmed.length > 0) {
        customPlanNameValue = trimmed;
      }
      // If it's empty after trimming, send null (user cleared the field)
    }
    // If undefined/null, send null (field was never set)

    // Parse trialDays - convert to number if valid, otherwise default to 7
    const parsedTrialDays =
      plan.trialDays &&
      plan.trialDays !== "" &&
      plan.trialDays.trim() !== "" &&
      !isNaN(parseInt(plan.trialDays, 10)) &&
      parseInt(plan.trialDays, 10) >= 0
        ? parseInt(plan.trialDays, 10)
        : 7;

    const planData = {
      id: plan.id, // Send plan ID if available (for updates)
      name: planName, // Original plan name (IMMUTABLE - from database: "Basic", "Standard", "Premium")
      slug: planSlug, // Slug (IMMUTABLE - from database: "basic", "standard", "premium")
      customPlanName: customPlanNameValue, // Custom display name (USER-EDITABLE - what shows on pricing page)
      description: plan.subheading,
      price: parseFloat(plan.price),
      features: mapFeaturesToApi(plan.features, plan.accessSettings),
      isActive: true,
      sortOrder: 1,
      currency: "USD",
      billingCycle: "monthly" as const,
      durationValue: parsedDurationValue,
      durationType: validDurationType,
      trialDays: parsedTrialDays,
    };

    try {
      const result = await upsertPlanMutation.mutateAsync(planData);
      const isUpdate = result.data?.isUpdate;

      toast.success(
        `${PLAN_LIST.find((p) => p.key === planKey)?.label} plan ${
          isUpdate ? "Updated" : "Created"
        } successfully`
      );

      // Update originalFeatures to track newly saved features
      // Filter out empty strings from features
      const savedFeatures = plan.features.filter((f) => f.trim() !== "");
      setOriginalFeatures((prev) => ({
        ...prev,
        [planKey]: [...savedFeatures],
      }));

      // Invalidate and refetch plans to update the table and form
      // Use a delay to ensure the database has committed the transaction
      await new Promise((resolve) => setTimeout(resolve, 500));

      await queryClient.invalidateQueries({ queryKey: ["fetch plans"] });
      await queryClient.refetchQueries({ queryKey: ["fetch plans"] });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create plan";
      toast.error("Failed to create plan", {
        description: errorMessage,
      });
    } finally {
      // Reset loading state for this specific plan
      setSavingPlans((prev) => ({ ...prev, [planKey]: false }));
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageWrapper className="mt-6 px-4 py-6">
        <Stack className="gap-1">
          <h1 className="text-black text-2xl font-medium max-md:text-lg">
            Subscription Management
          </h1>
          <h1 className="text-gray-500 max-md:text-sm">
            Loading subscription plans...
          </h1>
        </Stack>
      </PageWrapper>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageWrapper className="mt-6 px-4 py-6">
        <Stack className="gap-1">
          <h1 className="text-black text-2xl font-medium max-md:text-lg">
            Subscription Management
          </h1>
          <h1 className="text-red-500 max-md:text-sm">
            Error loading subscription plans: {error.message}
          </h1>
        </Stack>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="mt-6 px-4 py-6">
      <Stack className="gap-1 ">
        <h1 className="text-black text-2xl font-medium max-md:text-lg">
          Subscription Management
        </h1>
        <h1 className="text-gray-500 max-md:text-sm">
          View and manage all subscription plans and active company
          subscriptions.
        </h1>
      </Stack>
      <Flex className="flex-wrap items-start gap-6 mt-6 max-lg:flex-col flex-1">
        {PLAN_LIST.map((plan) => (
          <Stack
            key={plan.key}
            className="w-[350px] max-md:w-full max-md:flex-1 min-h-[400px] bg-white rounded-md border border-gray-200 flex-1 overflow-hidden gap-0"
          >
            <Flex className="items-center justify-between bg-[#F3F5F5] border-b border-gray-200 p-3">
              <h1 className="text-black text-xl font-medium">{plan.label}</h1>
              <button
                type="button"
                onClick={() =>
                  setAccessModalOpen({
                    open: true,
                    planKey: plan.key as PlanKey,
                  })
                }
                className="p-2 hover:bg-gray-200 rounded-full transition-all duration-200 cursor-pointer hover:rotate-45"
                aria-label="Configure plan access"
                title="Configure plan access settings"
              >
                <IoSettingsOutline className="text-[#1797B9] text-xl" />
              </button>
            </Flex>
            <Stack className="mt-2 p-3 flex-1">
              <label htmlFor="name" className="mb-1">
                Custom Plan Name
                <span className="text-xs text-gray-500 ml-2">
                  (Optional - This will be displayed on pricing page if set)
                </span>
              </label>
              <Input
                type="text"
                placeholder="Enter your custom display name (e.g., Basic, Pro Plan, etc.)"
                className="bg-white h-12 border border-gray-200 placeholder:text-gray-400 shadow-none"
                value={plans[plan.key as PlanKey].customPlanName || ""}
                onChange={(e) => {
                  const newValue = e.target.value;
                  handleInputChange(
                    plan.key as PlanKey,
                    "customPlanName",
                    newValue
                  );
                }}
              />
              <label htmlFor="subheading" className="mt-3">
                Subheading <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter Subheading"
                className="bg-white h-12 border border-gray-200 placeholder:text-gray-400 shadow-none"
                value={plans[plan.key as PlanKey].subheading}
                onChange={(e) =>
                  handleInputChange(
                    plan.key as PlanKey,
                    "subheading",
                    e.target.value
                  )
                }
                required
              />
              <label htmlFor="price" className="mt-3">
                Set Price
              </label>
              <Flex className="relative items-center h-16">
                <span className="absolute left-3 text-gray-400 font-outfit font-semibold text-2xl flex items-center h-full ">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="00.00"
                  className={`bg-white h-full border border-gray-200 placeholder:text-gray-400 shadow-none placeholder:text-2xl pl-8 focus:text-black text-2xl text-start flex items-center`}
                  value={plans[plan.key as PlanKey].price}
                  onChange={(e) =>
                    handleInputChange(
                      plan.key as PlanKey,
                      "price",
                      e.target.value
                    )
                  }
                  min="0"
                  step="1"
                  prefix="$"
                  style={{ fontSize: "1.5rem", lineHeight: "2rem" }}
                />
              </Flex>
              <label htmlFor="duration" className="mt-3">
                Set Duration <span className="text-red-500">*</span>
              </label>
              <Flex className="gap-2 items-center">
                <Input
                  type="number"
                  placeholder="e.g., 7, 30, 365"
                  className="bg-white h-10 border border-gray-200 placeholder:text-gray-400 shadow-none flex-1"
                  value={plans[plan.key as PlanKey].durationValue}
                  onChange={(e) =>
                    handleInputChange(
                      plan.key as PlanKey,
                      "durationValue",
                      e.target.value
                    )
                  }
                  min="1"
                  step="1"
                  required
                />
                <Select
                  value={
                    plans[plan.key as PlanKey].durationType &&
                    plans[plan.key as PlanKey].durationType !== ""
                      ? plans[plan.key as PlanKey].durationType
                      : undefined
                  }
                  onValueChange={(value: "days" | "monthly" | "yearly") =>
                    handleInputChange(
                      plan.key as PlanKey,
                      "durationType",
                      value
                    )
                  }
                  required
                >
                  <SelectTrigger className="w-[140px] h-12 border border-gray-200">
                    <SelectValue placeholder="Select type *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </Flex>
              <label htmlFor="trialDays" className="mt-3">
                Trial Days
                <span className="text-xs text-gray-500 ml-2">
                  (0 = No Trial, Any number = Trial days)
                </span>
              </label>
              <Input
                type="number"
                placeholder="e.g., 7, 14, 0"
                className="bg-white h-12 border border-gray-200 placeholder:text-gray-400 shadow-none"
                value={plans[plan.key as PlanKey].trialDays}
                onChange={(e) =>
                  handleInputChange(
                    plan.key as PlanKey,
                    "trialDays",
                    e.target.value
                  )
                }
                min="0"
                step="1"
              />
              <Box className="mt-4">
                <h1 className="font-semibold mb-2">Included</h1>
                <Stack className="gap-2">
                  {plans[plan.key as PlanKey].features.map(
                    (feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 group">
                        <FaCheckCircle className=" fill-[#1797B9]" />
                        <span className="flex-1 text-gray-700 text-base">
                          {feature}
                        </span>
                        <button
                          type="button"
                          className="opacity-70 hover:opacity-100 transition-opacity"
                          onClick={() =>
                            handleRemoveFeature(plan.key as PlanKey, idx)
                          }
                          disabled={deleteCustomFeaturesMutation.isPending}
                          aria-label="Remove feature"
                        >
                          <Box className="bg-[#e3f2f7] p-2 rounded-full cursor-pointer    ">
                            <IoTrashSharp
                              size={14}
                              className="text-[#1797B9]"
                            />
                          </Box>
                        </button>
                      </div>
                    )
                  )}

                  {plans[plan.key as PlanKey].adding ? (
                    <Stack>
                      <Flex className="gap-0">
                        <FaCheckCircle className="fill-[#1797B9]" />
                        <Input
                          type="text"
                          placeholder="Enter Package Feature"
                          className="flex-1 border-none bg-white shadow-none placeholder:text-gray-400 "
                          value={plans[plan.key as PlanKey].newFeature}
                          onChange={(e) =>
                            handleInputChange(
                              plan.key as PlanKey,
                              "newFeature",
                              e.target.value
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleSaveFeature(plan.key as PlanKey);
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveFeature(plan.key as PlanKey)}
                          className="bg-[#e3f2f7] text-white cursor-pointer hover:bg-[#1797B9]/20 hover:text-white transition-all duration-300 hover:scale-105 rounded-full p-2 size-8"
                        >
                          <MdDataSaverOn className="size-5 fill-[#1797B9]/90 hover:fill-white transition-all duration-300" />
                        </Button>
                      </Flex>
                      <Box className="w-full h-[0.5px] bg-gray-600"></Box>
                    </Stack>
                  ) : (
                    <Flex className="justify-between">
                      <Button
                        variant="link"
                        className="text-primary px-0 mt-1 cursor-pointer"
                        onClick={() => handleAddFeature(plan.key as PlanKey)}
                      >
                        + Add
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-primary px-2 mt-1 border rounded-md cursor-pointer"
                        onClick={() => handleSavePlan(plan.key as PlanKey)}
                        disabled={
                          savingPlans[plan.key as PlanKey] ||
                          Object.values(savingPlans).some(
                            (isSaving) => isSaving
                          )
                        }
                      >
                        {savingPlans[plan.key as PlanKey]
                          ? "Saving..."
                          : "Save"}
                      </Button>
                    </Flex>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Stack>
        ))}
      </Flex>

      <hr className="my-8" />

      <SubscribtionTabele
        fetchedPlans={fetchedPlans}
        isLoading={isLoading}
        error={error}
      />

      {/* Plan Access Configuration Modal */}
      {accessModalOpen.planKey && (
        <PlanAccessModal
          open={accessModalOpen.open}
          onOpenChange={(open) =>
            setAccessModalOpen({
              open,
              planKey: open ? accessModalOpen.planKey : null,
            })
          }
          planName={
            PLAN_LIST.find((p) => p.key === accessModalOpen.planKey)?.label ||
            accessModalOpen.planKey
          }
          accessSettings={plans[accessModalOpen.planKey].accessSettings}
          onSave={(settings) =>
            handleUpdateAccessSettings(accessModalOpen.planKey!, settings)
          }
          isSaving={savingPlans[accessModalOpen.planKey] || false}
        />
      )}
    </PageWrapper>
  );
};
