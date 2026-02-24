import {
  GanttCreateMarkerTrigger,
  GanttFeature,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureRow,
  GanttHeader,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttToday,
} from "@/components/kibo-ui/gantt";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { useUpdateProject } from "@/hooks/useupdateproject";
import { useFetchTasks } from "@/hooks/usefetchtasks";
import { useUpdateTask } from "@/hooks/useupdatetask";
import { useGetCurrentOrgUserMembers } from "@/hooks/usegetallusermembers";
import { EyeIcon, LinkIcon, Loader2, Users, LayoutDashboard } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flex } from "@/components/ui/flex";
import { Label } from "@/components/ui/label";
import { Range } from "@/components/kibo-ui/gantt";

// Status colors mapping
const statusColors: Record<string, string> = {
  pending: "#F98618",
  ongoing: "#005FA4",
  delayed: "#EF5350",
  completed: "#00A400",
  // Task specific statuses
  todo: "#94a3b8",
  in_progress: "#005FA4",
  updated: "#10b981",
  delay: "#EF5350",
  changes: "#f59e0b",
};

interface GenericGanttProps {
  features: GanttFeature[];
  onMove?: (id: string, startAt: Date, endAt: Date | null) => void;
  isLoading?: boolean;
  onSelectItem?: (id: string) => void;
  emptyMessage?: string;
  sidebarTitle?: string;
  range?: Range;
  initialDate?: Date;
  yearCount?: number;
}

/**
 * A reusable Gantt Chart component that focuses on UI rendering.
 */
