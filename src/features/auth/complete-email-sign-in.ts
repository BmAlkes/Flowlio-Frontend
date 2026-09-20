import { authClient } from "@/lib/auth-client";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";
import type { SignInPorts } from "./sign-in-ports";
import { getRoleBasedRedirectPathAfterLogin } from "@/utils/sessionPersistence.util";

export async function completeEmailSignIn(
  email: string,
  signInData: { twoFactorRedirect?: boolean } | null | undefined,
  { navigate, refetchUser, setIsLoading, setError }: SignInPorts,
) {
  setError(null);
  if (signInData?.twoFactorRedirect) {
    sessionStorage.setItem("otpEmail", email);
    sessionStorage.setItem("otpSecondFactor", "true");
    setIsLoading(false);
    navigate("/auth/signin-otp", { replace: true });
    return;
  }
  sessionStorage.removeItem("otpSecondFactor");

  try {
    // Wait for Better Auth session to be established
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user has 2FA enabled by fetching profile
    const profileResponse = await axios.get("/user/profile");

    // Check if organization is deactivated, trial expired, or user is pending
    // NOTE: USER_PENDING should redirect to checkout, not log out
    if (profileResponse.status === 403) {
      const errorCode = profileResponse.data?.code;
      const errorData = profileResponse.data?.data;

      // Handle pending users - redirect to checkout
      if (
        errorCode === "USER_PENDING" ||
        errorCode === "USER_PENDING_NO_PLAN"
      ) {
        const errorMessage =
          typeof profileResponse.data?.message === "string"
            ? profileResponse.data.message
            : "Your account is pending payment. Please complete your payment to access your account.";

        toast.info(errorMessage);

        // Refresh user context first
        await refetchUser();

        // Redirect to checkout if user has payment data, otherwise to pricing
        if (
          errorCode === "USER_PENDING" &&
          (errorData?.selectedPlanId ||
            errorData?.pendingOrganizationData)
        ) {
          navigate("/checkout", {
            state: {
              pendingPayment: true,
              selectedPlanId: errorData?.selectedPlanId,
              pendingOrganizationData:
                errorData?.pendingOrganizationData,
            },
            replace: true,
          });
        } else {
          navigate("/pricing", {
            state: {
              fromSignin: true,
              pendingAccount: true,
            },
            replace: true,
          });
        }

        setIsLoading(false);
        return;
      }

      // Handle organization deactivated or trial expired
      if (
        errorCode === "ORGANIZATION_DEACTIVATED" ||
        errorCode === "TRIAL_EXPIRED"
      ) {
        const errorMessage =
          typeof profileResponse.data?.message === "string"
            ? profileResponse.data.message
            : "Access denied. Please contact the administrator for assistance.";
        toast.error(errorMessage);

        // Log out the user session that was created
        try {
          await authClient.signOut();
        } catch (error) {
          console.error("Error signing out:", error);
        }

        setIsLoading(false);
        return;
      }
    }

    const userProfile = profileResponse.data?.data;

    // If profile response failed, log and continue
    if (!userProfile) {
      console.error(
        "❌ No user profile data received:",
        profileResponse,
      );
      setIsLoading(false);
      return;
    }

    // Debug: Log user profile to see what we're getting
    console.log("🔍 User Profile on Sign-in:", {
      status: userProfile.status,
      statusType: typeof userProfile.status,
      selectedPlanId: userProfile.selectedPlanId,
      pendingOrganizationData: userProfile.pendingOrganizationData,
      twoFactorEnabled: userProfile.twoFactorEnabled,
      isSuperAdmin: userProfile.isSuperAdmin,
      fullProfile: userProfile,
      profileResponseKeys: Object.keys(profileResponse.data || {}),
    });

    // Skip pending payment check for:
    // 1. Super admins (they don't need payment)
    // 2. Sub admins (they don't need payment)
    // 3. Demo users (users in demo organizations don't need payment)
    const isSuperAdmin = userProfile.isSuperAdmin === true;
    const isSubAdmin =
      userProfile.role === "subadmin" || !!userProfile.subadminId;
    const isDemoUser =
      userProfile.demoOrgInfo !== null &&
      userProfile.demoOrgInfo !== undefined;

    // Also check if user has an organization with demo settings
    // This handles cases where demoOrgInfo might not be set but the org is demo
    const hasDemoOrganization =
      userProfile.organization?.settings?.demo === true ||
      (userProfile.organization &&
        typeof userProfile.organization.settings === "object" &&
        (userProfile.organization.settings as any)?.demo === true);

    const shouldSkipPaymentCheck =
      isSuperAdmin || isSubAdmin || isDemoUser || hasDemoOrganization;

    // Log the check results for debugging
    console.log("🔍 Payment check skip evaluation:", {
      isSuperAdmin,
      isSubAdmin,
      isDemoUser,
      hasDemoOrganization,
      shouldSkipPaymentCheck,
      demoOrgInfo: userProfile.demoOrgInfo,
      organizationSettings: userProfile.organization?.settings,
      userStatus: userProfile.status,
    });

    // Check if user is pending (needs to complete payment or select a plan)
    // Only apply to regular users (not super admins, sub admins, or demo users)
    // IMPORTANT: If shouldSkipPaymentCheck is true, we skip ALL payment checks
    if (!shouldSkipPaymentCheck) {
      // Check status case-insensitively and handle different formats
      const rawStatus = userProfile.status;
      const userStatus = rawStatus?.toLowerCase?.() || rawStatus || "";

      // A user is considered pending if:
      // 1. Status is explicitly "pending" (regardless of payment data)
      // 2. Status is null/undefined (new users or users created before status field was added)
      //    - These users need to complete payment to activate their account
      const isPending =
        userStatus === "pending" ||
        !rawStatus ||
        rawStatus === null ||
        rawStatus === undefined;

      const hasPaymentData = !!(
        userProfile.selectedPlanId ||
        userProfile.pendingOrganizationData
      );

      console.log("🔍 Checking user status:", {
        rawStatus: rawStatus,
        normalizedStatus: userStatus,
        isPending: isPending,
        selectedPlanId: userProfile.selectedPlanId,
        pendingOrganizationData: userProfile.pendingOrganizationData,
        hasPaymentData: hasPaymentData,
        willRedirect: isPending,
        isSuperAdmin: isSuperAdmin,
        isSubAdmin: isSubAdmin,
        isDemoUser: isDemoUser,
        hasDemoOrganization: hasDemoOrganization,
        demoOrgInfo: userProfile.demoOrgInfo,
        organization: userProfile.organization,
        shouldSkipPaymentCheck: shouldSkipPaymentCheck,
      });

      if (isPending) {
        console.log("✅ Pending user detected, redirecting...");

        // Check if user has payment data (can complete payment)
        if (
          userProfile.selectedPlanId ||
          userProfile.pendingOrganizationData
        ) {
          console.log(
            "✅ User has payment data, redirecting to checkout",
          );

          // User has pending payment, redirect to checkout
          toast.info(
            "Please complete your payment to activate your account",
          );

          // Refresh user context first
          await refetchUser();

          // Redirect to checkout with pending payment info
          navigate("/checkout", {
            state: {
              selectedPlan: null, // Will be determined in checkout
              createOrganization: true,
              pendingPayment: true,
              selectedPlanId: userProfile.selectedPlanId,
              pendingOrganizationData:
                userProfile.pendingOrganizationData,
            },
            replace: true,
          });
          setIsLoading(false);
          return; // IMPORTANT: Return early to prevent further execution
        } else {
          console.log(
            "✅ User has no payment data, redirecting to pricing",
          );

          // User is pending but has no payment data - redirect to pricing to select a plan
          toast.info(
            "Please select a plan and complete payment to activate your account",
          );

          // Refresh user context first
          await refetchUser();

          navigate("/pricing", {
            state: {
              fromSignin: true,
              pendingAccount: true,
            },
            replace: true,
          });
          setIsLoading(false);
          return; // IMPORTANT: Return early to prevent further execution
        }
      } else {
        // User is not pending, continue with normal login flow
        console.log(
          "✅ User is not pending, continuing with normal login flow",
        );
      }
    } else {
      // User is super admin, sub admin, or demo user - skip payment check
      console.log("✅ User is admin/demo - skipping payment check:", {
        isSuperAdmin: isSuperAdmin,
        isSubAdmin: isSubAdmin,
        isDemoUser: isDemoUser,
        hasDemoOrganization: hasDemoOrganization,
        shouldSkipPaymentCheck: shouldSkipPaymentCheck,
        demoOrgInfo: userProfile.demoOrgInfo,
        organization: userProfile.organization,
        fullUserProfile: userProfile,
      });

      // IMPORTANT: For demo users, even if they have pending status or payment data,
      // we should NOT redirect them to checkout. They should proceed to dashboard.
      // This ensures demo accounts work correctly regardless of their status.
    }

    // Show success message
    toast.success("Login successful");

    // Get comprehensive role-based redirect path
    const redirectPath = getRoleBasedRedirectPathAfterLogin(
      userProfile.role,
    );

    // Refresh user context to avoid stale state, then client-side navigate
    await refetchUser();
    navigate(redirectPath, { replace: true });
  } catch (error) {
    // Check if organization is deactivated, trial expired, or payment pending
    if ((error as any).response?.status === 403) {
      const errorCode = (error as any).response?.data?.code;
      const errorData = (error as any).response?.data?.data;
      const errorMessage =
        (error as any).response?.data?.message ||
        "Access denied. Please contact the administrator for assistance.";

      // Handle pending users - redirect to checkout instead of logging out
      if (
        errorCode === "USER_PENDING" ||
        errorCode === "USER_PENDING_NO_PLAN"
      ) {
        toast.info(errorMessage);

        // Refresh user context first
        await refetchUser();

        // Redirect to checkout if user has payment data, otherwise to pricing
        if (
          errorCode === "USER_PENDING" &&
          (errorData?.selectedPlanId ||
            errorData?.pendingOrganizationData)
        ) {
          navigate("/checkout", {
            state: {
              pendingPayment: true,
              selectedPlanId: errorData?.selectedPlanId,
              pendingOrganizationData:
                errorData?.pendingOrganizationData,
            },
            replace: true,
          });
        } else {
          navigate("/pricing", {
            state: {
              fromSignin: true,
              pendingAccount: true,
            },
            replace: true,
          });
        }

        setIsLoading(false);
        return;
      }

      // Handle other 403 errors (organization deactivated, trial expired, etc.)
      if (
        errorCode === "ORGANIZATION_DEACTIVATED" ||
        errorCode === "TRIAL_EXPIRED" ||
        errorCode === "PAYMENT_PENDING"
      ) {
        toast.error(errorMessage);

        // Log out the user session that was created
        try {
          await authClient.signOut();
        } catch (error) {
          console.error("Error signing out:", error);
          // Error signing out - silently fail
        }

        setIsLoading(false);
        return;
      }
    }

    // Check if it's a 401 error (unauthorized) - might indicate 2FA is required
    if ((error as any).response?.status === 401) {
      // Store email for OTP verification
      sessionStorage.setItem("otpEmail", email);

      // Redirect to OTP verification page
      navigate("/auth/signin-otp", { replace: true });
      return;
    }

    // Still redirect but show warning
    toast.warning(
      "Login successful, but some data may not be available yet",
    );

    // Fallback to default dashboard if profile fetch fails
    navigate("/dashboard", { replace: true });
  }

}
