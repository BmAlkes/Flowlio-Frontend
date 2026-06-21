import { useState } from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAILogs, AILogsFilters } from "@/hooks/useAILogs";
import { TableSkeleton } from "@/components/skeletons";
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

const FEATURES = [
  { value: "", label: "All features" },
  { value: "conversation", label: "Conversation" },
  { value: "image_generation", label: "Image Generation" },
  { value: "task_generation", label: "Task Generation" },
  { value: "proposal_generation", label: "Proposal Generation" },
  { value: "weekly_summary", label: "Weekly Summary" },
  { value: "project_insights", label: "Project Insights" },
  { value: "event_suggestion", label: "Event Suggestion" },
  { value: "description_enhance", label: "Description Enhance" },
];

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
  rate_limited: "bg-yellow-100 text-yellow-700",
  quota_exceeded: "bg-orange-100 text-orange-700",
};

export const AILogsSection = () => {
  const [filters, setFilters] = useState<AILogsFilters>({
    page: 1,
    limit: 25,
  });

  const { data, isLoading } = useAILogs(filters);

  const updateFilter = (key: keyof AILogsFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === "page" ? value as number : 1 }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          AI Usage Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary cards */}
        {data?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Box className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-muted-foreground">Total Requests</p>
              <p className="text-xl font-bold text-foreground">{data.summary.totalRequests.toLocaleString()}</p>
            </Box>
            <Box className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
              <Flex className="items-center gap-1">
                <Zap className="h-3 w-3 text-purple-500" />
                <p className="text-xs text-muted-foreground">Total Tokens</p>
              </Flex>
              <p className="text-xl font-bold text-foreground">{data.summary.totalTokens.toLocaleString()}</p>
            </Box>
            <Box className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
              <Flex className="items-center gap-1">
                <Clock className="h-3 w-3 text-green-500" />
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </Flex>
              <p className="text-xl font-bold text-foreground">{Math.round(data.summary.avgDurationMs)}ms</p>
            </Box>
            <Box className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900">
              <Flex className="items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                <p className="text-xs text-muted-foreground">Error Rate</p>
              </Flex>
              <p className="text-xl font-bold text-foreground">{data.summary.errorRate.toFixed(1)}%</p>
            </Box>
          </div>
        )}

        {/* Filters */}
        <Flex className="gap-3 mb-4 flex-wrap">
          <Select
            value={filters.feature ?? ""}
            onValueChange={(v) => updateFilter("feature", v)}
          >
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="All features" />
            </SelectTrigger>
            <SelectContent>
              {FEATURES.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status ?? ""}
            onValueChange={(v) => updateFilter("status", v)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="rate_limited">Rate Limited</SelectItem>
              <SelectItem value="quota_exceeded">Quota Exceeded</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            className="w-[150px] h-9"
            value={filters.from ?? ""}
            onChange={(e) => updateFilter("from", e.target.value)}
            placeholder="From"
          />
          <Input
            type="date"
            className="w-[150px] h-9"
            value={filters.to ?? ""}
            onChange={(e) => updateFilter("to", e.target.value)}
            placeholder="To"
          />
        </Flex>

        {/* Table */}
        {isLoading ? (
          <TableSkeleton rows={8} columns={7} />
        ) : (
          <>
            <Box className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Organisation</TableHead>
                    <TableHead className="text-xs">Feature</TableHead>
                    <TableHead className="text-xs text-right">Tokens</TableHead>
                    <TableHead className="text-xs text-right">Duration</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                    <TableHead className="text-xs text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.logs && data.logs.length > 0 ? (
                    data.logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          <Box className="truncate max-w-[140px]">{log.userEmail ?? log.userName ?? log.userId.slice(0, 8)}</Box>
                        </TableCell>
                        <TableCell className="text-sm">
                          <Box className="truncate max-w-[120px]">{log.organizationName ?? log.organizationId.slice(0, 8)}</Box>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-normal">{log.feature}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-right font-mono">{log.tokensUsed.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-right text-muted-foreground">
                          {log.durationMs ? `${log.durationMs}ms` : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs ${STATUS_COLORS[log.status] ?? "bg-gray-100 text-gray-700"}`}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-right text-muted-foreground">
                          {format(new Date(log.createdAt), "MMM d, HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No logs found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <Flex className="items-center justify-between mt-4 px-1">
                <Box className="text-sm text-muted-foreground">
                  Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{" "}
                  {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
                  {data.pagination.total} logs
                </Box>
                <Flex className="items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter("page", data.pagination.page - 1)}
                    disabled={data.pagination.page <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Box className="text-sm text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </Box>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter("page", data.pagination.page + 1)}
                    disabled={data.pagination.page >= data.pagination.totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Flex>
              </Flex>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
