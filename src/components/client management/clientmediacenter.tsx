import React, { useState, useMemo } from "react";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Stack } from "../ui/stack";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  FileText,
  Image as ImageIcon,
  Search,
  Download,
  Eye,
  Calendar,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { Skeleton } from "../ui/skeleton";
import {
  useFetchClientMedia,
  useDeleteMedia,
  type MediaCenterItem,
} from "@/hooks/usefetchclientmedia";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useUser } from "@/providers/user.provider";
import { DeleteMediaModal } from "./DeleteMediaModal";

interface Project {
  id: string;
  projectName: string;
}

export const ClientMediaCenter: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaCenterItem | null>(null);

  const { data: userData } = useUser();
  const clientId = userData?.user?.clientId;

  // Fetch projects
  const { data: projectsResponse, isLoading: projectsLoading } =
    useFetchProjects();
  const projects: Project[] = projectsResponse?.data ?? [];

  // Fetch media with backend filters
  const { data: mediaResponse, isLoading: mediaLoading } = useFetchClientMedia({
    projectId: projectFilter === "all" ? undefined : projectFilter,
    searchTerm: searchTerm || undefined,
    clientId: clientId || undefined,
  });

  const deleteMedia = useDeleteMedia();

  const mediaItems: MediaCenterItem[] = mediaResponse?.data ?? [];

  // Filter and sort media items
  const filteredMedia = useMemo(() => {
    // Start with all media items (backend already filtered by projectId and searchTerm)
    let result = [...mediaItems];

    // Additional client-side filtering (as safety net)
    if (projectFilter !== "all") {
      result = result.filter((item) => item.projectId === projectFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.fileName?.toLowerCase().includes(lowerSearch) ||
          item.projectName?.toLowerCase().includes(lowerSearch) ||
          (item.taskName?.toLowerCase() || "").includes(lowerSearch) ||
          (item.clientName?.toLowerCase() || "").includes(lowerSearch),
      );
    }

    // Apply sorting
    return result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "name":
          return a.fileName.localeCompare(b.fileName);
        default:
          return 0;
      }
    });
  }, [mediaItems, sortBy, projectFilter, searchTerm]);

  const getFileIcon = (type: string) => {
    if (type?.startsWith("image/") || type === "projectImage")
      return <ImageIcon className="w-12 h-12 text-blue-400 opacity-40" />;
    return <FileText className="w-12 h-12 text-blue-400 opacity-40" />;
  };

  const getFileExtension = (fileName: string): string => {
    if (!fileName) return "FILE";
    const ext = fileName.split(".").pop();
    return ext?.toUpperCase() || "FILE";
  };

  const getFormatBadgeStyle = (
    fileName: string,
    fileType: string = "",
  ): string => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    const type = (fileType || "").toLowerCase();

    if (type.includes("pdf") || ext === "pdf") {
      return "bg-rose-600 text-white border-rose-400/50";
    }
    if (
      type.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")
    ) {
      return "bg-blue-600 text-white border-blue-400/50";
    }
    if (
      type.startsWith("video/") ||
      ["mp4", "mov", "avi", "mkv"].includes(ext || "")
    ) {
      return "bg-purple-600 text-white border-purple-400/50";
    }
    if (
      [
        "doc",
        "docx",
        "txt",
        "rtf",
        "xls",
        "xlsx",
        "csv",
        "zip",
        "rar",
        "7z",
      ].includes(ext || "")
    ) {
      return "bg-emerald-600 text-white border-emerald-400/50";
    }
    return "bg-gray-600 text-white border-gray-400/50";
  };

  const handleDownload = async (file: MediaCenterItem): Promise<void> => {
    const toastId = toast.loading(t("common.loading"));

    try {
      let downloadUrl = file.fileUrl;

      // Handle blob URLs
      if (downloadUrl.startsWith("blob:")) {
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        toast.success("Download started", { id: toastId });
        return;
      }

      // For Cloudinary files
      if (
        downloadUrl.includes("cloudinary.com") &&
        downloadUrl.includes("/upload/")
      ) {
        const forcedUrl = downloadUrl.replace(
          "/upload/",
          "/upload/fl_attachment/",
        );
        const link = document.createElement("a");
        link.href = forcedUrl;
        link.target = "_blank";
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started", { id: toastId });
        return;
      }

      // For other files
      const response = await fetch(downloadUrl);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        toast.success("Download started", { id: toastId });
      } else {
        window.open(downloadUrl, "_blank");
        toast.success("Opening in new tab...", { id: toastId });
      }
    } catch (error) {
      console.error("Download failed:", error);
      window.open(file.fileUrl, "_blank");
      toast.success("Opening in new tab...", { id: toastId });
    }
  };

  const handleView = (file: MediaCenterItem): void => {
    window.open(file.fileUrl, "_blank");
  };

  const handleDeleteClick = (file: MediaCenterItem) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFile) return;

    const toastId = toast.loading(t("media.deleting"));
    try {
      await deleteMedia.mutateAsync(selectedFile.fileId);
      toast.success(t("media.deleteSuccess"), { id: toastId });
      setDeleteModalOpen(false);
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("media.deleteError"),
        { id: toastId },
      );
    }
  };

  const isLoading = mediaLoading || projectsLoading;

  return (
    <Stack className="gap-8 w-full">
      {/* Header */}
      <Box className="flex items-center justify-between">
        <Box>
          <h1 className="text-3xl font-medium text-foreground tracking-tight">
            {t("appSidebar.mediaCenter")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("media.desc")}
          </p>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Card className="border-none shadow-sm bg-card p-2 rounded-2xl">
        <CardContent className="p-2">
          <Flex className="gap-3 flex-wrap">
            {/* Search Input */}
            <Box className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("media.searchPlaceholder")}
                className="pl-11 h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none text-foreground font-medium">
                <SelectValue placeholder={t("projects.allProjects")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">{t("projects.allProjects")}</SelectItem>
                {projects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none text-foreground font-medium">
                <SelectValue placeholder={t("media.sortBy")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="newest">{t("media.newest")}</SelectItem>
                <SelectItem value="oldest">{t("media.oldest")}</SelectItem>
                <SelectItem value="name">{t("media.nameAZ")}</SelectItem>
              </SelectContent>
            </Select>
          </Flex>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <Box className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))
        ) : filteredMedia.length > 0 ? (
          // Media items
          filteredMedia.map((file) => (
            <Box
              key={`${file.fileId}-${file.createdAt}`}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-muted hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer border border-border"
            >
              {/* Media Preview */}
              <Box className="w-full h-full flex items-center justify-center pointer-events-none">
                {file.fileType?.startsWith("image/") ||
                file.fileType === "projectImage" ? (
                  <img
                    src={file.fileUrl}
                    alt={file.fileName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : file.fileType?.toLowerCase().includes("pdf") ||
                  file.fileName?.toLowerCase().endsWith(".pdf") ? (
                  <Box className="w-full h-full p-2 overflow-hidden relative pointer-events-none">
                    <iframe
                      src={`${file.fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                      className="w-[110%] h-[110%] -translate-x-[5%] -translate-y-[5%] border-none opacity-80 group-hover:opacity-100 transition-opacity"
                      scrolling="no"
                      title={file.fileName}
                    />
                  </Box>
                ) : (
                  <Box className="flex flex-col items-center">
                    {getFileIcon(file.fileType)}
                    <span className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
                      {file.fileType?.split("/")[1] || "FILE"}
                    </span>
                  </Box>
                )}
              </Box>

              {/* Badges */}
              <Flex className="absolute top-3 left-3 right-3 justify-between items-start z-10 pointer-events-none">
                {/* Project Name Badge */}
                <Box className="transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1">
                  <span className="bg-card/90 backdrop-blur-md text-[9px] font-black px-1.5 py-0.5 rounded-md text-gray-800 shadow-sm border border-white/50">
                    V{file.latestVersion}
                  </span>
                </Box>

                {/* Format Badge */}
                <Box className="transition-transform duration-300 group-hover:-translate-x-1 group-hover:translate-y-1">
                  <span
                    className={`backdrop-blur-md text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm border border-white/20 uppercase tracking-tighter ${getFormatBadgeStyle(
                      file.fileName,
                      file.fileType,
                    )}`}
                  >
                    {getFileExtension(file.fileName)}
                  </span>
                </Box>
              </Flex>

              {/* Always Visible Filename */}
              <Box className="absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-20 group-hover:opacity-0 transition-opacity duration-300">
                <p className="text-white font-bold text-[11px] leading-tight line-clamp-1 drop-shadow-lg">
                  {file.fileName}
                </p>
              </Box>

              {/* Hover Overlay */}
              <Box className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5 z-30">
                <Stack className="gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <Box>
                    <p className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md">
                      {file.fileName}
                    </p>
                    <Flex className="items-center gap-2 mt-2 text-white/60 text-[10px]">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(file.createdAt), "MMM d, yyyy")}
                    </Flex>
                  </Box>

                  <Box className="space-y-1 border-t border-white/10 pt-3">
                    {file.projectName && (
                      <Flex className="items-center gap-2">
                        <Box className="w-1 h-1 rounded-full bg-blue-400" />
                        <p className="text-[10px] font-bold text-blue-300 uppercase tracking-tighter truncate">
                          {file.projectName}
                        </p>
                      </Flex>
                    )}
                    {file.taskName && (
                      <p className="text-[10px] text-white/50 italic truncate">
                        {t("projects.task")}: {file.taskName}
                      </p>
                    )}
                    {file.clientName && (
                      <p className="text-[10px] text-white/50 truncate">
                        {t("projects.client")}: {file.clientName}
                      </p>
                    )}
                    <p className="text-[10px] text-white/30">
                      {t("media.version")} {file.latestVersion}
                    </p>
                  </Box>

                  <Flex className="gap-2 mt-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-card hover:bg-card/90 text-foreground h-9 rounded-xl font-bold text-xs gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(file);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="w-10 h-9 bg-card/10 hover:bg-card/20 text-white backdrop-blur-md rounded-xl p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-10 h-9 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white backdrop-blur-md rounded-xl p-0 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(file);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </Flex>
                </Stack>
              </Box>
            </Box>
          ))
        ) : (
          // Empty state
          <Box className="col-span-full py-24 bg-background rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center text-gray-300">
            <ImageIcon className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-xl font-bold text-muted-foreground">No assets found</p>
            <p className="text-sm">Try broadening your search criteria.</p>
          </Box>
        )}
      </Box>

      {selectedFile && (
        <DeleteMediaModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          fileName={selectedFile.fileName}
          fileType={selectedFile.fileType}
          isDeleting={deleteMedia.isPending}
        />
      )}
    </Stack>
  );
};
