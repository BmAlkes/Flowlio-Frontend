import { IoArrowBack } from "react-icons/io5";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Box } from "@/components/ui/box";
import { useNavigate, useParams } from "react-router";
import { Center } from "@/components/ui/center";
import { Button } from "@/components/ui/button";
import { useFetchViewerProjectById } from "@/hooks/useFetchViewerProjectById";
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
  Download,
  Mail,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export const ViewerProjectView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: projectData,
    isLoading,
    error,
  } = useFetchViewerProjectById(id || "");

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
            {error?.message || "Project not found"}
          </p>
          <Center className="mt-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
          </Center>
        </Box>
      </PageWrapper>
    );
  }

  const project = projectData.data;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "ongoing":
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDownload = () => {
    if (project.contractfile) {
      const link = document.createElement("a");
      link.href = project.contractfile;
      link.download = `${project.name || "project"}-contract.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <PageWrapper className="mt-6 p-6">
      {/* Header */}
      <Box className="flex items-center justify-between mb-6">
        <Box className="flex items-center gap-4">
          <Box
            className="flex items-center gap-2 w-20 cursor-pointer transition-all duration-300 hover:bg-gray-200 rounded-full hover:p-2"
            onClick={() => navigate(-1)}
          >
            <IoArrowBack />
            <p className="text-black">Back</p>
          </Box>

          {/* Breadcrumb */}
          <Box className="flex items-center gap-2 text-sm text-gray-600">
            <Button
              variant="link"
              className="p-0 h-auto text-gray-600 hover:text-gray-900"
              onClick={() => navigate("/viewer/my-projects")}
            >
              My Projects
            </Button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{project.name}</span>
          </Box>
        </Box>
      </Box>

      {/* Project Header Card */}
      <Card className="mb-6 border-0 shadow-xl bg-gradient-to-r from-blue-50 via-white to-purple-50">
        <CardHeader className="pb-6">
          <Box className="flex items-start justify-between max-sm:flex-col-reverse max-sm:gap-4">
            <Box className="flex-1">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                {project.name || "Untitled Project"}
              </CardTitle>
              <Box className="flex items-center gap-6 mb-6">
                <Badge
                  variant="outline"
                  className={`${getStatusColor(
                    project.status
                  )} flex items-center gap-2 px-4 py-2 text-sm font-medium`}
                >
                  {getStatusIcon(project.status)}
                  {project.status?.charAt(0).toUpperCase() +
                    project.status?.slice(1)}
                </Badge>
                <Box className="flex items-center gap-2 text-sm text-gray-600 bg-white/70 px-3 py-2 rounded-full">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">
                    Progress: {project.progress}%
                  </span>
                </Box>
                <Box className="flex items-center gap-2 text-sm text-gray-600 bg-white/70 px-3 py-2 rounded-full">
                  <Building2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    {project.clientName || "No Client"}
                  </span>
                </Box>
              </Box>
              <Box className="relative">
                <Progress
                  value={project.progress}
                  className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
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
                  className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
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
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 p-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box className="flex items-center gap-4 p-4 bg-white/70 rounded-lg border border-blue-100">
                  <Box className="p-2 bg-blue-100 rounded-full">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </Box>
                  <Box>
                    <p className="text-sm text-gray-600 font-medium">
                      Project Number
                    </p>
                    <p className="font-semibold text-gray-900">
                      {project.projectNumber}
                    </p>
                  </Box>
                </Box>
                <Box className="flex items-center gap-4 p-4 bg-white/70 rounded-lg border border-green-100">
                  <Box className="p-2 bg-green-100 rounded-full">
                    <User className="h-5 w-5 text-green-600" />
                  </Box>
                  <Box>
                    <p className="text-sm text-gray-600 font-medium">
                      Assigned To
                    </p>
                    <p className="font-semibold text-gray-900">
                      {project.assignedUserName}
                    </p>
                  </Box>
                </Box>
                <Box className="flex items-center gap-4 p-4 bg-white/70 rounded-lg border border-purple-100">
                  <Box className="p-2 bg-purple-100 rounded-full">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </Box>
                  <Box>
                    <p className="text-sm text-gray-600 font-medium">
                      Start Date
                    </p>
                    <p className="font-semibold text-gray-900">
                      {project.startDate
                        ? format(new Date(project.startDate), "MMM dd, yyyy")
                        : "Not set"}
                    </p>
                  </Box>
                </Box>
                <Box className="flex items-center gap-4 p-4 bg-white/70 rounded-lg border border-orange-100">
                  <Box className="p-2 bg-orange-100 rounded-full">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </Box>
                  <Box>
                    <p className="text-sm text-gray-600 font-medium">
                      End Date
                    </p>
                    <p className="font-semibold text-gray-900">
                      {project.endDate
                        ? format(new Date(project.endDate), "MMM dd, yyyy")
                        : "Not set"}
                    </p>
                  </Box>
                </Box>
              </Box>

              {/* Project Description */}
              {project.description && (
                <Box className="mt-6 p-4 bg-white/70 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {project.description}
                  </p>
                </Box>
              )}

              {/* Project Address */}
              {project.address && (
                <Box className="mt-4 p-4 bg-white/70 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    Project Address
                  </h3>
                  <p className="text-gray-700">{project.address}</p>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Client & Timeline */}
        <Box className="space-y-6">
          {/* Client Information */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30 p-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Building2 className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Box className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.clientImage} />
                  <AvatarFallback className="bg-green-100 text-green-800">
                    {project.clientName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Box>
                  <h3 className="font-semibold text-gray-900">
                    {project.clientName}
                  </h3>
                  <p className="text-sm text-gray-600">Client</p>
                </Box>
              </Box>

              <Separator className="my-4" />

              <Box className="space-y-3">
                {project.clientEmail && (
                  <Box className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{project.clientEmail}</span>
                  </Box>
                )}
                {project.clientPhone && (
                  <Box className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{project.clientPhone}</span>
                  </Box>
                )}
                {project.clientAddress && (
                  <Box className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {project.clientAddress}
                    </span>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 p-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Box className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-purple-100">
                <Box className="flex items-center gap-3">
                  <Box className="p-2 bg-purple-100 rounded-full">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </Box>
                  <Box>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(project.createdAt), "MMM dd, yyyy")}
                    </p>
                  </Box>
                </Box>
              </Box>

              <Box className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-blue-100">
                <Box className="flex items-center gap-3">
                  <Box className="p-2 bg-blue-100 rounded-full">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </Box>
                  <Box>
                    <p className="text-sm font-medium text-gray-900">
                      Last Updated
                    </p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(project.updatedAt), "MMM dd, yyyy")}
                    </p>
                  </Box>
                </Box>
              </Box>

              {project.startDate && (
                <Box className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-green-100">
                  <Box className="flex items-center gap-3">
                    <Box className="p-2 bg-green-100 rounded-full">
                      <PlayCircle className="h-4 w-4 text-green-600" />
                    </Box>
                    <Box>
                      <p className="text-sm font-medium text-gray-900">
                        Start Date
                      </p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(project.startDate), "MMM dd, yyyy")}
                      </p>
                    </Box>
                  </Box>
                </Box>
              )}

              {project.endDate && (
                <Box className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-orange-100">
                  <Box className="flex items-center gap-3">
                    <Box className="p-2 bg-orange-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                    </Box>
                    <Box>
                      <p className="text-sm font-medium text-gray-900">
                        End Date
                      </p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(project.endDate), "MMM dd, yyyy")}
                      </p>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </PageWrapper>
  );
};