export const GenericGantt = ({
  features,
  onMove,
  isLoading,
  onSelectItem,
  emptyMessage = "No items found",
  sidebarTitle = "",
  range = "monthly",
  initialDate = new Date(),
  yearCount = 1,
}: GenericGanttProps) => {
  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/project/${id}`);
    console.log(`Copy link: ${id}`);
  };

  const groupedByLane = useMemo(() => {
    return groupBy(features, "lane");
  }, [features]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 ">Loading timeline...</span>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center border border-dashed rounded-lg ">
        {emptyMessage}
      </div>
    );
  }

  return (
    <GanttProvider
      className="border rounded-lg h-[500px]"
      range={range}
      zoom={100}
      initialDate={initialDate}
      yearCount={yearCount}
    >
      <GanttSidebar name={sidebarTitle}>
        <GanttSidebarGroup name={sidebarTitle}>
          {Object.entries(groupedByLane).map(([laneId, featuresInLane]) => {
            const firstFeature = featuresInLane[0];
            const laneMetadata = (firstFeature as any).metadata;
            
            return (
              <div key={laneId} className="flex items-center gap-2 group px-2">
                {laneMetadata?.assigneeImage && (
                  <Avatar className="h-6 w-6 shrink-0 border border-background shadow-sm">
                    <AvatarImage src={laneMetadata.assigneeImage} />
                    <AvatarFallback className="text-[10px]">
                      {laneMetadata.assigneeName?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <GanttSidebarItem
                  className="flex-1"
                  feature={{
                    ...firstFeature,
                    name: laneMetadata?.assigneeName 
                      ? `${laneMetadata.assigneeName} - ${firstFeature.name}`
                      : firstFeature.name,
                  }}
                  onSelectItem={onSelectItem ? () => onSelectItem(laneId) : undefined}
                />
              </div>
            );
          })}
        </GanttSidebarGroup>
      </GanttSidebar>
      <GanttTimeline>
        <GanttHeader />
        <GanttToday />
        <GanttFeatureList>
          {Object.entries(groupedByLane).map(([laneId, featuresInLane]) => (
            <GanttFeatureListGroup id={laneId} key={laneId}>
              <GanttFeatureRow features={featuresInLane} onMove={onMove}>
                {(feature) => (
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <div className="relative flex w-full h-full items-center px-2 overflow-hidden group">
                      {/* Progress background */}
                      {(feature as any).metadata?.progress !== undefined && (
                        <div
                          className="absolute inset-0 bg-green-500/10 transition-all group-hover:bg-green-500/20"
                          style={{ width: `${(feature as any).metadata.progress}%` }}
                        />
                      )}
                      
                      {/* Content */}
                      <div className="relative z-10 flex w-full items-center justify-between gap-2 overflow-hidden">
                        <div className="flex items-center gap-2 overflow-hidden">
                           {(feature as any).metadata?.clientImage && (
                            <Avatar className="h-4 w-4 shrink-0 border border-background shadow-sm">
                              <AvatarImage src={(feature as any).metadata.clientImage} />
                              <AvatarFallback className="text-[8px]">
                                {feature.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <p className="truncate text-[10px] font-medium leading-none">
                            {feature.name}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {(feature as any).metadata?.progress !== undefined && (
                            <span className="text-[9px] text-muted-foreground font-mono">
                              {(feature as any).metadata.progress}%
                            </span>
                          )}
                          <Badge 
                            variant="outline" 
                            className="h-3.5 px-1 text-[8px] uppercase font-bold border-none"
                            style={{ 
                              backgroundColor: `${feature.status.color}20`,
                              color: feature.status.color 
                            }}
                          >
                            {feature.status.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      className="flex items-center gap-2"
                      onClick={() => onSelectItem?.(feature.id)}
                    >
                      <EyeIcon size={14} />
                      View Details
                    </ContextMenuItem>
                    <ContextMenuItem
                      className="flex items-center gap-2"
                      onClick={() => handleCopyLink(feature.id)}
                    >
                      <LinkIcon size={14} />
                      Copy Link
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )}
              </GanttFeatureRow>
            </GanttFeatureListGroup>
          ))}
        </GanttFeatureList>
        <GanttCreateMarkerTrigger onCreateMarker={(d) => console.log(d)} />
      </GanttTimeline>
    </GanttProvider>
  );
};

import groupBy from "lodash.groupby";

/**
 * Workload-specific implementation of the Gantt chart.
 */
const WorkloadGantt = ({
  range,
  initialDate,
  yearCount,
}: {
  range: Range;
  initialDate: Date;
  yearCount: number;
}) => {
  const { data: membersData, isLoading: membersLoading } = useGetCurrentOrgUserMembers();
  const { data: tasksData, isLoading: tasksLoading } = useFetchTasks();
  const { mutate: updateTask } = useUpdateTask();

  const workloadFeatures = useMemo(() => {
    if (!membersData?.data?.userMembers || !tasksData?.data) return [];

    const members = membersData.data.userMembers;
    const tasks = tasksData.data;

    return tasks
      .filter((t) => t.startDate && t.endDate && t.assigneeId)
      .map((t) => {
        const member = members.find((m) => m.user?.id === t.assigneeId);
        return {
          id: t.id,
          name: t.title,
          startAt: new Date(t.startDate!),
          endAt: new Date(t.endDate!),
          status: {
            id: t.status,
            name: t.status.replace("_", " "),
            color: statusColors[t.status] || "#94a3b8",
          },
          lane: t.id,
          metadata: {
            assigneeName: t.assigneeName || member?.user?.name || "Unassigned",
            assigneeImage: t.assigneeImage || member?.user?.image,
            projectName: t.projectName,
            task: t,
          },
        };
      }) as GanttFeature[];
  }, [membersData, tasksData]);

  const handleMoveTask = (id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return;
    updateTask({
      taskId: id,
      data: {
        startDate: startAt.toISOString(),
        endDate: endAt.toISOString(),
      },
    });
  };

  return (
    <GenericGantt
      features={workloadFeatures}
      onMove={handleMoveTask}
      isLoading={membersLoading || tasksLoading}
      sidebarTitle="Teams"
      emptyMessage="No assigned tasks found for the team."
      range={range}
      initialDate={initialDate}
      yearCount={yearCount}
    />
  );
};

/**
 * Project-specific implementation of the Gantt chart.
 */
const ProjectGanttContent = ({
  range,
  initialDate,
  yearCount,
}: {
  range: Range;
  initialDate: Date;
  yearCount: number;
}) => {
  const { data: projectsData, isLoading } = useFetchProjects();
  const { mutate: updateProject } = useUpdateProject();

  const projectFeatures = useMemo(() => {
    if (!projectsData?.data) return [];
    
    return projectsData.data.map((p) => ({
      id: p.id,
      name: p.projectName,
      startAt: p.startDate ? new Date(p.startDate) : new Date(),
      endAt: p.endDate ? new Date(p.endDate) : new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      status: {
        id: p.status,
        name: p.status,
        color: statusColors[p.status] || "#94a3b8",
      },
      lane: p.id, // Separate row for each project
      metadata: {
        progress: p.progress,
        clientImage: p.clientImage,
        project: p,
      },
    })) as GanttFeature[];
  }, [projectsData]);

  const handleMoveProject = (id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return;
    updateProject({
      id,
      data: {
        startDate: startAt.toISOString(),
        endDate: endAt.toISOString(),
      },
    });
  };

  const handleSelectProject = (id: string) => {
    console.log(`Project selected: ${id}`);
  };

  return (
    <GenericGantt
      features={projectFeatures}
      onMove={handleMoveProject}
      isLoading={isLoading}
      onSelectItem={handleSelectProject}
      sidebarTitle="Projects"
      emptyMessage="No projects found for the selected period."
      range={range}
      initialDate={initialDate}
      yearCount={yearCount}
    />
  );
};

const ProjectGantt = () => {
  const [viewMode, setViewMode] = useState<"projects" | "workload">("projects");
  const [viewRange, setViewRange] = useState<Range>("monthly");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [yearRange, setYearRange] = useState<number>(1);

  const initialDate = useMemo(() => new Date(selectedYear, 0, 1), [selectedYear]);

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i);

  return (
    <div className="space-y-4">
      <Flex className="justify-between items-center bg-secondary/10 p-3 rounded-lg border">
        <Flex className="gap-6 items-center">
          {/* View Toggler */}
          <Flex className="bg-background p-1 rounded-md border shadow-sm">
            <button
              onClick={() => setViewMode("projects")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-medium transition-all cursor-pointer ${
                viewMode === "projects"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <LayoutDashboard size={14} />
              Project Timeline
            </button>
            <button
              onClick={() => setViewMode("workload")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-medium transition-all cursor-pointer ${
                viewMode === "workload"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Users size={14} />
              Team Workload
            </button>
          </Flex>

          <div className="h-8 w-px bg-border mx-2" />

          <Flex className="gap-4 items-center">
            <Flex className="flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()} className="text-xs">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Flex>

            <Flex className="flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Show Years</Label>
              <Select value={yearRange.toString()} onValueChange={(v) => setYearRange(parseInt(v))}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5].map((r) => (
                    <SelectItem key={r} value={r.toString()} className="text-xs">
                      {r} {r === 1 ? 'Year' : 'Years'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Flex>

            <Flex className="flex-col gap-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">View Mode</Label>
              <Select value={viewRange} onValueChange={(v) => setViewRange(v as Range)}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="View Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily" className="text-xs">Daily</SelectItem>
                  <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
                  <SelectItem value="quarterly" className="text-xs">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </Flex>
          </Flex>
        </Flex>
        
        <Flex className="flex-col gap-1 items-end">
           <span className="text-[10px] text-muted-foreground font-medium">Timeline Controls</span>
           <span className="text-[11px] font-bold">
            {viewMode === "projects" ? "Project" : "Workload"} - {viewRange.charAt(0).toUpperCase() + viewRange.slice(1)} View
           </span>
        </Flex>
      </Flex>

      {viewMode === "projects" ? (
        <ProjectGanttContent
          range={viewRange}
          initialDate={initialDate}
          yearCount={yearRange}
        />
      ) : (
        <WorkloadGantt
          range={viewRange}
          initialDate={initialDate}
          yearCount={yearRange}
        />
      )}
    </div>
  );
};

export default ProjectGantt;
