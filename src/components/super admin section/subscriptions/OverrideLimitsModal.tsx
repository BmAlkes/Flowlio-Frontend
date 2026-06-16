import { FC, useState } from "react";
import { GeneralModal } from "@/components/common/generalmodal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useOverrideLimits, OverrideLimitsPayload } from "@/hooks/useOrganizationAdmin";
import { toast } from "sonner";
import {
  Users,
  FolderKanban,
  HardDrive,
  CheckSquare,
  UserCheck,
  Webhook,
  FileText,
  FileSignature,
  Sparkles,
} from "lucide-react";
import { Flex } from "@/components/ui/flex";

interface OverrideLimitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  companyName: string;
  currentPlanName?: string;
  currentOverrides?: OverrideLimitsPayload;
}

type OverrideField = keyof OverrideLimitsPayload;

const LIMIT_FIELDS: {
  key: OverrideField;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "maxUsers",     label: "Max Users",              icon: <Users size={13} /> },
  { key: "maxProjects",  label: "Max Projects",           icon: <FolderKanban size={13} /> },
  { key: "maxTasks",     label: "Max Tasks per User",     icon: <CheckSquare size={13} /> },
  { key: "maxStorage",   label: "Storage (GB)",           icon: <HardDrive size={13} /> },
  { key: "maxLeads",     label: "Max Leads",              icon: <UserCheck size={13} /> },
  { key: "maxClients",   label: "Max Clients",            icon: <Users size={13} /> },
  { key: "maxWebhooks",  label: "Max Webhooks",           icon: <Webhook size={13} /> },
  { key: "maxInvoices",  label: "Max Invoices",           icon: <FileText size={13} /> },
  { key: "maxProposals", label: "Max Proposals",          icon: <FileSignature size={13} /> },
  { key: "aiTokenLimit", label: "AI Token Limit / month", icon: <Sparkles size={13} /> },
];

// Represents the local editing state: empty string = null (remove override), number string = override
type FieldState = Record<OverrideField, string>;

function toFieldState(overrides: OverrideLimitsPayload): FieldState {
  const state: Partial<FieldState> = {};
  for (const { key } of LIMIT_FIELDS) {
    const v = overrides[key];
    state[key] = v != null ? String(v) : "";
  }
  return state as FieldState;
}

function toPayload(state: FieldState): OverrideLimitsPayload {
  const payload: OverrideLimitsPayload = {};
  for (const { key } of LIMIT_FIELDS) {
    const raw = state[key].trim();
    const parsed = raw === "" ? null : parseInt(raw, 10);
    payload[key] = isNaN(parsed as number) ? null : parsed;
  }
  return payload;
}

export const OverrideLimitsModal: FC<OverrideLimitsModalProps> = ({
  open,
  onOpenChange,
  orgId,
  companyName,
  currentPlanName,
  currentOverrides = {},
}) => {
  const [fields, setFields] = useState<FieldState>(() => toFieldState(currentOverrides));

  const overrideLimits = useOverrideLimits();

  const handleChange = (key: OverrideField, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await overrideLimits.mutateAsync({ orgId, overrides: toPayload(fields) });
      toast.success(`Limits updated for ${companyName}`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to update limits", {
        description: err?.message ?? "Unknown error",
      });
    }
  };

  const handleReset = () => {
    const empty: Partial<FieldState> = {};
    for (const { key } of LIMIT_FIELDS) empty[key] = "";
    setFields(empty as FieldState);
  };

  return (
    <GeneralModal
      open={open}
      onOpenChange={onOpenChange}
      contentProps={{ className: "max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" }}
    >
      <DialogHeader className="shrink-0">
        <DialogTitle>Override Limits — {companyName}</DialogTitle>
        <DialogDescription>
          {currentPlanName && (
            <span>Current plan: <strong>{currentPlanName}</strong>. </span>
          )}
          Leave a field <strong>empty</strong> to use the plan default. Enter a number to override.
          <strong> 0</strong> = unlimited.
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-y-auto flex-1 mt-4 pr-1">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          {LIMIT_FIELDS.map(({ key, label, icon }) => (
            <Box key={key}>
              <Flex className="items-center gap-2 mb-1.5">
                <span className="text-muted-foreground">{icon}</span>
                <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
              </Flex>
              <Input
                id={key}
                type="number"
                min="0"
                placeholder="Plan default"
                value={fields[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="h-9"
              />
            </Box>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground border border-border rounded-lg px-3 py-2 bg-muted/40">
          Empty = org follows the plan's limit. A value overrides the plan for this org only. Changes to <strong>AI Token Limit</strong> are automatically synced to the AI monitoring table.
        </p>
      </div>

      <DialogFooter className="mt-6 shrink-0">
        <Button variant="ghost" onClick={handleReset} disabled={overrideLimits.isPending} className="mr-auto">
          Clear all overrides
        </Button>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={overrideLimits.isPending}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={overrideLimits.isPending}>
          {overrideLimits.isPending ? "Saving…" : "Save Overrides"}
        </Button>
      </DialogFooter>
    </GeneralModal>
  );
};
