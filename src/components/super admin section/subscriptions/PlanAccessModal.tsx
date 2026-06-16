import React, { FC } from "react";
import { GeneralModal } from "@/components/common/generalmodal";
import { Stack } from "@/components/ui/stack";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { Box } from "@/components/ui/box";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Bot,
  HeadphonesIcon,
  CalendarDays,
  Timer,
  BarChart2,
  Link2,
  Paintbrush,
} from "lucide-react";

export type PlanAccessSettings = {
  maxUsers: number;
  maxProjects: number;
  maxStorage: number;
  maxTasks: number;
  maxLeads: number;
  maxClients: number;
  maxWebhooks: number;
  maxInvoices: number;
  maxProposals: number;
  aiTokenLimit: number;
  aiAssist: boolean;
  prioritySupport: boolean;
  calendarAccess: boolean;
  taskManagement: boolean;
  timeTracking: boolean;
  analyticsAccess: boolean;
  apiAccess: boolean;
  paymentLinks: boolean;
  proposalsAccess: boolean;
  whitelabel: boolean;
};

interface PlanAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  accessSettings: PlanAccessSettings;
  onSave: (settings: PlanAccessSettings) => Promise<void>;
  isSaving?: boolean;
}

interface LimitFieldProps {
  id: keyof PlanAccessSettings;
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (field: keyof PlanAccessSettings, value: number) => void;
  hint?: string;
}

const LimitField: FC<LimitFieldProps> = ({ id, label, icon, value, onChange, hint }) => (
  <Box>
    <Flex className="items-center gap-2 mb-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <Label htmlFor={id as string} className="text-sm font-medium">
        {label}
      </Label>
    </Flex>
    <Input
      id={id as string}
      type="number"
      min="0"
      value={value}
      onChange={(e) => onChange(id, parseInt(e.target.value) || 0)}
      className="h-9"
    />
    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
  </Box>
);

interface FeatureToggleProps {
  id: keyof PlanAccessSettings;
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (field: keyof PlanAccessSettings, value: boolean) => void;
}

const FeatureToggle: FC<FeatureToggleProps> = ({ id, label, description, icon, checked, onChange }) => (
  <Flex className="items-start justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30">
    <Flex className="items-start gap-3 flex-1 min-w-0">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <Box className="min-w-0">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </Box>
    </Flex>
    <Switch
      id={id as string}
      checked={checked}
      onCheckedChange={(c) => onChange(id, c)}
      className="shrink-0 mt-0.5"
    />
  </Flex>
);

export const PlanAccessModal: FC<PlanAccessModalProps> = ({
  open,
  onOpenChange,
  planName,
  accessSettings,
  onSave,
  isSaving = false,
}) => {
  const [settings, setSettings] = React.useState<PlanAccessSettings>(accessSettings);

  React.useEffect(() => {
    setSettings(accessSettings);
  }, [accessSettings]);

  const handleSave = async () => {
    try {
      await onSave(settings);
      onOpenChange(false);
    } catch {
      // parent handles toast, modal stays open so user can retry
    }
  };

  const handleNum = (field: keyof PlanAccessSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleBool = (field: keyof PlanAccessSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <GeneralModal
      open={open}
      onOpenChange={onOpenChange}
      contentProps={{ className: "max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" }}
    >
      <DialogHeader className="shrink-0">
        <DialogTitle>Configure Plan — {planName}</DialogTitle>
        <DialogDescription>
          Set service limits and feature access. Use <strong>0</strong> for unlimited on numeric fields.
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-y-auto flex-1 pr-1 mt-4">
        <Stack className="gap-8">

          {/* ── Service Limits ── */}
          <Box>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Service Limits
              <span className="ml-2 text-xs normal-case font-normal">(0 = unlimited)</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <LimitField id="maxUsers" label="Max Users" icon={<Users size={14} />} value={settings.maxUsers} onChange={handleNum} />
              <LimitField id="maxProjects" label="Max Projects" icon={<FolderKanban size={14} />} value={settings.maxProjects} onChange={handleNum} />
              <LimitField id="maxTasks" label="Max Tasks per User" icon={<CheckSquare size={14} />} value={settings.maxTasks} onChange={handleNum} />
              <LimitField id="maxStorage" label="Storage (GB)" icon={<HardDrive size={14} />} value={settings.maxStorage} onChange={handleNum} />
              <LimitField id="maxLeads" label="Max Leads" icon={<UserCheck size={14} />} value={settings.maxLeads} onChange={handleNum} />
              <LimitField id="maxClients" label="Max Clients" icon={<Users size={14} />} value={settings.maxClients} onChange={handleNum} />
              <LimitField id="maxWebhooks" label="Max Webhooks" icon={<Webhook size={14} />} value={settings.maxWebhooks} onChange={handleNum} />
              <LimitField id="maxInvoices" label="Max Invoices" icon={<FileText size={14} />} value={settings.maxInvoices} onChange={handleNum} />
              <LimitField id="maxProposals" label="Max Proposals" icon={<FileSignature size={14} />} value={settings.maxProposals} onChange={handleNum} />
              <LimitField id="aiTokenLimit" label="AI Token Limit / month" icon={<Sparkles size={14} />} value={settings.aiTokenLimit} onChange={handleNum} hint="e.g. 50000, 100000" />
            </div>
          </Box>

          {/* ── Feature Access ── */}
          <Box>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Feature Access
            </h3>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <FeatureToggle id="aiAssist" label="AI Assist" description="AI-powered assistance features" icon={<Bot size={14} />} checked={settings.aiAssist} onChange={handleBool} />
              <FeatureToggle id="prioritySupport" label="Priority Support" description="Priority customer support" icon={<HeadphonesIcon size={14} />} checked={settings.prioritySupport} onChange={handleBool} />
              <FeatureToggle id="calendarAccess" label="Calendar" description="Calendar & event management" icon={<CalendarDays size={14} />} checked={settings.calendarAccess} onChange={handleBool} />
              <FeatureToggle id="taskManagement" label="Task Management" description="Task creation and management" icon={<CheckSquare size={14} />} checked={settings.taskManagement} onChange={handleBool} />
              <FeatureToggle id="timeTracking" label="Time Tracking" description="Time tracking and reporting" icon={<Timer size={14} />} checked={settings.timeTracking} onChange={handleBool} />
              <FeatureToggle id="analyticsAccess" label="Analytics & Reports" description="Reports and analytics dashboard" icon={<BarChart2 size={14} />} checked={settings.analyticsAccess} onChange={handleBool} />
              <FeatureToggle id="apiAccess" label="API / Webhooks" description="API access and webhook integrations" icon={<Webhook size={14} />} checked={settings.apiAccess} onChange={handleBool} />
              <FeatureToggle id="paymentLinks" label="Payment Links" description="Create and manage payment links" icon={<Link2 size={14} />} checked={settings.paymentLinks} onChange={handleBool} />
              <FeatureToggle id="proposalsAccess" label="Proposals" description="Create and send proposals" icon={<FileSignature size={14} />} checked={settings.proposalsAccess} onChange={handleBool} />
              <FeatureToggle id="whitelabel" label="White-label" description="Remove Flowlio branding" icon={<Paintbrush size={14} />} checked={settings.whitelabel} onChange={handleBool} />
            </div>
          </Box>

        </Stack>
      </div>

      <DialogFooter className="mt-6 shrink-0">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </DialogFooter>
    </GeneralModal>
  );
};
