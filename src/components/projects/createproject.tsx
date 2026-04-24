import { IoArrowBack } from "react-icons/io5";
import { Loader2 } from "lucide-react";
import { PageWrapper } from "../common/pagewrapper";
import { Box } from "../ui/box";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { GuidedFlowModal } from "../common/GuidedFlowModal";
import { Center } from "../ui/center";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormControl,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "../customeIcons";
import { useCreateProject } from "../../hooks/usecreateproject";
import { useUpdateProject } from "../../hooks/useupdateproject";
import { useFetchProjectById } from "../../hooks/usefetchprojects";
import { useFetchOrganizationClients } from "../../hooks/usefetchorganizationdata";
import { useFetchOrganizationUsers } from "../../hooks/usefetchorganizationdata";
import { useFetchAllOrganizations } from "../../hooks/usefetchallorganizations";
import { useUser } from "../../providers/user.provider";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useFetchCustomFields } from "../../hooks/usecustomfields";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { Lock, Globe, DollarSign, ClipboardList } from "lucide-react";
import { useFetchProjectTemplates } from "@/hooks/useProjectTemplates";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Project Name must be at least 2 characters.",
    }),
    projectNumber: z.string().optional(),
    clientId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    assignedTo: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    contractfile: z.string().optional(),
    projectFiles: z
      .array(
        z.object({
          file: z.string(),
          type: z.string(),
          name: z.string(),
        }),
      )
      .optional(),
    customFields: z.record(z.any()).optional(),
    visibility: z.enum(["public", "private"]).default("private"),
    budget: z.coerce.number().min(0).optional(),
    templateId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "End Date must be after or equal to Start Date.",
      path: ["endDate"],
    },
  );

