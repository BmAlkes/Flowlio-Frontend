import { ReactNode, useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useuserprofile";
import { DemoPasswordChangeModal } from "../dempasswordchangemodal";
import { useQueryClient } from "@tanstack/react-query";

interface DemoPasswordGuardProps {
  children: ReactNode;
}

/**
 * DemoPasswordGuard component that checks if a demo user needs to change their password
 * Shows a modal that must be completed before accessing the app
 * This should wrap authenticated routes to ensure password change on first login
 */
export const DemoPasswordGuard = ({ children }: DemoPasswordGuardProps) => {
  const { data: userProfile, refetch } = useUserProfile();
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if user is a demo user and needs to change password
    if (
      userProfile?.data?.demoOrgInfo?.isDemo &&
      !userProfile?.data?.demoOrgInfo?.passwordChanged
    ) {
      setShowPasswordChangeModal(true);
    } else {
      // If password has been changed or user is not a demo user, hide the modal
      setShowPasswordChangeModal(false);
    }
  }, [userProfile]);

  const handlePasswordChanged = async () => {
    // Refetch user profile after password change to update the state
    queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    await refetch();
    setShowPasswordChangeModal(false);
  };

  return (
    <>
      {children}
      <DemoPasswordChangeModal
        open={showPasswordChangeModal}
        onOpenChange={(open) => {
          // Close modal immediately when onOpenChange is called with false
          setShowPasswordChangeModal(false);
          if (!open) {
            // Refetch user profile after password change to update the state
            handlePasswordChanged();
          }
        }}
      />
    </>
  );
};
