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
import { useDeleteOrganization } from "@/hooks/useDeleteOrganization";

interface DeleteOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
  onSuccess?: () => void;
}

export const DeleteOrganizationModal = ({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  onSuccess,
}: DeleteOrganizationModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteOrganizationMutation = useDeleteOrganization();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteOrganizationMutation.mutateAsync(organizationId);
      onClose();
      // Call onSuccess callback if provided (e.g., to redirect)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to delete organization:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Organization
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            This action cannot be undone. This will permanently delete the
            organization{" "}
            <span className="font-semibold text-gray-900">
              "{organizationName}"
            </span>{" "}
            and remove all associated data including:
          </DialogDescription>
        </DialogHeader>

        <Box className="py-4">
          <Box className="space-y-2 text-sm text-gray-600 max-h-96 overflow-y-auto">
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All user memberships and relationships</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All subscription data and payment history</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All projects and project comments</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All tasks and time entries</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All invoices and payment links</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All clients and client data</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All calendar events</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All notifications and activities</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All audit logs and user management records</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>All invitations and support tickets</span>
            </Flex>
            <Flex className="items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="font-semibold text-red-600">
                The organization itself (permanent deletion)
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
                Delete Organization
              </Center>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
