import { useState, useEffect } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingWelcomeModal } from "./OnboardingWelcomeModal";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { useUser } from "@/providers/user.provider";

export function OnboardingProvider() {
  const { data: userData } = useUser();
  const { data, isLoading, isFirstVisit, showOnboarding, dismiss } = useOnboarding();
  const [showModal, setShowModal] = useState(false);

  // Show welcome modal only on confirmed first visit
  useEffect(() => {
    if (!isLoading && isFirstVisit) {
      setShowModal(true);
    }
  }, [isLoading, isFirstVisit]);

  if (isLoading || !data || !showOnboarding) return null;

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
