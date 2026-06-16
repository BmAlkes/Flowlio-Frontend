import { FC, useState } from "react";
import { GeneralModal } from "@/components/common/generalmodal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Stack } from "@/components/ui/stack";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssignPlan } from "@/hooks/useOrganizationAdmin";
import { useFetchPlans } from "@/hooks/usefetchplans";
import { toast } from "sonner";
import { format } from "date-fns";

interface AssignPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  companyName: string;
}

export const AssignPlanModal: FC<AssignPlanModalProps> = ({
  open,
  onOpenChange,
  orgId,
  companyName,
}) => {
  const { data: plansResponse } = useFetchPlans();
  const plans = plansResponse?.data ?? [];

  const today = format(new Date(), "yyyy-MM-dd");
  const threeMonthsLater = format(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd"
  );

  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(threeMonthsLater);
  const [notes, setNotes] = useState("");

  const assignPlan = useAssignPlan();

  const handleSave = async () => {
    if (!planId) {
      toast.error("Please select a plan");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Start and end dates are required");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      await assignPlan.mutateAsync({ orgId, planId, startDate, endDate, notes: notes || undefined });
      toast.success(`Plan assigned to ${companyName} successfully`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to assign plan", {
        description: err?.message ?? "Unknown error",
      });
    }
  };

  return (
    <GeneralModal
      open={open}
      onOpenChange={onOpenChange}
      contentProps={{ className: "max-w-lg" }}
    >
      <DialogHeader>
        <DialogTitle>Assign Plan</DialogTitle>
        <DialogDescription>
          Manually assign a subscription plan to <strong>{companyName}</strong> without PayPal.
        </DialogDescription>
      </DialogHeader>

      <Stack className="gap-5 mt-4">
        <Box>
          <Label className="mb-2 block">Plan <span className="text-red-500">*</span></Label>
          <Select value={planId} onValueChange={setPlanId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a plan…" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.customPlanName || p.name} — ${p.price}/{(p as any).durationType ?? "mo"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Box>

        <Flex className="gap-4">
          <Box className="flex-1">
            <Label className="mb-2 block">Start Date <span className="text-red-500">*</span></Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Box>
          <Box className="flex-1">
            <Label className="mb-2 block">End Date <span className="text-red-500">*</span></Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Box>
        </Flex>

        <Box>
          <Label className="mb-2 block">Notes <span className="text-xs text-muted-foreground">(optional)</span></Label>
          <textarea
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. Manually assigned after bank transfer…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Box>
      </Stack>

      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={assignPlan.isPending}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={assignPlan.isPending}>
          {assignPlan.isPending ? "Assigning…" : "Assign Plan"}
        </Button>
      </DialogFooter>
    </GeneralModal>
  );
};
