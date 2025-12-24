import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useDeleteUser } from "@/hooks/useDeleteUser";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; name: string; email: string } | null;
}

export const DeleteUserModal = ({
  isOpen,
  onClose,
  user,
}: DeleteUserModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteUserMutation = useDeleteUser();

  const handleDelete = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      await deleteUserMutation.mutateAsync(user.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            This action cannot be undone. This will permanently delete the user{" "}
            <span className="font-semibold text-gray-900">"{user.name}"</span>{" "}
            and remove all associated data including:
          </DialogDescription>
        </DialogHeader>

        <Box className="py-4">
          <Box className="space-y-2 text-sm text-gray-600 max-h-96 overflow-y-auto">
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>User account and profile</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All calendar events created by this user</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All tasks and projects created by this user</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All time entries</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All notifications</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All organization memberships</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All support tickets</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="font-semibold text-red-600">
                The user account itself (permanent deletion)
              </span>
            </Flex>
          </Box>
        </Box>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <Center className="gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </Center>
            ) : (
              <Center className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete User
              </Center>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
