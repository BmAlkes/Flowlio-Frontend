import { IoArrowBack } from "react-icons/io5";
import { PageWrapper } from "../common/pagewrapper";
import { Box } from "../ui/box";
import { useNavigate, useParams } from "react-router";
import { Center } from "../ui/center";
import { Button } from "../ui/button";
import { useFetchProjectById } from "../../hooks/usefetchprojects";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  User,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Edit,
  Download,
  MessageCircle,
  Users,
  BarChart3,
  Eye,
  EyeIcon,
  Globe,
  Lock,
  Upload,
  Copy,
  Loader2,
} from "lucide-react";
import { useSaveProjectAsTemplate } from "@/hooks/useProjectTemplates";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "../common/generalmodal";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Flex } from "../ui/flex";
import { Input } from "../ui/input";
import { Stack } from "../ui/stack";
import { Trash2 } from "lucide-react";
import { useFetchProjectComments } from "@/hooks/usefetchprojectcomments";
import { useCreateProjectComment } from "@/hooks/usecreateprojectcomment";
import { useDeleteProjectComment } from "@/hooks/usedeleteprojectcomment";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUpdateProject } from "@/hooks/useupdateproject";
import { ProjectExpenses } from "./ProjectExpenses";
import { FileVersionHistoryModal } from "../common/fileversionhistorymodal";
import { useUploadFileVersion } from "@/hooks/useuploadfileversion";
import { Attachment } from "@/types";
import { useFetchCustomFields } from "@/hooks/usecustomfields";
import { useFetchOrganizationUsers } from "@/hooks/usefetchorganizationusers";

import { useUser } from "@/providers/user.provider";
import { useTranslation } from "react-i18next";
import { canViewInternalProjectFinancials } from "@/utils/projectFinancialAccess";

