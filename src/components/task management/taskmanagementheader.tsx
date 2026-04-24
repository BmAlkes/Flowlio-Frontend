import { ChevronDown, CirclePlus } from "lucide-react";
import { PageWrapper } from "../common/pagewrapper";
import { Button } from "../ui/button";
import { Center } from "../ui/center";
import { Stack } from "../ui/stack";
import KanbanBoard, { initialTasks, Task as KanbanTask } from "./kanbanboard";
import { Flex } from "../ui/flex";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { CustomDropdown, CustomDropdownItem } from "../ui/custom-dropdown";
import { useFetchTasks } from "@/hooks/usefetchtasks";
import { useFetchOrganizationUsers } from "@/hooks/usefetchorganizationusers";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { useFetchCustomFields } from "@/hooks/usecustomfields";
// removed client-specific hooks
import { useUpdateTaskStatus } from "@/hooks/useupdatetask";
import { format } from "date-fns";
import { TaskDetailsModal } from "./taskdetailsmodal";
import { useTranslation } from "react-i18next";
import { KanbanSkeleton } from "@/components/skeletons";

export const TaskManagementHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // client-specific logic removed

  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasInitializedProject = useRef(false);

  const orgTasks = useFetchTasks();
  const orgUsers = useFetchOrganizationUsers();
  const orgProjects = useFetchProjects();
  const { data: customFieldsData } = useFetchCustomFields("project");

  const tasksResponse = orgTasks.data;
  const usersResponse = orgUsers.data;
  const projectsResponse = orgProjects.data;

  // Show skeleton while tasks or projects are loading
  const isLoadingData =
    orgTasks.isLoading || orgTasks.isFetching ||
    orgProjects.isLoading || orgProjects.isFetching;

  const updateTaskStatus = useUpdateTaskStatus();

  const realTasks = tasksResponse?.data || [];
  const users = usersResponse?.data?.userMembers || [];
  const projects = projectsResponse?.data || [];

  // Set first project as default when projects are loaded (only once)
  // But allow user to select "All Projects" to see all tasks
  useEffect(() => {
    if (projects.length > 0 && !hasInitializedProject.current) {
      setSelectedProjects([projects[0].id]);
      hasInitializedProject.current = true;
    }
  }, [projects]);

  // Helper function to map API status to KanbanBoard status
  const mapStatusToKanban = (apiStatus: string) => {
    const statusMap: Record<string, string> = {
      todo: "To Do",
      in_progress: "In Progress",
      updated: "Updated",
      delay: "Delay",
      changes: "Changes",
      completed: "Completed",
    };
    return statusMap[apiStatus] || "To Do";
  };

  // Map real tasks to KanbanBoard format, or use initial tasks
  const tasks: KanbanTask[] =
    realTasks.length > 0
      ? realTasks.map((task) => {
          const project = projects.find((p) => p.id === task.projectId);
          const assignee = users.find(
            (u) =>
              (u.user?.id === task.assigneeId || u.id === task.assigneeId) &&
              u.user?.name,
          );
          return {
            id: task.id,
            title: task.title,
            project: task.projectName || t("taskManagement.unknownProject"),
            projectId: task.projectId,
            dueDate: task.endDate
              ? format(new Date(task.endDate), "dd MMM, yyyy")
              : t("taskManagement.noDueDate"),
            status: mapStatusToKanban(task.status) as any,
            comments: [],
            description: task.description,
            assigneeName: assignee?.user?.name || task.assigneeName,
            assigneeImage: task.assigneeImage,
            creatorName: task.creatorName,
            attachments: task.attachments,
            parentId: task.parentId,
            parentTitle: task.parentId
              ? realTasks.find((rt) => rt.id === task.parentId)?.title
              : undefined,
            startAfter: task.startAfter ?? undefined,
            finishBefore: task.finishBefore ?? undefined,
            projectCustomFields: project?.customFields,
          };
        })
      : initialTasks;
  const setTasks = () => {}; // No-op since we're using real data

  // Filter tasks by search query, selected users, and selected projects
  // Show all tasks if no projects selected (user selected "All Projects")
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.project.toLowerCase().includes(search.toLowerCase());

    // For real tasks, we need to check the original data for assigneeId and projectId
    const realTask = realTasks.find((rt) => rt.id === task.id);
    const matchesUser =
      selectedUsers.length === 0 ||
      (realTask && selectedUsers.includes(realTask.assigneeId || ""));

    // If no projects selected, show all tasks (user selected "All Projects")
    // Otherwise, only show tasks from selected projects
    const matchesProject =
      selectedProjects.length === 0 ||
      (realTask && selectedProjects.includes(realTask.projectId || ""));

    return matchesSearch && matchesUser && matchesProject;
  });

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Handle task status update from drag and drop
  const handleStatusUpdate = (taskId: string, status: string) => {
    updateTaskStatus.mutate({
      taskId,
      status: status as any,
    });
  };

  // Handle task click to open modal
  const handleTaskClick = (task: KanbanTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <PageWrapper className="mt-6 p-4">
      <Stack className="gap-4 py-2">
        <Center className="justify-between max-sm:flex-col max-sm:items-start gap-2">
          <Stack className="gap-1">
            <h1 className="text-foreground text-3xl max-sm:text-xl font-medium">
              {t("appSidebar.tasksManagement")}
            </h1>
            <h1 className={`max-sm:text-sm text-[#616572]`}>
              {t("taskManagement.subtitle")}
            </h1>
          </Stack>

            <Button
              variant="outline"
              className="bg-black text-white border border-border  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/dashboard/task-management/create-task")}
            >
              <CirclePlus className="size-5 text-white" />
              {t("taskManagement.createTask")}
            </Button>
        </Center>

        <Flex className="justify-between max-sm:items-start flex-col lg:flex-row items-center w-full gap-4">
          <Flex className={cn("relative md:ml-auto w-full")}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5.5 w-5.5 text-gray-300 font-light" />
            <Input
              type="search"
              placeholder={t("taskManagement.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-115 lg:w-80 xl:w-[400px] py-4 pl-10 bg-card h-10  placeholder:text-foreground  placeholder:text-[15px] border border-border rounded-md focus:outline-none active:border-border focus:ring-0 focus:ring-offset-0"
            />
          </Flex>

          <Flex className="max-md:w-full justify-between gap-2">
            {/* <CalendarComponent
              range={range}
              setRange={(range) => setRange(range as DateRange)}
            /> */}

            <CustomDropdown
              align="end"
              className="w-56"
              trigger={
                <Button
                  variant="ghost"
                  aria-haspopup="dialog"
                  className={cn(
                    "cursor-pointer bg-card border border-border rounded-full h-10 w-36 text-foreground shadow-none flex p-3 justify-between overflow-hidden"
                  )}
                >
                  <ChevronDown />
                  {selectedProjects.length > 0
                    ? selectedProjects.length === 1
                      ? projects.find((p) => p.id === selectedProjects[0])
                          ?.projectName || t("taskManagement.projects")
                      : t("taskManagement.nProjects", {
                          count: selectedProjects.length,
                        })
                    : t("taskManagement.projects")}
                </Button>
              }
            >
              <CustomDropdownItem
                checked={selectedProjects.length === 0}
                onClick={() => setSelectedProjects([])}
              >
                {t("taskManagement.allProjects")}
              </CustomDropdownItem>
              {projects.map((project) => (
                <CustomDropdownItem
                  key={project.id}
                  checked={selectedProjects.includes(project.id)}
                  onClick={() => handleProjectToggle(project.id)}
                >
                  {project.projectName.length > 10
                    ? project.projectName.slice(0, 20) + "..."
                    : project.projectName}
                </CustomDropdownItem>
              ))}
            </CustomDropdown>

            <CustomDropdown
              align="end"
              className="w-56"
              trigger={
                <Button
                  variant="ghost"
                  aria-haspopup="dialog"
                  className={cn(
                    "ml-auto cursor-pointer bg-card border border-border rounded-full h-10 w-32 text-foreground shadow-none flex p-3 gap-8 overflow-hidden"
                  )}
                >
                  <ChevronDown />
                  {selectedUsers.length > 0
                    ? selectedUsers.length === 1
                      ? users.find((u) => u.user?.id === selectedUsers[0])
                          ?.user?.name ||
                        users.find((u) => u.user?.id === selectedUsers[0])
                          ?.firstname ||
                        t("taskManagement.users")
                      : t("taskManagement.nUsers", {
                          count: selectedUsers.length,
                        })
                    : t("taskManagement.users")}
                </Button>
              }
            >
              <CustomDropdownItem
                checked={selectedUsers.length === 0}
                onClick={() => setSelectedUsers([])}
              >
                {t("taskManagement.allUsers")}
              </CustomDropdownItem>
              {users.map((user) => (
                <CustomDropdownItem
                  key={user.id}
                  checked={selectedUsers.includes(user.user?.id || user.id)}
                  onClick={() => handleUserToggle(user.user?.id || user.id)}
                >
                  {user.user?.name || `${user.firstname} ${user.lastname}`.trim()}
                </CustomDropdownItem>
              ))}
            </CustomDropdown>
          </Flex>
        </Flex>
      </Stack>

      <KanbanBoard
        tasks={tasks}
        setTasks={setTasks}
        filteredTasks={isLoadingData ? [] : filteredTasks}
        onStatusUpdate={handleStatusUpdate}
        onTaskClick={handleTaskClick}
        projectCustomFieldsData={customFieldsData?.data}
      />

      {/* Kanban skeleton overlay while loading */}
      {isLoadingData && (
        <KanbanSkeleton columns={5} cardsPerColumn={3} />
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={{
            id: selectedTask.id,
            title: selectedTask.title,
            description: selectedTask.description,
            project: selectedTask.project,
            projectId: selectedTask.projectId,
            dueDate: selectedTask.dueDate,
            status: selectedTask.status,
            assigneeName: selectedTask.assigneeName,
            assigneeImage: selectedTask.assigneeImage,
            creatorName: selectedTask.creatorName,
            attachments: selectedTask.attachments,
            parentId: selectedTask.parentId,
            parentTitle: selectedTask.parentTitle,
            startAfter: selectedTask.startAfter,
            finishBefore: selectedTask.finishBefore,
          }}
          allTasks={tasks}
          onOpenTask={(taskId) => {
            const t = tasks.find((x) => x.id === taskId);
            if (t) setSelectedTask(t);
          }}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </PageWrapper>
  );
};
