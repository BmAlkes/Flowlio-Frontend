import { useState, useEffect } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingWelcomeModal } from "./OnboardingWelcomeModal";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { useUser } from "@/providers/user.provider";
import { useUserProfile } from "@/hooks/useuserprofile";

export function OnboardingProvider() {
  const { data: userData } = useUser();
  const { data: userProfile } = useUserProfile();
  const { data, isLoading, isFirstVisit, showOnboarding, dismiss } = useOnboarding();
  const [showModal, setShowModal] = useState(false);

  // Block onboarding while a demo user hasn't changed their password yet
  const passwordChangePending =
    userProfile?.data?.demoOrgInfo?.isDemo === true &&
    userProfile?.data?.demoOrgInfo?.passwordChanged === false;

  // Show welcome modal only on confirmed first visit
  useEffect(() => {
    if (!isLoading && isFirstVisit && !passwordChangePending) {
      setShowModal(true);
    }
  }, [isLoading, isFirstVisit, passwordChangePending]);

  if (isLoading || !data || !showOnboarding || passwordChangePending) return null;

  const orgName = userData?.user?.organization?.name;

  return (
    <>
      {showModal && (
        <OnboardingWelcomeModal
          organizationName={orgName}
          onStart={() => setShowModal(false)}
          onDismiss={() => {
            setShowModal(false);
            dismiss();
          }}
        />
      )}
      {!showModal && <OnboardingChecklist />}
    </>
  );
}
