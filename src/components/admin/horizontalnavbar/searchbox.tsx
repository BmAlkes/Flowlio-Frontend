import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RiSearch2Line } from "react-icons/ri";
import { Stack } from "@/components/ui/stack";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import {
  useFetchViewerProjects,
  type ViewerProject,
} from "@/hooks/useFetchViewerProjects";
import {
  useFetchViewerTasks,
  type ViewerTask,
} from "@/hooks/useFetchViewerTasks";
import { useNavigate, useLocation } from "react-router";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { useTranslation } from "react-i18next";

export const SearchBox: React.FC<{
  className?: string;
  projects?: ViewerProject[];
  tasks?: ViewerTask[];
  getProjectPath?: (projectId: string, pathname: string) => string;
  getTasksPath?: (query: string, pathname: string) => string;
}> = ({
  className,
  projects: projectsProp,
  tasks: tasksProp,
  getProjectPath,
  getTasksPath,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const { data: viewerProjects } = useFetchViewerProjects();
  const { data: orgProjects } = useFetchProjects();
  const { data: tasksRes } = useFetchViewerTasks();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isViewer = pathname.startsWith("/viewer");
  const fetched = isViewer
    ? viewerProjects?.data
    : ((orgProjects?.data as any[] | undefined)?.map((p: any) => ({
        id: p.id,
        name: p.name || p.projectName,
        projectNumber: p.projectNumber,
      })) as ViewerProject[] | undefined);
  const projects =
    (projectsProp && projectsProp.length > 0 ? projectsProp : fetched) || [];
  const tasks =
    (tasksProp && tasksProp.length > 0 ? tasksProp : tasksRes?.data) || [];

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.projectNumber || "").toLowerCase().includes(q)
    );
  }, [projects, query]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tasks, query]);

  const handleSubmit = () => {
    const topProject = filteredProjects[0];
    if (topProject) {
      const target = getProjectPath
        ? getProjectPath(topProject.id, pathname)
        : pathname.startsWith("/viewer")
        ? `/viewer/projects/${topProject.id}`
        : `/dashboard/project/view/${topProject.id}`;
      navigate(target);
      return;
    }
    // Otherwise go to tasks list with query param
    const q = query.trim();
    const target = getTasksPath
      ? getTasksPath(q, pathname)
      : pathname.startsWith("/viewer")
      ? `/viewer/my-tasks?q=${encodeURIComponent(q)}`
      : `/dashboard/task-management?q=${encodeURIComponent(q)}`;
    navigate(target);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full h-[2.5rem] w-[200px] max-lg:w-full text-gray-500 hover:bg-white! hover:text-gray-500 border-none items-center justify-start"
        >
          <RiSearch2Line />
          <h1 className="max-md:hidden">{t("horizontalnavbar.search")}</h1>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] top-40" withoutCloseButton>
        <Stack className={className}>
          <Input
            placeholder="Search projects or tasks..."
            className="bg-white min-h-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          {/* Simple suggestions */}
          {query && (
            <div className="bg-white rounded-md border border-gray-200 max-h-56 overflow-auto">
              {filteredProjects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    const target = getProjectPath
                      ? getProjectPath(p.id, pathname)
                      : pathname.startsWith("/viewer")
                      ? `/viewer/projects/${p.id}`
                      : `/dashboard/project/view/${p.id}`;
                    navigate(target);
                  }}
                >
                  {p.projectNumber ? `${p.projectNumber} — ${p.name}` : p.name}
                </div>
              ))}
              {filteredTasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    navigate(
                      `/viewer/my-tasks?q=${encodeURIComponent(t.title)}`
                    )
                  }
                >
                  {t.title}
                </div>
              ))}
              {filteredProjects.length === 0 && filteredTasks.length === 0 && (
                <div className="px-3 py-2 text-gray-500">No results</div>
              )}
            </div>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
