import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssignPlan } from "@/hooks/useOrganizationAdmin";
import { useFetchPlans } from "@/hooks/usefetchplans";
import { useFetchAllOrganizations } from "@/hooks/usefetchallorganizations";
import { toast } from "sonner";
import { format } from "date-fns";
import { CreditCard, ChevronDown, ChevronUp } from "lucide-react";

export const AssignPlanCard = () => {
  const { data: plansResponse } = useFetchPlans();
  const { data: orgsResponse } = useFetchAllOrganizations();

  const plans = plansResponse?.data ?? [];
  const orgs: any[] = Array.isArray(orgsResponse?.data) ? orgsResponse!.data : [];

  const today = format(new Date(), "yyyy-MM-dd");
  const threeMonthsLater = format(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd"
  );

  const [orgId, setOrgId] = useState("");
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(threeMonthsLater);
  const [notes, setNotes] = useState("");
  const [expanded, setExpanded] = useState(false);

  const assignPlan = useAssignPlan();

  const handleSubmit = async () => {
    if (!orgId) { toast.error("Select an organisation"); return; }
    if (!planId) { toast.error("Select a plan"); return; }
    if (!startDate || !endDate) { toast.error("Start and end dates are required"); return; }
    if (new Date(endDate) <= new Date(startDate)) { toast.error("End date must be after start date"); return; }

    try {
      await assignPlan.mutateAsync({
        orgId, planId, startDate, endDate,
        notes: notes.trim() || undefined,
      });
      const orgName = orgs.find((o) => o.id === orgId)?.name ?? orgId;
      const planName = plans.find((p) => p.id === planId)?.name ?? planId;
      toast.success(`Plan "${planName}" assigned to ${orgName}`);
      setOrgId("");
      setPlanId("");
      setStartDate(today);
      setEndDate(threeMonthsLater);
      setNotes("");
    } catch (err: any) {
      toast.error("Failed to assign plan", { description: err?.message });
    }
  };

  return (
    <Box className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header — always visible */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <Flex className="items-center gap-3">
          <span className="p-2 rounded-lg bg-blue-50/80 dark:bg-blue-900/30">
            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </span>
          <Box className="text-left">
            <p className="text-sm font-semibold text-foreground">Assign Plan On-Demand</p>
            <p className="text-xs text-muted-foreground">Manually assign any plan to an organisation — no PayPal required</p>
          </Box>
        </Flex>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </button>

      {/* Expandable form */}
      {expanded && (
        <Box className="px-5 pb-5 border-t border-border">
          <div className="grid grid-cols-2 gap-4 mt-4 max-md:grid-cols-1">

            {/* Organisation */}
            <Box className="col-span-2 max-md:col-span-1">
              <Label className="mb-2 block text-sm">Organisation <span className="text-red-500">*</span></Label>
              <Select value={orgId} onValueChange={setOrgId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Search & select organisation…" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                      {o.subscriptionPlan?.name && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({o.subscriptionPlan.name})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Box>

            {/* Plan */}
            <Box className="col-span-2 max-md:col-span-1">
              <Label className="mb-2 block text-sm">Plan <span className="text-red-500">*</span></Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a plan…" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.customPlanName || p.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ${p.price}/{(p as any).durationType ?? "mo"}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Box>

            {/* Start date */}
            <Box>
              <Label className="mb-2 block text-sm">Start Date <span className="text-red-500">*</span></Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Box>

            {/* End date */}
            <Box>
              <Label className="mb-2 block text-sm">End Date <span className="text-red-500">*</span></Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Box>

            {/* Notes */}
            <Box className="col-span-2 max-md:col-span-1">
              <Label className="mb-2 block text-sm">
                Notes <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </Label>
              <textarea
                className="w-full min-h-[64px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Assigned after bank transfer on 2026-06-16…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>

          </div>

          <Flex className="justify-end mt-4">
            <Button
              onClick={handleSubmit}
              disabled={assignPlan.isPending}
              className="min-w-[140px]"
            >
              {assignPlan.isPending ? "Assigning…" : "Assign Plan"}
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};
