import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, FileText, Image as ImageIcon } from "lucide-react";
import { Flex } from "@/components/ui/flex";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { useTranslation } from "react-i18next";

interface DeleteMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName: string;
  fileType?: string;
  isDeleting: boolean;
}

export const DeleteMediaModal: React.FC<DeleteMediaModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fileName,
  fileType,
  isDeleting,
}) => {
  const { t } = useTranslation();

  const getFileIcon = (type?: string) => {
    if (type?.startsWith("image/") || type === "projectImage")
      return <ImageIcon className="w-8 h-8 text-blue-400" />;
    return <FileText className="w-8 h-8 text-blue-400" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isDeleting && !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border highlight-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <DialogHeader className="space-y-4 pt-4">
          <Center className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </Center>
          <Box className="space-y-2 text-center">
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              {t("media.deleteTitle", "Delete Media")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm font-medium px-4">
              {t("media.confirmDeleteText", "Are you sure you want to permanently delete this file? This action cannot be undone.")}
            </DialogDescription>
          </Box>
        </DialogHeader>

        <Box className="my-6 p-4 rounded-2xl bg-muted/30 border border-border/50 mx-2">
          <Flex className="items-center gap-4">
            <Box className="p-3 bg-card rounded-xl shadow-sm border border-border/50">
              {getFileIcon(fileType)}
            </Box>
            <Box className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {fileName}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">
                {fileType?.split("/")[1] || "FILE"}
              </p>
            </Box>
          </Flex>
        </Box>

        <DialogFooter className="gap-3 p-2 bg-muted/10">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-12 rounded-xl font-bold border-border hover:bg-muted text-foreground transition-all active:scale-95"
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            isLoading={isDeleting}
            className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 transition-all active:scale-95 gap-2"
          >
            {!isDeleting && <Trash2 className="w-4 h-4" />}
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
