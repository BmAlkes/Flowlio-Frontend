import React from "react";
import {
  X,
  Download,
  Calendar,
  User,
  FileText,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { FileVersion } from "@/types";
import { useFetchFileVersions } from "@/hooks/usefetchfileversions";
import { cn } from "@/lib/utils";

interface FileVersionHistoryModalProps {
  fileName: string;
  attachmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore?: (version: FileVersion) => void;
}

export const FileVersionHistoryModal: React.FC<FileVersionHistoryModalProps> = ({
  fileName,
  attachmentId,
  isOpen,
  onClose,
  onRestore,
}) => {
  const { data: versionsResponse, isLoading } = useFetchFileVersions(attachmentId);

  if (!isOpen) return null;

  const versions = versionsResponse?.data || [];
  const sortedVersions = [...versions].sort(
    (a, b) => b.versionNumber - a.versionNumber
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Box className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <Box
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Box className="relative bg-background rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border border-border">
        {/* Header */}
        <Flex className="justify-between p-6 border-b border-border bg-gray-50/50">
          <Stack className="gap-1">
            <h2 className="text-xl font-bold text-foreground">Version History</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {fileName}
            </p>
          </Stack>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full hover:bg-muted w-8 h-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </Flex>

        {/* Content */}
        <Box className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <Box className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p>Fetching version history...</p>
            </Box>
          ) : sortedVersions.length === 0 ? (
            <Box className="text-center py-10 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No previous versions found.</p>
            </Box>
          ) : (
            <Stack className="gap-4">
              {sortedVersions.map((version, index) => (
                <Box
                  key={version.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    index === 0
                      ? "bg-blue-50/50 border-blue-200"
                      : "bg-card border-border hover:border-border"
                  )}
                >
                  <Flex className="justify-between items-start mb-3">
                    <Stack className="gap-1">
                      <Flex className="gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-900 text-white uppercase">
                          V{version.versionNumber}
                        </span>
                        {index === 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-500 text-white uppercase">
                            Current
                          </span>
                        )}
                      </Flex>
                      <p className="text-sm font-semibold text-foreground truncate max-w-[300px]" title={version.name}>
                        {version.name}
                      </p>
                    </Stack>
                    <Flex className="gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => window.open(version.url, "_blank")}
                        title="Preview"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = version.url;
                          link.download = version.name;
                          link.click();
                        }}
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </Flex>
                  </Flex>

                  <Flex className="justify-between items-center text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border">
                    <Flex className="gap-4">
                      <Flex className="gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(version.createdAt), "MMM d, yyyy • h:mm a")}
                      </Flex>
                      <Flex className="gap-1.5">
                        <User className="w-3 h-3" />
                        {version.uploadedByName || "Unknown"}
                      </Flex>
                    </Flex>
                    <span className="font-medium">{formatFileSize(version.size)}</span>
                  </Flex>
                  
                  {index !== 0 && onRestore && (
                    <Button 
                      variant="link" 
                      className="text-xs p-0 h-auto text-blue-600 font-semibold mt-3"
                      onClick={() => onRestore(version)}
                    >
                      Restore this version
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Footer */}
        <Flex className="p-4 border-t border-border bg-gray-50/30 justify-end">
          <Button variant="secondary" onClick={onClose} className="rounded-full px-6">
            Close
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};
