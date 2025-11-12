import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoCloudUpload } from "react-icons/io5";
import { useUpdateProfileImage } from "@/hooks/useupdateprofileimage";
import { toast } from "sonner";
import { Flex } from "@/components/ui/flex";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/providers/user.provider";

interface UpdateProfileImageContentProps {
  onClose: () => void;
  currentImage?: string;
  userName: string;
}

export const UpdateProfileImageContent = ({
  onClose,
  currentImage,
  userName,
}: UpdateProfileImageContentProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { refetchUser } = useUser();

  const updateProfileImageMutation = useUpdateProfileImage();

  const handleFileSelect = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
      );
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size too large. Maximum size is 5MB.");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file.");
      return;
    }

    updateProfileImageMutation.mutate(
      { image: selectedFile },
      {
        onSuccess: async () => {
          // Invalidate all user-related queries to ensure real-time updates
          await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
          await queryClient.invalidateQueries({ queryKey: ["user"] });
          await queryClient.invalidateQueries({ queryKey: ["getSession"] });

          // Refetch user data to update UI immediately
          await refetchUser();

          toast.success("Profile image updated successfully!");
          onClose();
          setSelectedFile(null);
          setPreviewUrl(null);
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to update profile image"
          );
        },
      }
    );
  };

  const displayName = userName || "User";
  const displayImage = currentImage || "https://github.com/shadcn.png";

  return (
    <Stack className="gap-4">
      {/* Header */}
      <Box>
        <h2 className="text-xl font-semibold">Update Profile Picture</h2>
        <p className="text-sm text-gray-600 mt-1">
          Upload a new profile picture for your account
        </p>
      </Box>

      {/* Current Image Preview */}
      <Box className="flex justify-center">
        <Avatar className="size-24 border-2 border-gray-200">
          <AvatarImage src={previewUrl || displayImage} alt={displayName} />
          <AvatarFallback>
            {displayName?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </Box>

      {/* File Upload Area */}
      <Box
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <Stack className="gap-2 items-center">
          <IoCloudUpload size={32} className="text-gray-400" />
          <Box>
            <p className="text-sm font-medium text-gray-700">
              {selectedFile
                ? selectedFile.name
                : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, JPEG, WebP up to 5MB
            </p>
          </Box>
        </Stack>
      </Box>

      {/* Action Buttons */}
      <Flex className="gap-3 justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={updateProfileImageMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || updateProfileImageMutation.isPending}
          className="bg-[#1797b9] hover:bg-[#1797b9]/80"
        >
          {updateProfileImageMutation.isPending
            ? "Updating..."
            : "Update Image"}
        </Button>
      </Flex>
    </Stack>
  );
};
