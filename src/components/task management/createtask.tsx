import { IoArrowBack } from "react-icons/io5";
import { PageWrapper } from "../common/pagewrapper";
import { Box } from "../ui/box";
import { useNavigate, useSearchParams } from "react-router";
import { Center } from "../ui/center";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
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
import { format, startOfDay } from "date-fns";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "../customeIcons";
import { useCreateTask } from "@/hooks/usecreatetask";
import { useUpdateTask } from "@/hooks/useupdatetask";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { useFetchOrganizationUsers } from "@/hooks/usefetchorganizationusers";
import { CreateTaskRequest } from "@/hooks/usecreatetask";
import { toast } from "sonner";
import {
  useFetchTaskById,
  useFetchTasksByAssignee,
} from "@/hooks/usefetchtasks";
// import { AITaskCreator } from "./AITaskCreator";
import { Switch } from "../ui/switch";
import { Lock, Globe, Loader2 } from "lucide-react";

interface CreateTaskProps {
  taskId?: string; // If provided, component works in edit mode
  parentId?: string; // If provided, component handles subtask creation
  onClose?: () => void; // For modal mode
  isModal?: boolean; // If true, renders as modal instead of page
}

const formSchema = z
  .object({
    title: z.string().min(2, {
      message: "Task title must be at least 2 characters.",
    }),
    description: z.string().optional(),
    projectId: z.string().min(1, {
      message: "Please select a project.",
    }),
    assignedTo: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    parentId: z.string().optional(),
    startAfter: z.string().optional(),
    finishBefore: z.string().optional(),
    visibility: z.enum(["public", "private"]).default("private"),
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      startOfDay(data.endDate) >= startOfDay(data.startDate),
    {
      message: "End date must be on or after start date.",
      path: ["endDate"],
    },
  )
  .refine(
    (data) =>
      !data.startAfter ||
      !data.finishBefore ||
      data.startAfter !== data.finishBefore,
    {
      message: "Start After and Finish Before cannot be the same task.",
      path: ["finishBefore"],
    },
  )
  .refine(
    (data) =>
      !data.startAfter ||
      !data.finishBefore ||
      data.startAfter !== data.finishBefore,
    {
      message: "Start After and Finish Before cannot be the same task.",
      path: ["startAfter"],
    },
  );

export const CreateTask = ({
  taskId,
  parentId: parentIdFromProps,
  onClose,
  isModal = false,
}: CreateTaskProps = {}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get("projectId");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const parentIdFromUrl = searchParams.get("parentId");
  const parentId = parentIdFromProps || parentIdFromUrl;

  // Extract URL parameters
  const titleFromUrl = searchParams.get("title");
  const descriptionFromUrl = searchParams.get("description");
  const assignedToFromUrl = searchParams.get("assignedTo");
  const startDateFromUrl = searchParams.get("startDate");
  const endDateFromUrl = searchParams.get("endDate");

  // Check if edit mode
  const isEditMode = !!taskId;

  // Hooks
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: projectsResponse } = useFetchProjects();
  const { data: usersResponse } = useFetchOrganizationUsers();
  const { data: taskData } = useFetchTaskById(taskId || "");
  const { data: parentTaskData } = useFetchTaskById(parentId || "");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: titleFromUrl || "",
      description: descriptionFromUrl || "",
      projectId: projectIdFromUrl || "",
      assignedTo: assignedToFromUrl || "",
      startDate: startDateFromUrl ? new Date(startDateFromUrl) : new Date(),
      endDate: endDateFromUrl ? new Date(endDateFromUrl) : new Date(),
      parentId: parentId || "",
      startAfter: "",
      finishBefore: "",
      visibility: "private",
    },
  });

  const assignedTo = form.watch("assignedTo");
  const {
    data: assignedUserTasksResponse,
    isLoading: isDependencyOptionsLoading,
  } = useFetchTasksByAssignee(assignedTo || undefined);
  const assignedUserTasks = assignedUserTasksResponse?.data ?? [];

  const dependencyOptions = useMemo(() => {
    if (isEditMode && taskId) {
      return assignedUserTasks.filter((t) => t.id !== taskId);
    }
    return assignedUserTasks;
  }, [assignedUserTasks, isEditMode, taskId]);

  const watchedStartDate = form.watch("startDate");
  const todayStart = startOfDay(new Date());
  const prevAssignedToRef = useRef(assignedTo);
  const hasResetDependenciesForEditRef = useRef(false);

  // When taskId changes (e.g. opening a different task), allow reset again
  useEffect(() => {
    if (!isEditMode || !taskId) return;
    hasResetDependenciesForEditRef.current = false;
  }, [taskId, isEditMode]);

  // When assignedTo changes, clear dependent Start After / Finish Before and re-fetch options
  useEffect(() => {
    if (prevAssignedToRef.current !== assignedTo) {
      prevAssignedToRef.current = assignedTo;
      form.setValue("startAfter", "");
      form.setValue("finishBefore", "");
    }
  }, [assignedTo, form]);

  // When start date changes to after end date, set end date to start date
  useEffect(() => {
    const start = form.getValues("startDate");
    const end = form.getValues("endDate");
    if (start && end && startOfDay(end) < startOfDay(start)) {
      form.setValue("endDate", start);
    }
  }, [watchedStartDate, form]);

  // When in subtask mode, pre-fill project from parent task
  useEffect(() => {
    if (parentId && parentTaskData?.data?.projectId) {
      form.setValue("projectId", parentTaskData.data.projectId);
    }
  }, [parentId, parentTaskData?.data?.projectId, form]);

  // Pre-fill form with task data if in edit mode (basic fields first so assignee fetch runs)
  useEffect(() => {
    if (isEditMode && taskData?.data) {
      const task = taskData.data;
      form.setValue("title", task.title || "");
      form.setValue("description", task.description || "");
      form.setValue("projectId", task.projectId || "");
      form.setValue("assignedTo", task.assigneeId || "");
      if (task.startDate) {
        form.setValue("startDate", new Date(task.startDate));
      }
      if (task.endDate) {
        form.setValue("endDate", new Date(task.endDate));
      }
      form.setValue("parentId", task.parentId || "");
      form.setValue("visibility", (task as any).visibility || "private");
    }
  }, [isEditMode, taskData, form]);

  // Reset form with dependency values once options are loaded (edit mode only)
  useEffect(() => {
    if (!isEditMode || !taskData?.data || !taskId) return;
    const task = taskData.data;
    const assigneeId = task.assigneeId || "";
    if (assignedTo !== assigneeId) return;
    if (isDependencyOptionsLoading || !assignedUserTasksResponse) return;
    if (hasResetDependenciesForEditRef.current) return;

    hasResetDependenciesForEditRef.current = true;

    const safeStartAfter =
      task.startAfter &&
      task.startAfter !== taskId &&
      assignedUserTasks.some((t) => t.id === task.startAfter)
        ? task.startAfter
        : "";
    const safeFinishBefore =
      task.finishBefore &&
      task.finishBefore !== taskId &&
      assignedUserTasks.some((t) => t.id === task.finishBefore)
        ? task.finishBefore
        : "";

    form.reset({
      title: task.title || "",
      description: task.description || "",
      projectId: task.projectId || "",
      assignedTo: assigneeId,
      startDate: task.startDate ? new Date(task.startDate) : new Date(),
      endDate: task.endDate ? new Date(task.endDate) : new Date(),
      parentId: task.parentId || "",
      startAfter: safeStartAfter,
      finishBefore: safeFinishBefore,
      visibility: (task as any).visibility || "private",
    });
  }, [
    isEditMode,
    taskData,
    taskId,
    assignedTo,
    assignedUserTasks,
    assignedUserTasksResponse,
    isDependencyOptionsLoading,
    form,
  ]);

  // Pre-fill form fields from URL if provided
  useEffect(() => {
    if (projectIdFromUrl) {
      form.setValue("projectId", projectIdFromUrl);
    }
    if (titleFromUrl) {
      form.setValue("title", titleFromUrl);
    }
    if (descriptionFromUrl) {
      form.setValue("description", descriptionFromUrl);
    }
    if (assignedToFromUrl) {
      form.setValue("assignedTo", assignedToFromUrl);
    }
    if (startDateFromUrl) {
      form.setValue("startDate", new Date(startDateFromUrl));
    }
    if (endDateFromUrl) {
      form.setValue("endDate", new Date(endDateFromUrl));
    }
    if (parentIdFromUrl) {
      form.setValue("parentId", parentIdFromUrl);
    }
  }, [
    projectIdFromUrl,
    titleFromUrl,
    descriptionFromUrl,
    assignedToFromUrl,
    startDateFromUrl,
    endDateFromUrl,
    parentIdFromUrl,
  ]);

  // Convert file to base64 for upload
  const convertFileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        console.log(
          `File converted to base64. Size: ${(
            result.length /
            1024 /
            1024
          ).toFixed(2)}MB`,
        );
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Check file size before processing
      if (uploadedFile && uploadedFile.size > 10 * 1024 * 1024) {
        toast.error(
          "File size must be less than 10MB. Please choose a smaller file.",
        );
        return;
      }

      // Convert uploaded file to base64 if present
      let attachmentData = null;
      if (uploadedFile) {
        attachmentData = {
          id: crypto.randomUUID(),
          file: await convertFileToBase64(uploadedFile),
          name: uploadedFile.name,
          url: URL.createObjectURL(uploadedFile),
          size: uploadedFile.size,
          type: uploadedFile.type,
        };
      }

      if (isEditMode && taskId) {
        // Update existing task
        const updateData = {
          title: values.title,
          description: values.description,
          projectId: values.projectId,
          assignedTo: values.assignedTo || undefined,
          startDate: values.startDate?.toISOString(),
          endDate: values.endDate?.toISOString(),
          attachments: attachmentData ? [attachmentData] : undefined,
          startAfter: values.startAfter || null,
          finishBefore: values.finishBefore || null,
          visibility: values.visibility,
        };

        updateTask.mutate(
          {
            taskId,
            data: updateData,
          },
          {
            onSuccess: () => {
              if (isModal && onClose) {
                onClose();
              } else {
                navigate("/dashboard/task-management");
              }
            },
            onError: (error) => {
              toast.error("Task update failed");
              console.log("Task update failed", error);
            },
          },
        );
      } else {
        // Create new task
        const taskData: CreateTaskRequest = {
          title: values.title,
          description: values.description,
          projectId: values.projectId,
          assignedTo: values.assignedTo || undefined,
          startDate: values.startDate?.toISOString(),
          endDate: values.endDate?.toISOString(),
          attachments: attachmentData ? [attachmentData] : undefined,
          parentId: values.parentId || undefined,
          startAfter: values.startAfter || null,
          finishBefore: values.finishBefore || null,
          visibility: values.visibility,
        };
        console.log("Task data", taskData);

        createTask.mutate(taskData, {
          onSuccess: () => {
            if (isModal && onClose) {
              onClose();
            } else {
              navigate("/dashboard/task-management");
            }
            console.log("Task created successfully", taskData);
          },
          onError: (error) => {
            toast.error("Task creation failed");
            console.log("Task creation failed", error);
          },
        });
      }
    } catch (error) {
      console.error("Error preparing task data:", error);
      toast.error("Failed to prepare task data");
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type) {
      const fileUrl = URL.createObjectURL(file);
      setFilePreview(fileUrl);
      setUploadedFile(file);
      setFileType(file.type);
    }
  }, []);

  const { getInputProps, open } = useDropzone({
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpeg"],
      "image/jpg": [".jpg"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "image/svg": [".svg"],
      "image/bmp": [".bmp"],
    },
    onDrop,
  });

  const content = (
    <>
      {!isModal && (
        <Box
          className="flex items-center gap-2 w-20 cursor-pointer transition-all duration-300  hover:bg-muted rounded-full hover:p-2"
          onClick={() => navigate(-1)}
        >
          <IoArrowBack />
          <p className="text-foreground">Back</p>
        </Box>
      )}

      <Center className="justify-between mt-4 max-sm:flex-col max-sm:items-start gap-2 relative">
        <Stack className="gap-0">
          <h1 className="text-foreground text-xl font-medium">
            {isEditMode ? "Edit Task" : parentId ? "New Subtask" : "New Task"}
          </h1>
          <h1 className="text-muted-foreground">
            {isEditMode
              ? "Update task details and keep your team aligned."
              : parentId
                ? "Create a subtask to break down your main objective."
                : "Create and assign tasks to keep your team aligned and productive."}
          </h1>
        </Stack>
      </Center>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
          <Button
            type="submit"
            variant="default"
            className="rounded-full px-6 py-5 flex items-center gap-2 absolute top-18 right-2 max-md:top-6"
            disabled={isEditMode ? updateTask.isPending : createTask.isPending}
          >
            {isEditMode ? (
              updateTask.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Task"
              )
            ) : createTask.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : parentId ? (
              "Save Subtask"
            ) : (
              "Save Task"
            )}
          </Button>

          <Box className="bg-muted/50 border border-border rounded-2xl p-4 flex items-center gap-4 mb-4 mt-12">
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
                        ? "Private Task"
                        : "Public Task"}
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      {field.value === "private"
                        ? "Only the assignee and creator can see this task."
                        : "Anyone in your organization can view this task."}
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

          {(isModal || isEditMode) && onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-background text-foreground border border-border rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer absolute top-18 right-40 max-md:top-20 max-md:right-2"
            >
              Cancel
            </Button>
          )}

          {/* AI Task Creator */}
          {/* <AITaskCreator
            onTaskGenerated={(taskData) => {
              // Pre-fill form with AI-generated data
              if (taskData.title) {
                form.setValue("title", taskData.title);
              }
              if (taskData.description) {
                form.setValue("description", taskData.description);
              }
              if (taskData.projectId) {
                form.setValue("projectId", taskData.projectId);
              }
              if (taskData.assignedTo) {
                form.setValue("assignedTo", taskData.assignedTo);
              }
              if (taskData.startDate) {
                form.setValue("startDate", new Date(taskData.startDate));
              }
              if (taskData.endDate) {
                form.setValue("endDate", new Date(taskData.endDate));
              }
              toast.success(
                "Form filled with AI-generated data. Review and adjust as needed."
              );
            }}
          /> */}

          <Box className="bg-card/80 rounded-xl border border-border p-6 gap-4 grid grid-cols-1">
            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <Stack className="flex-1 w-full gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Task Title:
                        <span className="text-red-500 text-sm">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-background rounded-full placeholder:text-muted-foreground"
                          size="lg"
                          type="text"
                          placeholder="Enter Task Title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Assign Project:
                        <span className="text-red-500 text-sm">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!!parentId}
                      >
                        <FormControl className="w-full h-12">
                          <SelectTrigger
                            size="lg"
                            className="bg-muted border border-border rounded-full w-full h-12 placeholder:text-muted-foreground"
                          >
                            <SelectValue placeholder="Select Project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          {projectsResponse?.data?.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.projectName}{" "}
                              {project.projectNumber
                                ? `(${project.projectNumber})`
                                : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Stack>

              <Box className="grid grid-cols-1 flex-1 w-full gap-4">
                {!filePreview ? (
                  <Center
                    className="flex-col border-2 border-primary border-dashed bg-muted/30 rounded-lg min-h-50 w-full cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={open}
                  >
                    <img
                      src="/dashboard/upload.svg"
                      alt="upload-icon"
                      className="size-12 brightness-0 dark:invert"
                    />
                    <p className="text-foreground text-lg font-medium underline">
                      Click to upload file
                    </p>
                    <p className="text-muted-foreground text-sm font-medium">
                      PDF, Images (PNG, JPG, WebP)
                    </p>
                    <input {...getInputProps()} />
                  </Center>
                ) : (
                  <Box className="border-2 border-primary rounded-lg p-4 relative w-50 h-50">
                    <Stack className="gap-2">
                      <Box className="flex ml-auto w-full absolute top-0 right-0 p-2 z-10">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFilePreview(null);
                            setUploadedFile(null);
                            setFileType(null);
                          }}
                        >
                          X
                        </Button>
                      </Box>

                      {/* File info header */}
                      <Box className="mt-6 mb-2">
                        <p className="text-sm font-medium text-foreground">
                          {uploadedFile?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {uploadedFile?.size
                            ? (uploadedFile.size / 1024 / 1024).toFixed(2)
                            : "0"}{" "}
                          MB • {fileType}
                        </p>
                      </Box>

                      {/* Preview based on file type */}
                      {fileType?.startsWith("image/") ? (
                        <Box className="w-full h-[200px] border border-border rounded-lg overflow-hidden">
                          <img
                            src={filePreview}
                            alt="File preview"
                            className="object-contain w-full h-full"
                            onError={(e) => {
                              console.error("Image preview failed to load:", e);
                            }}
                          />
                        </Box>
                      ) : fileType === "application/pdf" ? (
                        <Box className="w-full h-[200px] border border-border rounded-lg overflow-hidden">
                          <iframe
                            src={`${filePreview}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full"
                            title="PDF Preview"
                            onError={(e) => {
                              console.error("PDF preview failed to load:", e);
                            }}
                          />
                        </Box>
                      ) : (
                        <Box className="w-full h-[200px] border border-border rounded-lg bg-muted/50 flex flex-col items-center justify-center">
                          <Box className="text-center">
                            <img
                              src="/dashboard/file-icon.svg"
                              alt="File"
                              className="size-16 mx-auto mb-2 opacity-60"
                            />
                            <p className="text-sm text-muted-foreground font-medium">
                              File Attached
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Preview not available for this file type
                            </p>
                          </Box>
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
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
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
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          className="max-w-70"
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < todayStart}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem className="mb-1">
                    <FormLabel>Assign To:</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl className="w-full h-12">
                        <SelectTrigger
                          size="lg"
                          className="bg-muted border border-border rounded-full w-full h-12 placeholder:text-muted-foreground"
                        >
                          <SelectValue placeholder="Select Team Member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        {usersResponse?.data?.userMembers?.map((userMember) => (
                          <SelectItem
                            key={userMember.id}
                            value={userMember.user?.id || userMember.id}
                            disabled={!userMember.user?.id}
                          >
                            {userMember.user?.name ||
                              `${userMember.firstname} ${userMember.lastname}`.trim()} (
                            {userMember.email})
                            {!userMember.user?.id && " (No user account)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mt-3 max-sm:mt-0">
              <FormField
                control={form.control}
                name="startAfter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start After</FormLabel>
                    <Select
                      value={
                        field.value &&
                        dependencyOptions.some((t) => t.id === field.value)
                          ? field.value
                          : undefined
                      }
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.trigger(["startAfter", "finishBefore"]);
                      }}
                      disabled={
                        !assignedTo ||
                        (!!assignedTo && isDependencyOptionsLoading)
                      }
                    >
                      <FormControl className="w-full h-12">
                        <SelectTrigger
                          size="lg"
                          className="bg-muted border border-border rounded-full w-full h-12 placeholder:text-muted-foreground disabled:opacity-60"
                        >
                          <SelectValue placeholder="Select task (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        {dependencyOptions.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="finishBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Finish Before</FormLabel>
                    <Select
                      value={
                        field.value &&
                        dependencyOptions.some((t) => t.id === field.value)
                          ? field.value
                          : undefined
                      }
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.trigger(["startAfter", "finishBefore"]);
                      }}
                      disabled={
                        !assignedTo ||
                        (!!assignedTo && isDependencyOptionsLoading)
                      }
                    >
                      <FormControl className="w-full h-12">
                        <SelectTrigger
                          size="lg"
                          className="bg-muted border border-border rounded-full w-full h-12 placeholder:text-muted-foreground disabled:opacity-60"
                        >
                          <SelectValue placeholder="Select task (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        {dependencyOptions.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mt-3 max-sm:mt-0">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date:</FormLabel>
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
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          className="max-w-70"
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) =>
                            date < startOfDay(watchedStartDate || new Date())
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

            <Box className="grid grid-cols-1 gap-6 max-md:grid-cols-1 mt-3">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description:</FormLabel>
                    <FormControl>
                      <Textarea
                        className="bg-card rounded-md placeholder:text-muted-foreground h-32"
                        placeholder="Enter Task Description"
                        rows={6}
                        cols={18}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>
          </Box>
        </form>
      </Form>
    </>
  );

  // If modal mode, wrap in modal structure
  if (isModal) {
    return (
      <Box className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <Box
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Modal Content */}
        <Box className="relative bg-background rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <Box className="p-6 relative max-h-[90vh] overflow-y-auto">
            {content}
          </Box>
        </Box>
      </Box>
    );
  }

  // Normal page mode
  return <PageWrapper className="mt-6 p-6 relative">{content}</PageWrapper>;
};
