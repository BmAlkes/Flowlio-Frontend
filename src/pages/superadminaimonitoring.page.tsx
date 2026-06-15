import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Stack } from "@/components/ui/stack";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/skeletons";
import {
  ConfiguredAILimit,
  useAllAILimits,
  useRemoveAILimit,
  useSetAILimit,
} from "@/hooks/useAIMonitoring";
import { useGetPaidOrganizations } from "@/hooks/useFetchPaidOrganizations";
import { useTokenPackages } from "@/hooks/useAITokenTopup";
import { Zap, Star, Sparkles } from "lucide-react";

interface LimitFormState {
  mode: "create" | "edit";
  orgId: string;
  orgName: string;
  tokenLimit: number;
  alertThresholdPercent: number;
}

function getUsageColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-yellow-400";
  return "bg-green-500";
}

function UsageBar({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, Math.round(pct)));

  return (
    <div className="flex items-center gap-2 min-w-40">
      <div className="relative h-2 w-28 rounded-full bg-primary/20 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${getUsageColor(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-foreground">
        {clamped}%
      </span>
    </div>
  );
}

const PKG_ICONS: Record<string, typeof Zap> = {
  tokens_50k: Zap,
  tokens_100k: Star,
  tokens_250k: Sparkles,
};

function TokenPackagesInfo() {
  const { data: packages = [], isLoading } = useTokenPackages();
  if (isLoading || packages.length === 0) return null;
  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle className="text-foreground text-base">
          Available Token Packages (self-service)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Organisations can purchase these packages from their Subscription page to increase their monthly token limit.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {packages.map((pkg) => {
            const Icon = PKG_ICONS[pkg.id] ?? Zap;
            return (
              <div key={pkg.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 shrink-0">
                  <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm">{pkg.label}</p>
                  <p className="text-xs text-muted-foreground">${pkg.price} {pkg.currency} · one-time</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

const defaultLimit = 100000;
const defaultThreshold = 80;

const SuperAdminAIMonitoringPage = () => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<LimitFormState | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ConfiguredAILimit | null>(
    null
  );

  const { data: limits = [], isLoading: limitsLoading } = useAllAILimits();
  const { data: orgs = [], isLoading: orgsLoading } = useGetPaidOrganizations();
  const setLimitMutation = useSetAILimit();
  const removeLimitMutation = useRemoveAILimit();

  const configuredOrgIds = useMemo(
    () => new Set(limits.map((limit) => limit.organizationId)),
    [limits]
  );

  const availableOrgs = useMemo(
    () => orgs.filter((org) => !configuredOrgIds.has(org.id)),
    [configuredOrgIds, orgs]
  );

  const selectedCreateOrg = availableOrgs.find(
    (org) => org.id === formState?.orgId
  );

  const openCreateDialog = () => {
    setFormState({
      mode: "create",
      orgId: "",
      orgName: "",
      tokenLimit: defaultLimit,
      alertThresholdPercent: defaultThreshold,
    });
  };

  const openEditDialog = (limit: ConfiguredAILimit) => {
    setFormState({
      mode: "edit",
      orgId: limit.organizationId,
      orgName: limit.organizationName,
      tokenLimit: limit.tokenLimit,
      alertThresholdPercent: limit.alertThresholdPercent,
    });
  };

  const invalidateAIQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["ai-limits"] });
    queryClient.invalidateQueries({ queryKey: ["ai-usage"] });
    queryClient.invalidateQueries({ queryKey: ["ai-org-usage"] });
  };

  const handleSave = () => {
    if (!formState) return;

    if (!formState.orgId) {
      toast.error("Select an organisation first");
      return;
    }

    if (!Number.isInteger(formState.tokenLimit) || formState.tokenLimit <= 0) {
      toast.error("Token limit must be a positive whole number");
      return;
    }

    if (
      !Number.isInteger(formState.alertThresholdPercent) ||
      formState.alertThresholdPercent < 1 ||
      formState.alertThresholdPercent > 100
    ) {
      toast.error("Alert threshold must be between 1 and 100");
      return;
    }

    const orgName =
      formState.mode === "create"
        ? selectedCreateOrg?.name ?? "organisation"
        : formState.orgName;

    setLimitMutation.mutate(
      {
        orgId: formState.orgId,
        tokenLimit: formState.tokenLimit,
        alertThresholdPercent: formState.alertThresholdPercent,
      },
      {
        onSuccess: () => {
          toast.success(`AI limit saved for ${orgName}`);
          invalidateAIQueries();
          setFormState(null);
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.error ||
              err?.response?.data?.message ||
              "Failed to save AI limit"
          );
        },
      }
    );
  };

  const handleRemove = () => {
    if (!removeTarget) return;

    removeLimitMutation.mutate(removeTarget.organizationId, {
      onSuccess: () => {
        toast.success(`AI limit removed for ${removeTarget.organizationName}`);
        invalidateAIQueries();
        setRemoveTarget(null);
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Failed to remove AI limit"
        );
      },
    });
  };

  const isSaving = setLimitMutation.isPending;
  const isRemoving = removeLimitMutation.isPending;

  return (
    <Stack className="pt-5 gap-4 px-2">
      <Box className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              AI Monitoring
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage AI token limits for paid active organisations.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Limit
          </Button>
        </div>
      </Box>

      <TokenPackagesInfo />

      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            Configured Organisation Limits
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({limits.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {limitsLoading ? (
            <TableSkeleton rows={5} columns={7} withActions />
          ) : limits.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No AI limits configured yet. Use Add Limit to select an
              organisation and set its monthly token limit.
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-border">
              <Table className="w-full">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Tokens Used</TableHead>
                    <TableHead>Token Limit</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Alert</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {limits.map((limit) => {
                    const isExceeded = limit.tokensUsed >= limit.tokenLimit;

                    return (
                      <TableRow key={limit.id}>
                        <TableCell className="font-medium text-foreground">
                          {limit.organizationName}
                        </TableCell>
                        <TableCell className="tabular-nums text-foreground">
                          {limit.tokensUsed.toLocaleString()}
                        </TableCell>
                        <TableCell className="tabular-nums text-foreground">
                          {limit.tokenLimit.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UsageBar pct={limit.usagePercent} />
                            {isExceeded && (
                              <Badge variant="destructive" className="text-xs">
                                Exceeded
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums text-foreground">
                          {limit.totalRequests.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {limit.alertThresholdPercent}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(limit)}
                              aria-label={`Edit ${limit.organizationName} AI limit`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => setRemoveTarget(limit)}
                              aria-label={`Remove ${limit.organizationName} AI limit`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!formState}
        onOpenChange={(open) => !open && setFormState(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {formState?.mode === "edit" ? "Edit AI Limit" : "Add AI Limit"}
            </DialogTitle>
            <DialogDescription>
              {formState?.mode === "edit"
                ? formState.orgName
                : "Select a paid active organisation and set its monthly token limit."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {formState?.mode === "create" && (
              <div className="space-y-1.5">
                <Label htmlFor="organisation">Organisation</Label>
                <Select
                  value={formState.orgId}
                  onValueChange={(orgId) => {
                    const org = availableOrgs.find((item) => item.id === orgId);
                    setFormState({
                      ...formState,
                      orgId,
                      orgName: org?.name ?? "",
                    });
                  }}
                  disabled={orgsLoading || availableOrgs.length === 0}
                >
                  <SelectTrigger id="organisation">
                    <SelectValue
                      placeholder={
                        availableOrgs.length === 0
                          ? "No paid active organisations available"
                          : "Select an organisation"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrgs.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="token-limit">Monthly Token Limit</Label>
              <Input
                id="token-limit"
                type="number"
                min={1}
                value={formState?.tokenLimit ?? defaultLimit}
                onChange={(event) =>
                  formState &&
                  setFormState({
                    ...formState,
                    tokenLimit: Number(event.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alert-threshold">Alert Threshold %</Label>
              <Input
                id="alert-threshold"
                type="number"
                min={1}
                max={100}
                value={formState?.alertThresholdPercent ?? defaultThreshold}
                onChange={(event) =>
                  formState &&
                  setFormState({
                    ...formState,
                    alertThresholdPercent: Number(event.target.value),
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormState(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving ||
                !formState?.orgId ||
                (formState?.mode === "create" && availableOrgs.length === 0)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? "Saving..." : "Save Limit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Remove AI Limit</DialogTitle>
            <DialogDescription>
              This removes the configured AI token limit for{" "}
              {removeTarget?.organizationName}. The organisation can be selected
              again from Add Limit later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveTarget(null)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default SuperAdminAIMonitoringPage;
