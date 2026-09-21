import { useState, useEffect } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingWelcomeModal } from "./OnboardingWelcomeModal";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { useUser } from "@/providers/user.provider";
import { useUserProfile } from "@/hooks/useuserprofile";
import { useDataScope } from "@/hooks/useDataScope";

export function OnboardingProvider() {
  const scope = useDataScope();
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
    setShowModal(!isLoading && isFirstVisit && !passwordChangePending);
  }, [scope, isLoading, isFirstVisit, passwordChangePending]);

  if (isLoading || !data || !showOnboarding || passwordChangePending) return null;

  const orgName = userData?.user?.organization?.name;

  return (
    <>
      {showModal && (
        <OnboardingWelcomeModal
          organizationName={orgName}
          member={data.role === "member"}
          onStart={() => setShowModal(false)}
          onDismiss={() => {
            setShowModal(false);
            dismiss();
          }}
        />
      )}
      {!showModal && <OnboardingChecklist key={scope} />}
    </>
  );
}
