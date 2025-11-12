import { ChevronDown, Grip, List, Search } from "lucide-react";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import KanbanBoard from "./mytaskkanbanboard";
import { Flex } from "@/components/ui/flex";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { MyTaskTable } from "./mytasktable";
import { useFetchViewerTasks, ViewerTask } from "@/hooks/useFetchViewerTasks";
import { format } from "date-fns";

// Task type for kanban board
type Task = {
  id: string;
  title: string;
  project: string;
  comments?: string;
  endDate: string;
  status:
    | "To Do"
    | "In Progress"
    | "Completed"
    | "Updated"
    | "Delay"
    | "Changes";
  creatorName?: string;
  creatorEmail?: string;
};

// Map backend status to frontend status
const mapStatusToDisplay = (status: string): Task["status"] => {
  switch (status) {
    case "todo":
      return "To Do";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "updated":
      return "Updated";
    case "delay":
      return "Delay";
    case "changes":
      return "Changes";
    default:
      return "To Do";
  }
};

export const MyTaskHeader = () => {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  const { data: tasksResponse } = useFetchViewerTasks();
  const tasks = tasksResponse?.data || [];

  // Get unique projects from tasks
  const uniqueProjects = Array.from(
    new Set(tasks.map((task) => task.projectName))
  );

  // Convert ViewerTask to Task format
  const convertViewerTasksToTasks = (viewerTasks: ViewerTask[]): Task[] => {
    return viewerTasks.map((task) => ({
      id: task.id,
      title: task.title,
      project: task.projectName,
      comments: task.description,
      endDate: task.endDate
        ? format(new Date(task.endDate), "MMM dd, yyyy")
        : "",
      status: mapStatusToDisplay(task.status),
      creatorName: task.creatorName,
      creatorEmail: task.creatorEmail,
    }));
  };

  // Filter tasks by search query and selected project
  const filteredViewerTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.projectName.toLowerCase().includes(search.toLowerCase());

    const matchesProject =
      selectedProject === "all" || task.projectName === selectedProject;

    return matchesSearch && matchesProject;
  });

  // Convert filtered tasks to Task format
  const filteredTasks = convertViewerTasksToTasks(filteredViewerTasks);

  return (
    <PageWrapper className="mt-6 p-4">
      <Stack className="gap-4 py-2">
        <Center className="justify-between max-sm:flex-col max-sm:items-start gap-2">
          <Stack className="gap-1">
            <h1 className="text-black text-2xl max-sm:text-xl font-medium">
              My Tasks
            </h1>
            <h1 className={`max-sm:text-sm text-[#616572]`}>
              Track and manage your assigned tasks with real-time progress and
              time logging. Drag and drop tasks to update their status.
            </h1>
          </Stack>
        </Center>

        <Flex className="justify-between max-sm:items-start flex-col lg:flex-row items-center w-full gap-4">
          <Flex className={cn("relative md:ml-auto w-full")}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5.5 w-5.5 text-gray-300 font-light" />
            <Input
              type="search"
              placeholder="Search My Tasks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-115 lg:w-80 xl:w-[400px] py-4 pl-10 bg-white h-10  placeholder:text-gray-700  placeholder:text-[15px] border border-gray-100 focus:outline-none active:border-gray-200 focus:ring-0 focus:ring-offset-0 rounded-full"
            />
          </Flex>

          <Flex className="max-md:w-full justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  aria-haspopup="dialog"
                  className={cn(
                    "ml-auto cursor-pointer bg-white border border-gray-200 rounded-full h-10 w-40 text-black shadow-none flex p-3 gap-8"
                  )}
                >
                  {selectedProject === "all" ? "All Projects" : selectedProject}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={selectedProject === "all"}
                  onCheckedChange={() => setSelectedProject("all")}
                >
                  All Projects
                </DropdownMenuCheckboxItem>
                {uniqueProjects.map((projectName) => (
                  <DropdownMenuCheckboxItem
                    key={projectName}
                    checked={selectedProject === projectName}
                    onCheckedChange={() => setSelectedProject(projectName)}
                  >
                    {projectName}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className={cn(
                "bg-white text-white border border-gray-200 rounded-lg px-4 py-5 gap-2 cursor-pointer hover:bg-gray-100",
                view === "table" && "bg-blue-50 border-blue-300"
              )}
              onClick={() => setView("table")}
            >
              <List className="text-black size-5" />
            </Button>
            <Button
              className={cn(
                "bg-white text-white border border-gray-200 rounded-lg px-4 py-5 gap-2 cursor-pointer hover:bg-gray-100",
                view === "kanban" && "bg-blue-50 border-blue-300"
              )}
              onClick={() => setView("kanban")}
            >
              <Grip className="text-black size-4.5" />
            </Button>
          </Flex>
        </Flex>
      </Stack>

      {view === "kanban" ? (
        <KanbanBoard filteredTasks={filteredTasks} />
      ) : (
        <MyTaskTable filteredTasks={filteredViewerTasks} />
      )}
    </PageWrapper>
  );
};