export const CreateProject = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id);
  const clientIdFromUrl = searchParams.get("clientId");

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [projectFiles, setProjectFiles] = useState<
    Array<{
      file: File;
      type: string;
      name: string;
      preview: string;
    }>
  >([]);
  const [showGuidedFlow, setShowGuidedFlow] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Get user authentication data
  const { data: userData, isLoading: isLoadingUser } = useUser();

  // Get user's organization data
  const {
    data: userOrgData,
    isLoading: isLoadingUserOrg,
    error: userOrgError,
  } = useFetchAllOrganizations();

  // Fetch custom field definitions
  // Fetch custom field definitions
  const { data: customFieldsData } = useFetchCustomFields("project");

  // Fetch project data if in edit mode
  const {
    data: projectData,
    isLoading: isLoadingProject,
    error: projectError,
  } = useFetchProjectById(id || "");

  const { data: templatesData } = useFetchProjectTemplates();

  // Use the custom hooks
  const {
    mutate: createProject,
    isPending: isCreating,
    error: createError,
    isSuccess: createSuccess,
  } = useCreateProject();

  const {
    mutate: updateProject,
    isPending: isUpdating,
    error: updateError,
    isSuccess: updateSuccess,
  } = useUpdateProject();

  // Fetch clients and users for dropdowns
  const { data: clientsData, isLoading: isLoadingClients } =
    useFetchOrganizationClients();

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useFetchOrganizationUsers();

  // Get organization ID from user profile or session (this is the correct one)
  const userOrgId = userData?.user?.organizationId;

  // Fallback: Try to get organization ID from user organization data
  const fallbackOrgId = userOrgData?.data?.[0]?.id;

  // Get organization ID from clients/users data (this should be the correct one from backend)
  const clientsOrgId = clientsData?.data?.[0]?.organizationId;
  const usersOrgId = usersData?.data?.[0]?.organizationId;

  // Use the organization ID from clients/users data first, then fallback to user data
  const finalOrganizationId =
    clientsOrgId || usersOrgId || userOrgId || fallbackOrgId;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      projectNumber: "",
      clientId: clientIdFromUrl || "",
      startDate: "",
      endDate: "",
      assignedTo: "",
      description: "",
      address: "",
      contractfile: "",
      projectFiles: [],
      customFields: {},
      visibility: "private",
      budget: 0,
      templateId: "",
    },
  });

  // Pre-fill clientId from URL if provided
  useEffect(() => {
    if (clientIdFromUrl && !isEditMode) {
      form.setValue("clientId", clientIdFromUrl);
    }
  }, [clientIdFromUrl, isEditMode, form]);

  // Populate form with project data when in edit mode
  // Wait for all data to be loaded before resetting the form
  useEffect(() => {
    if (
      isEditMode &&
      projectData?.data &&
      !isLoadingProject &&
      clientsData &&
      usersData &&
      !isLoadingClients &&
      !isLoadingUsers
    ) {
      const project = projectData.data;

      form.reset({
        name: project.projectName || "",
        projectNumber: project.projectNumber || "",
        clientId: project.clientId || "",
        startDate: project.startDate
          ? new Date(project.startDate).toISOString()
          : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString() : "",
        assignedTo: project.assignedTo || "",
        description: project.description || "",
        address: project.address || "",
        contractfile: project.contractfile || "",
        customFields: project.customFields || {},
        visibility: (project as any).visibility || "private",
        budget: (project as any).budget || 0,
      });

      // Explicitly set Select values after reset to ensure they're recognized
      // This ensures the Select components show the selected values even if options load slightly after
      if (project.clientId) {
        const clientExists =
          Array.isArray(clientsData.data) &&
          clientsData.data.some((c) => c.id === project.clientId);
        if (clientExists) {
          form.setValue("clientId", project.clientId, {
            shouldValidate: false,
          });
        }
      }

      if (project.assignedTo) {
        const userExists =
          Array.isArray(usersData.data) &&
          usersData.data.some((u) => u.id === project.assignedTo);
        if (userExists) {
          form.setValue("assignedTo", project.assignedTo, {
            shouldValidate: false,
          });
        }
      }
    }
  }, [
    isEditMode,
    projectData,
    clientsData,
    usersData,
    isLoadingProject,
    isLoadingClients,
    isLoadingUsers,
    form,
  ]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Check if user has organization ID
      if (!finalOrganizationId) {
        console.error("No organization ID found for user");
        toast.error(t("projects.organizationRequired"));
        return;
      }

      // Check file size before processing
      if (uploadedFile && uploadedFile.size > 10 * 1024 * 1024) {
        toast.error(t("projects.fileTooLargeToast"));
        return;
      }

      // Convert project files to base64
      const convertedProjectFiles = await Promise.all(
        projectFiles.map(async (fileData) => ({
          file: await convertFileToBase64(fileData.file),
          type: fileData.type,
          name: fileData.name,
        })),
      );

      // Include file data if uploaded
      const projectData = {
        name: values.name,
        ...(values.projectNumber && { projectNumber: values.projectNumber }),
        ...(values.clientId && { clientId: values.clientId }),
        ...(values.startDate && { startDate: values.startDate }),
        ...(values.endDate && { endDate: values.endDate }),
        ...(values.assignedTo && { assignedTo: values.assignedTo }),
        ...(values.description && { description: values.description }),
        ...(values.address && { address: values.address }),
        ...(uploadedFile && {
          contractfile: await convertFileToBase64(uploadedFile),
        }),
        ...(convertedProjectFiles.length > 0 && {
          projectFiles: convertedProjectFiles,
        }),
        organizationId: finalOrganizationId,
        customFields: values.customFields,
        visibility: values.visibility,
        ...(values.budget !== undefined && values.budget > 0 && { budget: values.budget }),
        ...(values.templateId && values.templateId !== "none" && { templateId: values.templateId }),
      };

      if (isEditMode && id) {
        updateProject({ id, data: projectData });
      } else {
        createProject(projectData, {
          onSuccess: (response) => {
            if (response?.data?.id) {
              setCreatedProjectId(response.data.id);
              setShowGuidedFlow(true);
            } else {
              navigate("/dashboard/project");
            }
          },
          onError: () => {
            // Error handling is done by the hook
          },
        });
      }
    } catch (error) {
      console.error("Error preparing project data:", error);
      toast.error("Failed to prepare project data");
    }
  }

  // Convert file to base64 for upload
  const convertFileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Add progress tracking for large files
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`File upload progress: ${percentComplete.toFixed(2)}%`);
        }
      };

      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
    });
  };

  // Reset form on success
  useEffect(() => {
    if (createSuccess || updateSuccess) {
      form.reset();
      setUploadedFile(null);
      setPdfPreview(null);
      setProjectFiles([]);

      // Only auto-navigate for edit mode or update success
      // For create mode, navigation is handled by the guided flow modal
      if (isEditMode || updateSuccess) {
        navigate("/dashboard/project");
      }
      // For create mode, don't navigate here - let the modal handle it
    }
  }, [createSuccess, updateSuccess, form, navigate, isEditMode]);

  const onDropPdf = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type) {
      setUploadedFile(file); // Also set as the main contract file
      const fileUrl = URL.createObjectURL(file);
      setPdfPreview(fileUrl);

      // Add to projectFiles state for project PDF
      const newFile = {
        file,
        type: "projectPdf",
        name: file.name,
        preview: fileUrl,
      };
      setProjectFiles((prev) => [
        ...prev.filter((f) => f.type !== "projectPdf"),
        newFile,
      ]);
    }
  }, []);

  const { getInputProps: getPdfInputProps, open: openPdf } = useDropzone({
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpeg"],
      "image/jpg": [".jpg"],
      "image/svg": [".svg"],
    },
    onDrop: onDropPdf,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            toast.error(
              t("projects.fileTooLargeDropzone", { name: file.name }),
            );
          } else {
            toast.error(
              t("projects.fileErrorDropzone", {
                name: file.name,
                message: error.message,
              }),
            );
          }
        });
      });
    },
  });

  return (
    <PageWrapper className="mt-6 p-6">
      <Box
        className="flex items-center gap-2 w-20 cursor-pointer transition-all duration-300  hover:bg-muted rounded-full hover:p-2 "
        onClick={() => navigate(-1)}
      >
        <IoArrowBack />
        <p className="text-foreground">{t("common.back")}</p>
      </Box>

      <Center className="justify-between mt-6 max-sm:flex-col max-sm:items-start gap-2 relative">
        <Stack className="gap-0">
          <h1 className="text-foreground text-xl font-medium">
            {isEditMode
              ? t("projects.editProject")
              : t("projects.createProject")}
          </h1>
          <h1 className="text-muted-foreground">
            {isEditMode
              ? t("projects.Updatetheprojectdetailsbelow")
              : t("projects.createProjectDesc")}
          </h1>
        </Stack>
      </Center>

      {/* Error and Success Messages */}
      {(createError || updateError || projectError) && (
        <Box className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">
            {(createError || updateError || projectError)?.name ||
              (createError || updateError || projectError)?.message ||
              t("projects.errorOccurred")}
          </p>
        </Box>
      )}

      {(createSuccess || updateSuccess) && (
        <Box className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-600 text-sm">
            {t("projects.project")}{" "}
            {isEditMode ? t("projects.updated") : t("projects.created")}{" "}
            {t("projects.successfully")}!
          </p>
        </Box>
      )}

      {usersError && (
        <Box className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">
            {t("projects.errorLoadingUsers")}: {usersError.message}
          </p>
        </Box>
      )}

      {userOrgError && (
        <Box className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">
            {t("projects.errorLoadingOrganization")}: {userOrgError.message}
          </p>
        </Box>
      )}

      {isLoadingUserOrg && (
        <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-600 text-sm">
            {t("projects.loadingOrganization")}
          </p>
        </Box>
      )}

      {isLoadingProject && (
        <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-600 text-sm">
            {t("projects.loadingProject")}
          </p>
        </Box>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 relative">
          <Button
            variant="default"
            className="rounded-full px-6 py-5 flex items-center gap-2 absolute -top-20 right-0"
            type="submit"
            disabled={
              isCreating ||
              isUpdating ||
              isLoadingUser ||
              isLoadingUserOrg ||
              isLoadingProject
            }
          >
            {isCreating || isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? t("projects.updating...") : t("projects.creating...")}
              </>
            ) : isEditMode ? (
              t("projects.updateProject")
            ) : (
              t("projects.saveProject")
            )}
          </Button>

          <Box className="bg-muted/50 border border-border rounded-2xl p-4 flex items-center gap-4 mb-4">
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-4 space-y-0 w-full">
                  <Box className="flex flex-col gap-0.5">
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                      {field.value === "private" ? (
                        <Lock className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Globe className="w-4 h-4 text-blue-500" />
                      )}
                      {field.value === "private"
                        ? "Private Project"
                        : "Public Project"}
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      {field.value === "private"
                        ? "Only members assigned to this project can see it."
                        : "Anyone in your organization can view this project."}
                    </p>
                  </Box>
                  <FormControl>
                    <Switch
                      checked={field.value === "public"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "public" : "private")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Box>
          {!isEditMode && (
            <Box className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-4">
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-blue-900 font-semibold">
                      <ClipboardList className="w-4 h-4" />
                      Project Template (Optional)
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background rounded-full border-blue-200 h-12 focus:ring-blue-500">
                          <SelectValue placeholder="Select a template to auto-create tasks" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          No Template (Blank Project)
                        </SelectItem>
                        {templatesData?.data?.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {template.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {template.taskCount} tasks included
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-blue-600/70 text-[10px] mt-1 px-2">
                      Choosing a template will automatically set up standard
                      tasks for this project type.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>
          )}

          <Box className="bg-card/80 rounded-xl border border-border p-6 gap-4 grid grid-cols-1">
            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <Stack className="flex-1 w-full gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("projects.projectNameLabel")}
                        <span className="text-red-500 text-sm">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-background rounded-full placeholder:text-muted-foreground"
                          size="lg"
                          type="text"
                          placeholder={t("projects.enterProjectName")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("projects.projectNumberLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-background rounded-full placeholder:text-muted-foreground"
                          placeholder={t("projects.enterProjectNumber")}
                          type="number"
                          size="lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Stack>

              <Box className="grid grid-cols-1 flex-1 w-full gap-4">
                {!pdfPreview ? (
                  <Center
                    className="flex-col border-2 border-primary border-dashed bg-muted/30 rounded-lg min-h-50 w-full cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={openPdf}
                  >
                    <img
                      src="/dashboard/upload.svg"
                      alt="pdf-upload"
                      className="size-12 brightness-0 dark:invert"
                    />
                    <p className="text-foreground text-lg font-medium underline">
                      {t("projects.uploadProjectPdfCta")}
                    </p>
                    <p className="text-muted-foreground text-sm font-medium">
                      {t("projects.pdfFilesOnly")}
                    </p>
                    <input {...getPdfInputProps()} />
                  </Center>
                ) : (
                  <Box className="border-2 border-primary rounded-lg p-4 relative">
                    <Stack className="gap-2">
                      <Box className="flex ml-auto w-full absolute top-0 right-0 p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPdfPreview(null);
                          }}
                        >
                          X
                        </Button>
                      </Box>
                      {pdfPreview && (
                        <Box className="w-full h-[150px] border-dashed border-border rounded">
                          <img
                            src={pdfPreview}
                            title="PDF Preview"
                            className="object-contain w-full h-full"
                            style={{ border: "none" }}
                            onError={(e) => {
                              console.error("PDF preview failed to load:", e);
                            }}
                          />
                        </Box>
                      )}

                      {/* File Information */}
                      {projectFiles.find((f) => f.type === "projectPdf") && (
                        <Box className="mt-2 p-3 bg-muted/50 border border-border rounded-lg">
                          <Box className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">
                              {
                                projectFiles.find(
                                  (f) => f.type === "projectPdf",
                                )?.name
                              }
                            </span>
                            <span className="text-muted-foreground">
                              {(
                                (projectFiles.find(
                                  (f) => f.type === "projectPdf",
                                )?.file.size || 0) /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </span>
                          </Box>
                          {(projectFiles.find((f) => f.type === "projectPdf")
                            ?.file.size || 0) >
                            10 * 1024 * 1024 && (
                            <Box className="mt-1 text-xs text-red-600">
                              ⚠️ {t("projects.fileTooLargeWarning")}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Box>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("projects.projectDescriptionLabel")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="bg-card rounded-md placeholder:text-muted-foreground h-32"
                        placeholder={t("projects.enterProjectDescription")}
                        rows={6}
                        cols={18}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mt-4 -mb-4 max-md:mt-0 max-md:-mb-0">
                      {t("projects.addressLabel")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-background rounded-full placeholder:text-muted-foreground"
                        size="lg"
                        type="text"
                        placeholder={t("projects.enterAddress")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      Project Budget
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-background rounded-full placeholder:text-muted-foreground"
                        size="lg"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter project budget (e.g. 10000)"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Box />
            </Box>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("projects.startDateLabel")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl className="h-12">
                          <Button
                            size="lg"
                            variant={"outline"}
                            className={cn(
                              "justify-start text-left font-normal rounded-full",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="size-5 text-primary" />
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>{t("projects.pickDate")}</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          className="max-w-70"
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date.toISOString());
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("projects.endDateLabel")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl className="h-12">
                          <Button
                            size="lg"
                            variant={"outline"}
                            className={cn(
                              "justify-start text-left font-normal rounded-full",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {/* <CalendarRange className="size-5" /> */}
                            <CalendarIcon className="size-5" fill="#62A1C0" />
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>{t("projects.pickDate")}</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          className="max-w-70"
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date.toISOString());
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("projects.assignClientLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingClients}
                    >
                      <FormControl className="w-full h-11">
                        <SelectTrigger
                          size="lg"
                          className="bg-card border border-border rounded-full w-full h-12"
                        >
                          <SelectValue
                            placeholder={
                              isLoadingClients
                                ? t("projects.loadingClients")
                                : t("projects.selectClient")
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        {Array.isArray(clientsData?.data)
                          ? clientsData.data.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))
                          : []}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("projects.assignTeamMemberLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingUsers}
                    >
                      <FormControl className="w-full h-11">
                        <SelectTrigger
                          size="lg"
                          className="bg-muted border border-border rounded-full w-full h-11"
                        >
                          <SelectValue
                            placeholder={
                              isLoadingUsers
                                ? t("projects.loadingUsers")
                                : t("projects.selectUser")
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        {Array.isArray(usersData?.data)
                          ? usersData.data.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))
                          : []}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <FormField
                control={form.control}
                name="contractfile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("projects.contractFileLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-background rounded-full placeholder:text-muted-foreground"
                        size="lg"
                        type="file"
                        placeholder={t("projects.enterContractFile")}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                          }
                          field.onChange(e);
                        }}
                        accept=".pdf,.png,.jpeg,.jpg,.gif,.webp,.svg,.bmp"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

            {/* Custom Fields Section */}
            {customFieldsData?.data && customFieldsData.data.length > 0 && (
              <Box className="space-y-6 mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-medium text-foreground">
                  Custom Fields
                </h3>
                <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                  {customFieldsData.data.map((field) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`customFields.${field.id}`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>{field.name}</FormLabel>
                          <FormControl>
                            {field.type === "select" ? (
                              <Select
                                onValueChange={formField.onChange}
                                value={formField.value}
                              >
                                <SelectTrigger className="bg-background rounded-full h-12">
                                  <SelectValue
                                    placeholder={`Select ${field.name}`}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((opt: any) => {
                                    const label = typeof opt === 'string' ? opt : opt.label;
                                    const color = typeof opt === 'string' ? undefined : opt.color;
                                    return (
                                      <SelectItem key={label} value={label}>
                                        <div className="flex items-center gap-2">
                                          {color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
                                          <span>{label}</span>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            ) : field.type === "boolean" ? (
                              <div className="flex items-center space-x-2 h-12">
                                <Checkbox
                                  checked={
                                    formField.value === "true" ||
                                    formField.value === true
                                  }
                                  onCheckedChange={(checked) =>
                                    formField.onChange(checked)
                                  }
                                />
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  {field.name}
                                </label>
                              </div>
                            ) : field.type === "date" ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal rounded-full h-12 bg-card",
                                      !formField.value &&
                                        "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formField.value ? (
                                      format(new Date(formField.value), "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={
                                      formField.value
                                        ? new Date(formField.value)
                                        : undefined
                                    }
                                    onSelect={(date) =>
                                      formField.onChange(
                                        date ? date.toISOString() : "",
                                      )
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <Input
                                className="bg-background rounded-full placeholder:text-muted-foreground"
                                size="lg"
                                type={
                                  field.type === "number" ? "number" : "text"
                                }
                                placeholder={`Enter ${field.name}`}
                                {...formField}
                                value={formField.value || ""}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </form>
      </Form>

      {/* Guided Flow Modal - Suggest creating task after project creation */}
      {!isEditMode && (
        <GuidedFlowModal
          open={showGuidedFlow}
          onOpenChange={setShowGuidedFlow}
          title="Project Created Successfully!"
          description="Excellent! Your project is set up. Would you like to create a task for this project?"
          nextAction={{
            label: "Create Task",
            route: createdProjectId
              ? `/dashboard/task-management/create-task?projectId=${createdProjectId}`
              : "/dashboard/task-management/create-task",
            description: "Start breaking down work into actionable tasks",
          }}
          onSkip={() => {
            navigate("/dashboard/project");
          }}
        />
      )}
    </PageWrapper>
  );
};
