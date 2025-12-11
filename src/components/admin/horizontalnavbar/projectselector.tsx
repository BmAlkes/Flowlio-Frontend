import {
  Select,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useFetchViewerProjects,
  type ViewerProject,
} from "@/hooks/useFetchViewerProjects";
import { useLocation, useNavigate } from "react-router";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { useTranslation } from "react-i18next";

export const ProjectSelector: React.FC<{
  selectTriggerClassname?: string;
  // Optional pre-fetched data and custom path resolver
  projects?: ViewerProject[];
  getProjectPath?: (projectId: string, pathname: string) => string;
}> = ({ selectTriggerClassname, projects: projectsProp, getProjectPath }) => {
  const { data: viewerProjects } = useFetchViewerProjects();
  const { data: orgProjects } = useFetchProjects();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isViewer = pathname.startsWith("/viewer");
  const fetched = isViewer
    ? viewerProjects?.data
    : (orgProjects?.data as any[] | undefined);
  // Normalize org project shape to ViewerProject-lite shape
  const normalized = (fetched || []).map((p: any) => ({
    id: p.id,
    name: p.name || p.projectName,
    projectNumber: p.projectNumber,
  })) as ViewerProject[];
  const projects =
    (projectsProp && projectsProp.length > 0 ? projectsProp : normalized) || [];
  return (
    <Select
      onValueChange={(projectId) => {
        if (!projectId) return;
        const target = getProjectPath
          ? getProjectPath(projectId, pathname)
          : pathname.startsWith("/viewer")
          ? `/viewer/projects/${projectId}`
          : `/dashboard/project/view/${projectId}`;
        navigate(target);
      }}
    >
      <SelectTrigger
        className={cn(
          "rounded-full min-h-10 border border-gray-200",
          selectTriggerClassname
        )}
      >
        <SelectValue placeholder={t("horizontalnavbar.selectProject")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t("horizontalnavbar.selectProject")}</SelectLabel>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.projectNumber ? `${p.projectNumber} — ${p.name}` : p.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
