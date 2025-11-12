import { Stat, Stats } from "@/components/admin/dashboard/stats";
import { Stack } from "@/components/ui/stack";
import img1 from "/viewer/taskicon.svg";
import {
  ViewerBarChartComponent,
  type ViewerChartPoint,
} from "@/components/viewer section/viewer barchart/viewerbarchart";
import { ViewerTable } from "@/components/viewer section/viewer barchart/viewertable";
import TimeModal from "@/components/timemodal";
import { useFetchViewerTasks } from "@/hooks/useFetchViewerTasks";
import { useFetchViewerProjects } from "@/hooks/useFetchViewerProjects";
import { useActiveTimeEntries } from "@/hooks/useTimeTracking";
import { useAllTimeEntries } from "@/hooks/useAllTimeEntries";
import { format, startOfDay, endOfDay } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";

const ViewerDashboardPage = () => {
  // Fetch real data
  const { data: tasksResponse } = useFetchViewerTasks();
  const { data: projectsResponse } = useFetchViewerProjects();
  const { data: activeTimeEntries } = useActiveTimeEntries();
  const { data: allTimeEntries } = useAllTimeEntries();
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  // Calculate stats from data
  const totalTasks = tasksResponse?.data?.length ?? 0;
  const totalProjects = projectsResponse?.data?.length ?? 0;
  const completedTasks =
    tasksResponse?.data?.filter((task) => task.status === "completed").length ??
    0;

  // Get active time entry
  const activeTimeEntry = activeTimeEntries?.data?.[0];
  const isTracking = !!activeTimeEntry;

  // Real-time elapsed time state for active tracking
  const [elapsedTime, setElapsedTime] = useState(0);

  // Calculate total hours from all time entries
  const totalProductionHours = useMemo(() => {
    if (!allTimeEntries?.data) return 0;
    const totalMinutes = allTimeEntries.data.reduce((acc, entry) => {
      return acc + (entry.duration || 0);
    }, 0);
    return Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimal places
  }, [allTimeEntries]);

  // Update elapsed time every second when tracking
  useEffect(() => {
    if (activeTimeEntry && isTracking) {
      const calculateElapsed = () => {
        const start = new Date(activeTimeEntry.startTime).getTime();
        const now = new Date().getTime();
        return Math.floor((now - start) / 1000); // seconds
      };

      setElapsedTime(calculateElapsed());
      const interval = setInterval(() => {
        setElapsedTime(calculateElapsed());
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [activeTimeEntry, isTracking]);

  // Format time as h:m:s for display
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  // Format elapsed time for description
  const formatElapsedForDescription = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
  };

  // Calculate percentage for circular progress (based on 8 hours work day)
  const progressPercentage = useMemo(() => {
    if (!isTracking || !elapsedTime) return 0;
    const hoursElapsed = elapsedTime / 3600;
    return Math.min(Math.round((hoursElapsed / 8) * 100), 100);
  }, [elapsedTime, isTracking]);

  // Build chart data from all time entries: counts by weekday per month
  const chartData: ViewerChartPoint[] = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    // Build months list depending on selected range
    const buildMonths = (): string[] => {
      if (dateRange?.from && dateRange?.to) {
        const start = dateRange.from;
        const end = dateRange.to;
        const result: string[] = [];
        const cur = new Date(start.getFullYear(), start.getMonth(), 1);
        const last = new Date(end.getFullYear(), end.getMonth(), 1);
        while (cur <= last) {
          const mi = cur.getMonth();
          result.push(mi === 8 ? "Sept" : monthNames[mi]);
          cur.setMonth(cur.getMonth() + 1);
        }
        return result;
      }
      return monthNames;
    };
    const months = buildMonths();
    const initMonth = () => ({
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thurs: 0,
      Fri: 0,
      Sat: 0,
    });
    const byMonth: Record<
      string,
      {
        Mon: number;
        Tue: number;
        Wed: number;
        Thurs: number;
        Fri: number;
        Sat: number;
      }
    > = {};
    months.forEach((m) => (byMonth[m] = initMonth()));

    const entries = (allTimeEntries?.data || []).filter((e) => {
      const d = new Date(e.startTime);
      if (dateRange?.from && dateRange?.to) {
        const from = startOfDay(dateRange.from);
        const to = endOfDay(dateRange.to);
        return d >= from && d <= to;
      }
      // No default year filter: include all entries
      return true;
    });
    for (const e of entries) {
      const date = new Date(e.startTime);
      const monthIdx = date.getMonth();
      const monthKey = monthIdx === 8 ? "Sept" : monthNames[monthIdx];
      const day = date.getDay(); // 0 Sun .. 6 Sat
      const key =
        day === 1
          ? "Mon"
          : day === 2
          ? "Tue"
          : day === 3
          ? "Wed"
          : day === 4
          ? "Thurs"
          : day === 5
          ? "Fri"
          : day === 6
          ? "Sat"
          : null;
      if (!key) continue; // skip Sundays to match existing design (Mon-Sat)
      byMonth[monthKey][key as keyof (typeof byMonth)[string]] += 1;
    }

    return months.map(
      (m) => ({ month: m, ...byMonth[m] } as unknown as ViewerChartPoint)
    );
  }, [allTimeEntries, dateRange]);

  // Build stats array
  const stats: Stat[] = [
    {
      link: "/viewer/my-tasks",
      title: "Total Tasks",
      description: "All tasks assigned to you",
      icon: img1,
      count: String(totalTasks),
    },
    {
      link: "/viewer/my-projects",
      title: "Total Projects",
      description: "Projects you're involved in",
      icon: img1,
      count: String(totalProjects),
    },
    {
      link: "/viewer/my-tasks",
      title: "Completed Tasks",
      icon: img1,
      description: "Tasks you've finished",
      count: String(completedTasks),
    },
    {
      link: "/viewer/time-tracking",
      title: "Active Task Hour",
      description:
        isTracking && activeTimeEntry
          ? `${format(new Date(activeTimeEntry.startTime), "PPp")} - ${
              activeTimeEntry.taskTitle
            }`
          : "No active tracking",
      icon: img1,
      count: isTracking ? formatElapsedForDescription(elapsedTime) : "0s",
    },
  ];

  return (
    <Stack className="pt-5 gap-3 px-2">
      <Stats
        isViewer={true}
        stats={stats}
        classNameDescription="text-[13px] leading-4"
        activeTimeData={
          isTracking
            ? {
                elapsedTime: formatElapsedTime(elapsedTime),
                elapsedSeconds: elapsedTime,
                progressPercentage: progressPercentage,
              }
            : undefined
        }
        totalProductionHours={totalProductionHours}
      />
      <Stack className="w-full">
        <ViewerBarChartComponent
          data={chartData}
          dateRange={dateRange || undefined}
          onApplyDateRange={(r) => {
            if (!r?.from || !r?.to) return;
            // Normalize order and snap to full days
            const start = r.from <= r.to ? r.from : r.to;
            const end = r.to >= r.from ? r.to : r.from;
            setDateRange({ from: startOfDay(start), to: endOfDay(end) });
          }}
          onResetDateRange={() => setDateRange(null)}
        />
      </Stack>

      <ViewerTable />
      <TimeModal />
    </Stack>
  );
};

export default ViewerDashboardPage;
