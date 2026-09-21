import { IoArrowBack } from "react-icons/io5";
import { DeliveryReviews } from "./DeliveryReviews";
import { PageWrapper } from "../common/pagewrapper";
import { Box } from "../ui/box";
import { Link, useNavigate, useParams } from "react-router";
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
import { useFetchProjectComments } from "@/hooks/usefetchprojectcomments";
import { useCreateProjectComment } from "@/hooks/usecreateprojectcomment";
import { CommentThread } from "@/components/common/CommentThread";
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

  // Fetch comments count for badge
  const { data: commentsData } = useFetchProjectComments(id || "");
  const { mutate: createComment } = useCreateProjectComment();

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
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
      default:
        return "bg-muted text-foreground border-border";
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
      } catch {
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
  const openCommentModal = () => {
    onOpenChange(true);
  };

  const handleApproveProject = () => {
    if (!id) return;
    createComment({
      projectId: id,
      content: "I approve this project completion.",
    });
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

  const projectComments = commentsData?.data || [];

  return (
    <PageWrapper className="mt-4 min-w-0 border-0 bg-transparent p-3 sm:p-5 lg:p-6">
      {/* Header */}
      <Box className="mb-5 flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-2"
            onClick={() => navigate(-1)}
          >
            <IoArrowBack className="rtl:rotate-180" />
            {t("common.back")}
          </Button>

          {/* Breadcrumb */}
          <nav aria-label={t("appSidebar.projects")} className="flex min-w-0 items-center gap-2 border-s border-border ps-3 text-sm text-muted-foreground">
            <Button
              variant="link"
              className="h-auto shrink-0 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/dashboard/project")}
            >
              {t("appSidebar.projects")}
            </Button>
            <span>/</span>
            <span className="truncate font-medium text-foreground" aria-current="page">
              {project.projectName}
            </span>
          </nav>
      </Box>

      {/* Project Header Card */}
      <Card className="mb-6 gap-0 overflow-hidden border-border p-0 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-[#1797ba] via-blue-600 to-purple-600" />
        <CardHeader className="p-5 sm:p-6">
          <Box className="flex flex-col items-start justify-between gap-5 xl:flex-row">
            <Box className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">{t("projects.projectNumber")} <span className="ms-1 text-foreground">{project.projectNumber || "—"}</span></p>
              <h1 className="mb-4 break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {project.projectName || t("projects.untitled")}
              </h1>
              <Box className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Badge
                  variant="outline"
                  className={`${getStatusColor(
                    project.status,
                  )} flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium`}
                >
                  {getStatusIcon(project.status)}
                  {t(`projects.statusValue.${project.status}`)}
                </Badge>
                <Box className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                  <span className="break-words font-medium">
                    {project.clientName || t("common.noClient")}
                  </span>
                </Box>
                <Box className="flex items-center gap-2 text-sm text-muted-foreground">
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
            </Box>
            <Box className="flex w-full flex-wrap gap-2 xl:w-auto xl:justify-end">
              {!isClient && <Button onClick={handleEdit} className="gap-2 bg-[#11718c] text-white hover:bg-[#0e6078]"><Edit className="h-4 w-4" />{t("projectView.edit")}</Button>}
              <Button variant="outline" onClick={openCommentModal} className="gap-2"><MessageCircle className="h-4 w-4" />{t("projectView.comments")}<span className="rounded bg-muted px-1.5 text-xs tabular-nums">{projectComments.length}</span></Button>
              {project.contractfile && (
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t("projectView.contract")}
                </Button>
              )}
            </Box>
          </Box>
        </CardHeader>
        <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <div className="flex items-center justify-between gap-4 text-sm sm:min-w-40"><span className="text-muted-foreground">{t("projects.progress")}</span><span className="font-semibold tabular-nums">{project.progress ?? 0}%</span></div>
          <Progress aria-label={t("projects.progress")} value={project.progress} className="h-2 flex-1 bg-muted [&_[data-slot=progress-indicator]]:bg-[#1797ba]" />
        </div>
      </Card>

      {/* Main Content Grid */}
      <Box className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left Column - Project Details */}
        <Box className="min-w-0 space-y-6">
          {/* Project Information */}
          <Card className="min-w-0 gap-0 overflow-hidden border-border bg-card p-0 shadow-sm">
            <CardHeader className="border-b border-border bg-blue-50/60 px-5 py-4 dark:bg-blue-900/15">
              <CardTitle className="flex items-center gap-3 text-base font-semibold text-foreground">
                <FileText className="h-5 w-5" />
                {t("projects.projectInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box className="flex min-w-0 items-start gap-3 rounded-lg bg-blue-50/40 p-4 dark:bg-blue-900/10">
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
                <Box className="flex min-w-0 items-start gap-3 rounded-lg bg-green-50/40 p-4 dark:bg-green-900/10">
                  <Box className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </Box>
                  <Box>
                    <p className="text-sm text-muted-foreground font-medium">
                      {t("projects.assignedTo")}
                    </p>
                    <div className="font-semibold text-foreground">
                      {(() => {
                        const assignee = usersData?.data?.userMembers?.find(
                          (u) =>
                            u.user?.id === project.assignedTo ||
                            u.id === project.assignedTo,
                        );
                        const name = assignee?.user?.name || project.assignedProject || t("common.unassigned");
                        const position = assignee?.position;
                        return (
                          <Box>
                            <Box className="font-semibold text-foreground">{name}</Box>
                            {position && (
                              <Box className="text-xs text-muted-foreground font-normal">{position}</Box>
                            )}
                          </Box>
                        );
                      })()}
                    </div>
                  </Box>
                </Box>
                <Box className="flex min-w-0 items-start gap-3 rounded-lg bg-purple-50/40 p-4 dark:bg-purple-900/10">
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
                <Box className="flex min-w-0 items-start gap-3 rounded-lg bg-orange-50/40 p-4 dark:bg-orange-900/10">
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
                <Box className="border-t border-border pt-5">
                  <p className="text-sm text-muted-foreground font-medium mb-3">
                    {t("projects.projectDescriptionLabel")}
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">
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
                    <span className="text-lg font-semibold text-foreground mb-4 block">
                      {t("projectView.customFields")}
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
                          } catch {
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
                              <span className="text-sm text-foreground font-semibold capitalize break-words overflow-hidden break-all" style={{ wordBreak: 'break-word' }}>
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


          <DeliveryReviews key={project.id} projectId={project.id} />

          {/* Project Documents Showcase */}
          <Card className="min-w-0 gap-0 overflow-hidden border-border bg-card p-0 shadow-sm">
            <CardHeader className="border-b border-border bg-purple-50/60 px-5 py-4 dark:bg-purple-900/15">
              <CardTitle className="flex items-center gap-3 text-base font-semibold text-foreground">
                <FileText className="h-5 w-5" />
                {t("projectView.contract")}
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
                        <Box className="flex flex-col items-start gap-4">
                          <Box className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-foreground">
                              {project.projectName || "Project"}-Contract.pdf
                            </span>
                          </Box>
                          <Flex className="flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewImage(project.contractfile!)
                              }
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              {t("projectView.fullscreen")}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleOpenHistory}
                              className="flex items-center gap-1"
                            >
                              <Clock className="h-4 w-4" />
                              {t("projectView.history")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleUploadClick}
                              className="flex items-center gap-1"
                              disabled={uploadVersion.isPending}
                            >
                              <Upload className="h-4 w-4" />
                              {t("projectView.update")}
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
                              {t("projectView.newTab")}
                            </Button>
                          </Flex>
                        </Box>
                      </Box>

                      {/* PDF Preview */}
                      <Box className="h-[320px] bg-muted/20 sm:h-[440px]">
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
                            <EyeIcon className="h-4 w-4 me-2" />
                            {t("projectView.newTab")}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {t("projectView.noContract")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("projectView.noContractDescription")}
                    </p>
                  </Box>
                )}


              </Box>
            </CardContent>
          </Card>

          {/* Financial tracking: org owner / platform admins only — never clients */}
          {showProjectFinancials && (
            <div className="space-y-3">
            <ProjectExpenses
              projectId={project.id}
              budget={(project as any).budget || 0}
              isClient={isClient}
            />
            </div>
          )}
        </Box>

        {/* Project controls and supporting context */}
        <aside className="min-w-0 space-y-5">
          <Card className="gap-0 overflow-hidden border-border p-0 shadow-sm">
            <CardHeader className="border-b border-border bg-blue-50/60 px-5 py-4 dark:bg-blue-900/15">
              <CardTitle className="flex items-center gap-3 text-base"><BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />{t("projectView.tracking")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-3">
                <label htmlFor="project-progress" className="flex items-center justify-between text-sm font-medium">{t("projects.progress")}<span className="text-blue-600 dark:text-blue-400 tabular-nums">{editProgress}%</span></label>
                <div className="flex items-center gap-3">
                  {!isClient && <Input id="project-progress" type="number" min={0} max={100} value={editProgress || 0} onChange={event => {
                    const value = Number(event.target.value);
                    if (!isNaN(value)) setEditProgress(Math.max(0, Math.min(100, value)));
                  }} className="w-20 shrink-0 tabular-nums" />}
                  <Progress aria-label={t("projects.progress")} value={editProgress} className="h-2 min-w-0 flex-1 bg-muted [&_[data-slot=progress-indicator]]:bg-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="project-status" className="text-sm font-medium">{t("projectView.status")}</label>
                <Select value={editStatus} onValueChange={setEditStatus} disabled={isClient}>
                  <SelectTrigger id="project-status" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{["pending", "ongoing", "completed"].map(status => <SelectItem key={status} value={status}>{t(`projects.statusValue.${status}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {!isClient && <Button onClick={handleQuickUpdate} disabled={isUpdating} className="w-full bg-[#11718c] text-white hover:bg-[#0e6078]">{isUpdating ? t("projectView.saving") : t("projectView.save")}</Button>}
              {isClient && editStatus === "completed" && <Button onClick={() => { handleApproveProject(); toast.success("Project approved!"); }} className="w-full bg-green-700 text-white hover:bg-green-800">{t("projectView.approve")}</Button>}
              <dl className="space-y-3 border-t border-border pt-4 text-xs">
                <div className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">{t("projectView.created")}</dt><dd>{format(new Date(project.createdAt), "MMM dd, yyyy")}</dd></div>
                <div className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">{t("projectView.updated")}</dt><dd>{format(new Date(project.updatedAt), "MMM dd, yyyy")}</dd></div>
              </dl>
            </CardContent>
          </Card>

          <Card className="gap-0 overflow-hidden border-border p-0 shadow-sm">
            <CardHeader className="border-b border-border bg-green-50/60 px-5 py-4 dark:bg-green-900/15">
              <CardTitle className="flex items-center gap-3 text-base"><Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />{t("projectView.client")}</CardTitle>
            </CardHeader>
            <CardContent className="flex min-w-0 items-center gap-3 p-5">
              <Avatar className="h-11 w-11 shrink-0"><AvatarImage src={project.clientImage} alt={project.clientName} /><AvatarFallback className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">{project.clientName?.charAt(0) || "—"}</AvatarFallback></Avatar>
              <p className="min-w-0 break-words text-sm font-semibold">{project.clientName || t("common.noClient")}</p>
            </CardContent>
          </Card>

          {!isClient && <Card className="gap-0 overflow-hidden border-border p-0 shadow-sm">
            <CardHeader className="border-b border-border bg-purple-50/60 px-5 py-4 dark:bg-purple-900/15">
              <CardTitle className="flex items-center gap-3 text-base"><Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />{t("projectView.tools")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              {showProjectFinancials && <Button asChild variant="ghost" className="h-auto min-h-10 w-full justify-start whitespace-normal py-2 text-start"><Link to={`/dashboard/project/view/${project.id}/profitability`}><BarChart3 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />{t("profitability.title")}</Link></Button>}
              <Button variant="ghost" className="h-auto min-h-10 w-full justify-start whitespace-normal py-2 text-start" onClick={() => { setTemplateNameInput(project.projectName || ""); setIsSaveTemplateModalOpen(true); }}><Copy className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />{t("projectView.template")}</Button>
            </CardContent>
          </Card>}

          <Card className="gap-0 overflow-hidden border-border p-0 shadow-sm">
            <CardHeader className="border-b border-border bg-orange-50/60 px-5 py-4 dark:bg-orange-900/15">
              <CardTitle className="flex items-center gap-3 text-base"><FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />{t("projectView.projectPdf")}</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {project.projectFiles?.projectPdf ? <div className="space-y-4">
                <p className="break-words text-sm text-muted-foreground">{project.projectFiles.projectPdf.name}</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenInNewTab(project.projectFiles?.projectPdf?.url || "")}><EyeIcon className="h-4 w-4" />{t("projectView.view")}</Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const link = document.createElement("a");
                    link.href = project.projectFiles?.projectPdf?.url || "";
                    link.download = project.projectFiles?.projectPdf?.name || "";
                    document.body.appendChild(link); link.click(); document.body.removeChild(link);
                  }}><Download className="h-4 w-4" />{t("projectView.download")}</Button>
                </div>
              </div> : <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm leading-6 text-muted-foreground">{t("projectView.noPdf")}</p>}
            </CardContent>
          </Card>
        </aside>
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
        contentProps={{ className: "overflow-hidden max-sm:p-3 max-w-lg" }}
      >
        <Box>
          <Box className="mb-4 text-lg font-semibold">
            Project Comments — {project.projectName}
          </Box>
          {id && (
            <CommentThread
              projectId={id}
              canComment
              maxHeight="20rem"
              showHeader={false}
            />
          )}
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
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
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
