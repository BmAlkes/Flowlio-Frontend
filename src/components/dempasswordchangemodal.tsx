import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Box } from "@/components/ui/box";
import { useState } from "react";
import { authClient } from "@/providers/user.provider";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { RefreshCw } from "lucide-react";

interface DemoPasswordChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DemoPasswordChangeModal: React.FC<
  DemoPasswordChangeModalProps
> = ({ open, onOpenChange }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      // Change password using Better Auth
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (error) {
        toast.error(
          error.message ||
            "Failed to change password. Please check your current password."
        );
        setIsLoading(false);
        return;
      }

      // Mark password as changed in the backend
      try {
        await axios.post("/user/profile/mark-password-changed");
      } catch (markError) {
        console.error("Error marking password as changed:", markError);
        // Don't fail the whole operation if this fails
      }

      toast.success("Password changed successfully!");

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Close modal immediately after successful password change
      setIsLoading(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to change password. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" withoutCloseButton>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Set Your New Password
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            As a demo account user, please set a new password for your account.
            This is required for security purposes.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Box className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Current Password <span className="text-red-500">*</span>
            </Label>
            <Box className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {showCurrentPassword ? (
                  <IoEyeOff size={20} />
                ) : (
                  <IoEye size={20} />
                )}
              </button>
            </Box>
          </Box>

          <Box className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              New Password <span className="text-red-500">*</span>
            </Label>
            <Box className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {showNewPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
            </Box>
            <p className="text-xs text-gray-500">
              Password must be at least 8 characters, contain one uppercase
              letter, and one special character
            </p>
          </Box>

          <Box className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password <span className="text-red-500">*</span>
            </Label>
            <Box className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <IoEyeOff size={20} />
                ) : (
                  <IoEye size={20} />
                )}
              </button>
            </Box>
          </Box>

          <Box className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#1797B9] text-white hover:bg-[#1797B9]/80 cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </span>
              ) : (
                "Change Password"
              )}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};