export const ProjectView = () => {
  const { t } = useTranslation();
  const { data: userData } = useUser();
  const user = userData?.user;
  const isClient = user?.role === "client";
  const showProjectFinancials = canViewInternalProjectFinancials(user);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: projectData, isLoading: projectLoading, error } = useFetchProjectById(id || "");
  const { data: customFieldsData } = useFetchCustomFields("project");
  const { data: usersData, isLoading: usersLoading } = useFetchOrganizationUsers();

  const isLoading = projectLoading || usersLoading;

  const { open, onOpenChange } = useGeneralModalDisclosure();

  // Comment state management
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // API hooks for comments
  const { data: commentsData, isLoading: commentsLoading } =
    useFetchProjectComments(id || "");
  const { mutate: createComment, isPending: isCreatingComment } =
    useCreateProjectComment();
  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeleteProjectComment();

  // Local state for inline edits (initialized with safe defaults)
  const [editStatus, setEditStatus] = useState<string>("pending");
  const [editProgress, setEditProgress] = useState<number>(0);

  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<Attachment | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadVersion = useUploadFileVersion();

  // Template saving state
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const { mutate: saveAsTemplate, isPending: isSavingTemplate } =
    useSaveProjectAsTemplate();

  // Sync local edit fields when project data loads/changes
  useEffect(() => {
    const pd = projectData?.data;
    if (pd) {
      setEditStatus(pd.status || "pending");
      setEditProgress(pd.progress ?? 0);
    }
  }, [projectData?.data]);

  if (isLoading) {
    return (
      <PageWrapper className="mt-6 p-6">
        {/* Header Skeleton */}
        <Box className="flex items-center justify-between mb-6">
          <Box className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </Box>
        </Box>

        {/* Project Header Card Skeleton */}
        <Card className="mb-6 border-0 shadow-xl">
          <CardHeader className="pb-6">
            <Box className="flex items-start justify-between">
              <Box className="flex-1">
                <Skeleton className="h-8 w-64 mb-3" />
                <Box className="flex items-center gap-6 mb-6">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-28" />
                </Box>
                <Skeleton className="h-3 w-full" />
              </Box>
              <Skeleton className="h-8 w-20" />
            </Box>
          </CardHeader>
        </Card>

        {/* Main Content Grid Skeleton */}
        <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column Skeleton */}
          <Box className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </Box>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-56" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-96 w-full" />
              </CardContent>
            </Card>
          </Box>

          {/* Right Column Skeleton */}
          <Box className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </PageWrapper>
    );
  }

  if (error || !projectData?.data) {
    return (
      <PageWrapper className="mt-6 p-6">
        <Box className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600 text-center">
            {error?.message || t("projects.projectNotFound")}
          </p>
          <Center className="mt-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              {t("common.back")}
            </Button>
          </Center>
        </Box>
      </PageWrapper>
    );
  }

  const project = projectData.data;

  const handleQuickUpdate = () => {
    if (!id) return;
    // Normalize: treat "active" as "ongoing" for storage if needed
    const normalizedStatus = editStatus === "active" ? "ongoing" : editStatus;
    updateProject({
      id,
      data: { status: normalizedStatus as any, progress: editProgress },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "ongoing":
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-muted text-gray-800 border-border";
    }
  };

  const handleEdit = () => {
    navigate(`/dashboard/project/edit/${project.id}`);
  };

  const handleDownload = () => {
    if (project.contractfile) {
      const link = document.createElement("a");
      link.href = project.contractfile;
      link.download = `${project.projectName || "project"}-contract.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t("projects.contractDownloaded"));
    } else {
      toast.error(t("projects.noContractFile"));
    }
  };

  const handleOpenHistory = () => {
    if (!project.contractfile) return;

    // Create a virtual attachment for the contract if it doesn't have one
    const contractAttachment: Attachment = {
      id: (project as any).contractFileId || "contract-" + project.id,
      name: (project.projectName || "Project") + "-Contract.pdf",
      url: project.contractfile,
      size: 0,
      type: "application/pdf",
      versions: (project as any).contractVersions || [],
    };

    setActiveAttachment(contractAttachment);
    setHistoryModalOpen(true);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    const attachmentId =
      (project as any).contractFileId || "contract-" + project.id;

    if (file) {
      try {
        await uploadVersion.mutateAsync({
          attachmentId: attachmentId,
          file,
        });
        toast.success(t("projects.versionUploaded"));
      } catch (error) {
        toast.error(t("projects.uploadFailed"));
      }
    }
    // Reset input
    if (event.target) event.target.value = "";
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onOpenChange(true);
  };

  const handleOpenInNewTab = (url: string) => {
    window.open(url, "_blank");
  };

  // Comment handling functions
  const handleAddComment = (parentId?: string) => {
    if (!id || !input.trim()) return;

    createComment({
      projectId: id,
      content: input.trim(),
      parentId: parentId || undefined,
    });

    setInput("");
    setReplyTo(null);
    setReplyContent("");
  };

  const handleAddReply = () => {
    if (!id || !replyTo || !replyContent.trim()) return;

    createComment({
      projectId: id,
      content: replyContent.trim(),
      parentId: replyTo,
    });

    setReplyTo(null);
    setReplyContent("");
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
  };

  const openCommentModal = () => {
    onOpenChange(true);
    setInput("");
    setReplyTo(null);
    setReplyContent("");
  };

  const handleSaveAsTemplate = () => {
    if (!id || !templateNameInput.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    saveAsTemplate(
      {
        projectId: id,
        templateName: templateNameInput.trim(),
        description: project.description || "",
      },
      {
        onSuccess: () => {
          setIsSaveTemplateModalOpen(false);
          setTemplateNameInput("");
        },
      },
    );
  };

  // Get comments for the current project from API
  const commentsWithReplies = commentsData?.data || [];
  const projectComments = commentsData?.data || [];

  return (
    <PageWrapper className="mt-6 p-6">
      {/* Header */}
      <Box className="flex items-center justify-between mb-6">
        <Box className="flex items-center gap-4">
          <Box
            className="flex items-center gap-2 w-20 cursor-pointer transition-all duration-300 hover:bg-muted rounded-full hover:p-2"
            onClick={() => navigate(-1)}
          >
            <IoArrowBack />
            <p className="text-foreground">{t("common.back")}</p>
          </Box>

          {/* Breadcrumb */}
          <Box className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="link"
              className="p-0 h-auto text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/dashboard/project")}
            >
              {t("appSidebar.projects")}
            </Button>
            <span>/</span>
            <span className="text-foreground font-medium">
              {project.projectName}
            </span>
          </Box>
        </Box>
      </Box>

      {/* Project Header Card */}
      <Card className="mb-6 border border-border/60 shadow-xl bg-gradient-to-r from-blue-500/5 via-white dark:via-card/80 to-purple-50 dark:from-blue-500/10 dark:to-purple-900/10">
        <CardHeader className="pb-6">
          <Box className="flex items-start justify-between max-sm:flex-col-reverse max-sm:gap-4">
            <Box className="flex-1">
              <CardTitle className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                {project.projectName || t("projects.untitled")}
              </CardTitle>
              <Box className="flex items-center gap-6 mb-6">
                <Badge
                  variant="outline"
                  className={`${getStatusColor(
                    project.status,
                  )} flex items-center gap-2 px-4 py-2 text-sm font-medium`}
                >
                  {getStatusIcon(project.status)}
                  {project.status?.charAt(0).toUpperCase() +
                    project.status?.slice(1)}
                </Badge>
                <Box className="flex items-center gap-2 text-sm text-muted-foreground bg-card/70 px-3 py-2 rounded-full">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">
                    {t("projects.progress")}: {project.progress}%
                  </span>
                </Box>
                <Box className="flex items-center gap-2 text-sm text-muted-foreground bg-card/70 px-3 py-2 rounded-full">
                  <Building2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    {project.clientName || t("common.noClient")}
                  </span>
                </Box>
                <Box className="flex items-center gap-2 text-sm text-muted-foreground bg-card/70 px-3 py-2 rounded-full">
                  {(project as any).visibility === "private" ? (
                    <Lock className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Globe className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="font-medium">
                    {(project as any).visibility === "private"
                      ? t("projects.private")
                      : t("projects.public")}
                  </span>
                </Box>
              </Box>
              <Box className="relative">
                <Progress
                  value={project.progress}
                  className="w-full h-3 bg-muted rounded-full overflow-hidden"
                />
                <Box className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-20"></Box>
              </Box>
            </Box>
            <Box className="flex flex-col gap-3 ">
              {project.contractfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-card hover:bg-blue-50 border-blue-200 text-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Contract
                </Button>
              )}
            </Box>
          </Box>
        </CardHeader>
      </Card>

      {/* Main Content Grid */}
      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Details */}
        <Box className="lg:col-span-2 space-y-6">
          {/* Project Information */}
          <Card className="border border-border/60 shadow-lg bg-gradient-to-br from-white dark:from-card to-blue-50/30 dark:to-blue-900/10 p-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5" />
                {t("projects.projectInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box className="flex items-center gap-4 p-4 bg-card/70 rounded-lg border border-blue-100 dark:border-blue-900/40">
                  <Box className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </Box>
                  <Box>
                    <p className="text-sm text-muted-foreground font-medium">
                      {t("projects.projectNumber")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {project.projectNumber}
                    </p>
                  </Box>
                </Box>
                <Box className="flex items-center gap-4 p-4 bg-card/70 rounded-lg border border-green-100 dark:border-green-900/40">
                  <Box className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </Box>
                  <Box>
                    <p className="text-sm text-muted-foreground font-medium">
                      {t("projects.assignedTo")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {(() => {
                        const assignee = usersData?.data?.userMembers?.find(
                          (u) =>
                            u.user?.id === project.assignedTo ||
                            u.id === project.assignedTo,
                        );
                        return (
                          assignee?.user?.name ||
                          project.assignedProject ||
                          t("common.unassigned")
                        );
                      })()}
                    </p>
                  </Box>
                </Box>
                <Box className="flex items-center gap-4 p-4 bg-card/70 rounded-lg border border-purple-100 dark:border-purple-900/40">
                  <Box className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </Box>
                  <Box>
                    <p className="text-sm text-muted-foreground font-medium">
                      {t("projects.startDate")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {project.startDate
                        ? format(new Date(project.startDate), "MMM dd, yyyy")
                        : "Not set"}
                    </p>
                  </Box>
                </Box>
                <Box className="flex items-center gap-4 p-4 bg-card/70 rounded-lg border border-orange-100 dark:border-orange-900/40">
                  <Box className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </Box>
                  <Box>
                    <p className="text-sm text-muted-foreground font-medium">
                      {t("projects.endDate")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {project.endDate
                        ? format(new Date(project.endDate), "MMM dd, yyyy")
                        : "Not set"}
                    </p>
                  </Box>
                </Box>
              </Box>

              {project.address && (
                <Box className="flex items-start gap-4 p-4 bg-card/70 rounded-lg border border-border">
                  <Box className="p-2 bg-muted rounded-full mt-1">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </Box>
                  <Box>
                    <p className="text-sm text-muted-foreground font-medium mb-1">
                      {t("projects.addressLabel")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {project.address}
                    </p>
                  </Box>
                </Box>
              )}

              {project.description && (
                <Box className="p-4 bg-card/70 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground font-medium mb-3">
                    {t("projects.projectDescriptionLabel")}
                  </p>
                  <p className="text-foreground leading-relaxed bg-card p-4 rounded-lg border border-border">
                    {project.description}
                  </p>
                </Box>
              )}

              {/* Custom Fields Section */}
              {customFieldsData?.data &&
                customFieldsData.data.length > 0 &&
                project.customFields &&
                Object.keys(project.customFields).length > 0 && (
                  <Box className="mt-6 pt-6 border-t border-border">
                    <span className="text-lg font-semibold text-gray-800 mb-4 block">
                      {t("projects.customFields")}
                    </span>
                    <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customFieldsData.data.map((field) => {
                        const value = project.customFields?.[field.id];
                        if (
                          value === undefined ||
                          value === null ||
                          value === ""
                        )
                          return null;

                        let displayValue = value;
                        if (field.type === "boolean") {
                          displayValue =
                            value === "true" || value === true ? "Yes" : "No";
                        } else if (field.type === "date" && value) {
                          try {
                            displayValue = new Date(value).toLocaleDateString();
                          } catch (e) {
                            displayValue = value;
                          }
                        }

                        return (
                          <Box
                            key={field.id}
                            className="p-3 border border-blue-50 rounded-lg bg-card shadow-sm flex flex-col min-w-0"
                          >
                            <span className="text-xs font-medium text-muted-foreground block mb-1 truncate" title={field.name}>
                              {field.name}
                            </span>
                            <Flex className="items-start gap-2">
                              {field.type === "select" && field.options && (
                                <div
                                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                  style={{
                                    backgroundColor:
                                      field.options.find(
                                        (opt: any) => opt.label === value,
                                      )?.color || "transparent",
                                  }}
                                />
                              )}
                              <span className="text-sm text-gray-800 font-semibold capitalize break-words overflow-hidden break-all" style={{ wordBreak: 'break-word' }}>
                                {String(displayValue)}
                              </span>
                            </Flex>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
            </CardContent>
          </Card>

          {/* Project Documents Showcase */}
          <Card className="border border-border/60 shadow-lg bg-gradient-to-br from-white dark:from-card to-purple-50/30 dark:to-purple-900/10 p-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5" />
                Contract Document Showcase
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Box className="space-y-6">
                {/* Contract File Showcase */}
                {project.contractfile ? (
                  <Box className="space-y-4">
                    {/* PDF Showcase */}
                    <Box className="border-2 border-border rounded-lg overflow-hidden shadow-sm">
                      <Box className="bg-muted/50 p-4 border-b">
                        <Box className="flex items-center justify-between">
                          <Box className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-foreground">
                              {project.projectName || "Project"}-Contract.pdf
                            </span>
                          </Box>
                          <Flex className="max-sm:flex-col">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewImage(project.contractfile!)
                              }
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View Full Screen
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleOpenHistory}
                              className="flex items-center gap-1"
                            >
                              <Clock className="h-4 w-4" />
                              History
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleUploadClick}
                              className="flex items-center gap-1"
                              disabled={uploadVersion.isPending}
                            >
                              <Upload className="h-4 w-4" />
                              Update
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenInNewTab(project.contractfile!)
                              }
                              className="flex items-center gap-1"
                            >
                              <EyeIcon className="h-4 w-4" />
                              Open in New Tab
                            </Button>
                          </Flex>
                        </Box>
                      </Box>

                      {/* PDF Preview */}
                      <Box className="h-[500px] bg-card">
                        <iframe
                          src={`${project.contractfile}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                          className="w-full h-full border-0"
                          title="Contract Document Preview"
                          onError={(e) => {
                            console.error("PDF failed to load:", e);
                            const iframe = e.target as HTMLIFrameElement;
                            iframe.style.display = "none";
                            const fallback =
                              iframe.parentElement?.querySelector(
                                ".pdf-fallback",
                              ) as HTMLElement;
                            if (fallback) fallback.style.display = "block";
                          }}
                        />

                        {/* Fallback for PDF viewing */}
                        <Box
                          className="pdf-fallback hidden h-full flex-col items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => handleViewImage(project.contractfile!)}
                        >
                          <FileText className="h-20 w-20 text-muted-foreground mb-4" />
                          <p className="text-xl font-medium text-foreground mb-2">
                            Contract Document
                          </p>
                          <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                            Click to view the contract file in full screen
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleOpenInNewTab(project.contractfile!)
                            }
                          >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Open in New Tab
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No Contract File
                    </h3>
                    <p className="text-muted-foreground">
                      This project doesn't have a contract file uploaded.
                    </p>
                  </Box>
                )}

                {/* Document Information */}
                {project.contractfile && (
                  <Box className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                    <Box className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        Document Information
                      </span>
                    </Box>
                    <Box className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                      <p>
                        • Contract document for{" "}
                        {project.projectName || "this project"}
                      </p>
                      <p>
                        • Click "View Full Screen" to open in modal with full
                        PDF controls
                      </p>

                      <p>
                        • Click "Open in New Tab" to view in your browser's PDF
                        viewer
                      </p>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Financial tracking: org owner / platform admins only — never clients */}
          {showProjectFinancials && (
            <ProjectExpenses
              projectId={project.id}
              budget={(project as any).budget || 0}
              isClient={isClient}
            />
          )}
        </Box>

        {/* Right Column - Sidebar */}
        <Box className="space-y-6">
          {/* Client Information */}
          <Card className="border border-border/60 shadow-lg bg-gradient-to-br from-white dark:from-card to-green-50/30 dark:to-green-900/10 p-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Building2 className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Box className="flex items-center gap-4 p-4 bg-card/70 rounded-lg border border-green-100 dark:border-green-900/40">
                <Avatar className="h-12 w-12 bg-gradient-to-r from-green-500/50 to-emerald-500">
                  <AvatarImage
                    src={project.clientImage}
                    alt={project.clientName}
                  />
                  <AvatarFallback className="text-white font-semibold">
                    {project.clientName?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <Box>
                  <p className="font-semibold text-foreground text-lg capitalize">
                    {project.clientName || "Unknown Client"}
                  </p>
                  <p className="text-sm text-muted-foreground bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full inline-block">
                    Client
                  </p>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Project Stats */}
          <Card className="border border-border/60 shadow-lg bg-gradient-to-br from-white dark:from-card to-blue-50/30 dark:to-blue-900/10 p-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5" />
                Project Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
              <Box className="p-4 bg-card/70 rounded-lg border border-blue-100 dark:border-blue-900/40">
                <Box className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground font-medium">
                    Progress
                  </span>
                  <span className="font-bold text-blue-600 text-lg">
                    {editProgress}%
                  </span>
                </Box>
                <Box className="flex items-center gap-3">
                  {!isClient && (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={editProgress || 0}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (isNaN(value)) return;
                        setEditProgress(Math.max(0, Math.min(100, value)));
                      }}
                      className="w-24 bg-card"
                      placeholder="0"
                    />
                  )}
                  <Progress
                    value={editProgress}
                    className="h-3 bg-muted flex-1"
                  />
                </Box>
              </Box>

              <Separator className="bg-muted" />

              <Box className="p-4 bg-card/70 rounded-lg border border-border">
                <Stack className="justify-between">
                  <Flex className="text-sm text-muted-foreground font-medium justify-start items-start">
                    Status
                  </Flex>
                  <Box className="flex items-center gap-3">
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger className="w-36 bg-card">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(
                        editStatus,
                      )} flex items-center gap-1 px-3 py-1`}
                    >
                      {getStatusIcon(editStatus)}
                      {editStatus?.charAt(0).toUpperCase() +
                        editStatus?.slice(1)}
                    </Badge>
                  </Box>
                </Stack>
              </Box>

              {!isClient && (
                <Button
                  onClick={handleQuickUpdate}
                  disabled={isUpdating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              )}

              {isClient && editStatus === "completed" && (
                <Button
                  onClick={() => {
                    handleAddComment("I approve this project completion.");
                    toast.success("Project approved!");
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                >
                  Approve Project
                </Button>
              )}

              <Box className="p-4 bg-card/70 rounded-lg border border-border">
                <Box className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-medium">
                    Created
                  </span>
                  <span className="font-semibold text-foreground">
                    {format(new Date(project.createdAt), "MMM dd, yyyy")}
                  </span>
                </Box>
              </Box>

              <Box className="p-4 bg-card/70 rounded-lg border border-border">
                <Box className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-medium">
                    Last Updated
                  </span>
                  <span className="font-semibold text-foreground">
                    {format(new Date(project.updatedAt), "MMM dd, yyyy")}
                  </span>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-border/60 shadow-lg bg-gradient-to-br from-white dark:from-card to-purple-50/30 dark:to-purple-900/10 p-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {!isClient && (
                <Button
                  variant="outline"
                  className="w-full justify-start bg-card hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-400 cursor-pointer"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
              )}

              {!isClient && (
                <Button
                  variant="outline"
                  className="w-full justify-start bg-card hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 cursor-pointer"
                  onClick={() => {
                    setTemplateNameInput(project.projectName || "");
                    setIsSaveTemplateModalOpen(true);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Save as Template
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start bg-card hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 cursor-pointer"
                onClick={openCommentModal}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                View Comments ({projectComments.length})
              </Button>
            </CardContent>
          </Card>

          {/* Additional Project PDFs */}
          <Card className="border border-border/60 shadow-lg bg-gradient-to-br from-white dark:from-card to-orange-50/30 dark:to-orange-900/10 p-0">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5" />
                Project PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Box className="space-y-4">
                {/* Project PDF */}
                {project.projectFiles?.projectPdf ? (
                  <Box className="border border-border rounded-lg p-4 bg-gradient-to-r from-blue-500/5 to-indigo-50 dark:to-indigo-900/10">
                    <Box className="flex items-center justify-between mb-3">
                      <Box className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-foreground">
                          Project PDF
                        </span>
                      </Box>
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-100 text-blue-800"
                      >
                        PDF Document
                      </Badge>
                    </Box>

                    <Box className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {project.projectFiles.projectPdf.name}
                      </p>

                      <Box className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleOpenInNewTab(
                              project.projectFiles?.projectPdf?.url || "",
                            )
                          }
                          className="flex items-center gap-1 bg-card hover:bg-blue-50 cursor-pointer"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View PDF
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href =
                              project.projectFiles?.projectPdf?.url || "";
                            link.download =
                              project.projectFiles?.projectPdf?.name || "";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast.success("Project PDF downloaded!");
                          }}
                          className="flex items-center gap-1 bg-card hover:bg-blue-50 cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/50">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No project PDF uploaded
                    </p>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* PDF Showcase Modal */}
      <GeneralModal
        contentProps={{
          className: "max-w-full p-2 overflow-hidden",
        }}
        open={open && selectedImage !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedImage(null);
          }
          onOpenChange(isOpen);
        }}
      >
        {selectedImage && (
          <Box className="w-full h-[90vh] flex flex-col">
            {/* Modal Header */}
            <Box className="flex items-center justify-between p-4 border-b bg-muted/50">
              <Box className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                <span className="font-medium text-foreground">
                  {project.projectName || "Project"}-Contract.pdf
                </span>
                <Badge variant="outline" className="text-xs">
                  Contract Document
                </Badge>
              </Box>
            </Box>

            {/* PDF Showcase Viewer */}
            <Box className="flex-1 bg-card">
              <iframe
                src={`${selectedImage}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                className="w-full h-full border-0"
                title="Contract Document Showcase"
                onError={(e) => {
                  console.error("PDF failed to load in modal:", e);
                  toast.error(
                    "Failed to load PDF. Please try opening in a new tab.",
                  );
                }}
              />
            </Box>

            {/* Modal Footer */}
            <Box className="p-4 border-t bg-muted/50">
              <Box className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Contract document for {project.projectName || "this project"}
                </span>
                <span>Use the PDF controls above to navigate and zoom</span>
              </Box>
            </Box>
          </Box>
        )}
      </GeneralModal>

      {/* Comments Modal */}
      <GeneralModal
        {...{ open: open && selectedImage === null, onOpenChange }}
        contentProps={{ className: "overflow-hidden max-sm:p-3" }}
      >
        <Box>
          <Box className="mb-4 text-lg font-semibold">
            Project Comments - {project.projectName}
          </Box>

          {/* Comments list with nested replies */}
          <Box className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-4 bg-muted/50 p-3 rounded">
            {commentsLoading ? (
              <Box className="text-muted-foreground text-center py-4">
                Loading comments...
              </Box>
            ) : commentsWithReplies.length === 0 ? (
              <Box className="text-muted-foreground text-center py-4">
                No comments yet. Be the first to add a comment!
              </Box>
            ) : (
              commentsWithReplies.map((comment) => (
                <Box key={comment.id} className="space-y-2">
                  {/* Main comment */}
                  <Box className="flex items-start gap-2 group">
                    <Flex className="flex-1 items-start justify-between bg-card p-3 rounded shadow-sm text-sm">
                      <Stack className="flex-1">
                        <Flex className="justify-between">
                          <Box className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs text-foreground">
                              {comment.userName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(comment.createdAt),
                                "MMM d, yyyy hh:mm a",
                              )}
                            </span>
                          </Box>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 cursor-pointer p-1 h-auto text-xs"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isDeletingComment}
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </Flex>

                        <Box className="w-full max-sm:w-48 overflow-hidden break-words whitespace-pre-line">
                          {comment.content}
                        </Box>

                        {/* Reply button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 cursor-pointer p-1 h-auto text-xs mt-2 hidden"
                          onClick={() => {
                            setReplyTo(
                              replyTo === comment.id ? null : comment.id,
                            );
                            setReplyContent("");
                          }}
                        >
                          {replyTo === comment.id ? "Cancel Reply" : "Reply"}
                        </Button>
                      </Stack>
                    </Flex>
                  </Box>

                  {/* Reply input for this comment */}
                  {replyTo === comment.id && (
                    <Box className="ml-6 bg-card p-2 rounded border">
                      <Input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="mb-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddReply();
                        }}
                      />
                      <Box className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleAddReply}
                          disabled={!replyContent.trim() || isCreatingComment}
                          className="bg-blue-600 hover:bg-blue-700 text-xs"
                        >
                          {isCreatingComment ? "Adding..." : "Reply"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyTo(null);
                            setReplyContent("");
                          }}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* Render replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <Box className="ml-6 space-y-2">
                      {comment.replies.map((reply) => (
                        <Box key={reply.id} className="flex items-start gap-2">
                          <Flex className="flex-1 items-start justify-between bg-card p-2 rounded shadow-sm text-sm border-l-2 border-blue-200">
                            <Stack className="flex-1">
                              <Box className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-xs text-foreground">
                                  {reply.userName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(reply.createdAt),
                                    "MMM d, yyyy hh:mm a",
                                  )}
                                </span>
                              </Box>
                              <Box className="w-full max-sm:w-40 overflow-hidden break-words whitespace-pre-line">
                                {reply.content}
                              </Box>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 cursor-pointer p-1 h-auto text-xs mt-1"
                                onClick={() => handleDeleteComment(reply.id)}
                                disabled={isDeletingComment}
                                title={t("common.delete")}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </Stack>
                          </Flex>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))
            )}
          </Box>

          {/* Add new comment */}
          <Flex className="items-center justify-between">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a comment..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddComment();
              }}
              className="bg-background rounded-full placeholder:text-muted-foreground h-11 border border-gray-400"
            />

            <Button
              onClick={() => handleAddComment()}
              disabled={!input.trim() || isCreatingComment}
              className="rounded-full h-11 cursor-pointer"
            >
              {isCreatingComment ? "Sending..." : "Send"}
            </Button>
          </Flex>
        </Box>
      </GeneralModal>
      {/* File Version History Modal */}
      {activeAttachment && (
        <FileVersionHistoryModal
          isOpen={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false);
            setActiveAttachment(null);
          }}
          fileName={activeAttachment.name}
          attachmentId={activeAttachment.id}
        />
      )}

      {/* Save as Template Modal */}
      <GeneralModal
        open={isSaveTemplateModalOpen}
        onOpenChange={setIsSaveTemplateModalOpen}
        contentProps={{ className: "sm:max-w-[425px]" }}
      >
        <Box className="p-4">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Copy className="h-5 w-5 text-indigo-600" />
            Save as Project Template
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            This will create a reusable template with all current tasks from
            this project. You can use it to quickly set up similar projects in
            the future.
          </p>

          <Stack className="gap-4">
            <Box>
              <label className="text-sm font-medium mb-1.5 block">
                Template Name
              </label>
              <Input
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                placeholder="e.g., Marketing Campaign Template"
                className="rounded-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveAsTemplate();
                }}
              />
            </Box>

            <Flex className="gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setIsSaveTemplateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleSaveAsTemplate}
                disabled={isSavingTemplate || !templateNameInput.trim()}
              >
                {isSavingTemplate ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Create Template"
                )}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </GeneralModal>

      {/* Hidden File Input for Version Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </PageWrapper>
  );
};
