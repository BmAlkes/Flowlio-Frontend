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
import { useCreatePlanPayment, CreatePlanPaymentResult } from "@/hooks/useOrganizationAdmin";
import { useFetchPlans } from "@/hooks/usefetchplans";
import { useFetchAllOrganizations } from "@/hooks/usefetchallorganizations";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link2, ChevronDown, ChevronUp, Copy, Check, ExternalLink } from "lucide-react";

export const PlanPaymentLinkCard = () => {
  const { data: plansResponse } = useFetchPlans();
  const { data: orgsResponse } = useFetchAllOrganizations();

  const plans = plansResponse?.data ?? [];
  const orgs: any[] = Array.isArray(orgsResponse?.data) ? orgsResponse!.data : [];

  const today = format(new Date(), "yyyy-MM-dd");
  const threeMonthsLater = format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");

  const [expanded, setExpanded] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [planId, setPlanId] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(threeMonthsLater);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<CreatePlanPaymentResult | null>(null);
  const [copied, setCopied] = useState(false);

  const createPayment = useCreatePlanPayment();

  // Auto-fill amount when plan is selected
  const handlePlanChange = (id: string) => {
    setPlanId(id);
    const plan = plans.find((p) => p.id === id);
    if (plan && !amount) setAmount(String(plan.price));
    if (plan && !description) {
      const orgName = orgs.find((o) => o.id === orgId)?.name ?? "";
      setDescription(`Flowlio ${plan.customPlanName || plan.name} Plan${orgName ? ` — ${orgName}` : ""}`);
    }
  };

  const handleOrgChange = (id: string) => {
    setOrgId(id);
    if (planId && !description) {
      const plan = plans.find((p) => p.id === planId);
      const org = orgs.find((o) => o.id === id);
      if (plan && org) setDescription(`Flowlio ${plan.customPlanName || plan.name} Plan — ${org.name}`);
    }
  };

  const handleGenerate = async () => {
    if (!orgId) { toast.error("Select an organisation"); return; }
    if (!planId) { toast.error("Select a plan"); return; }
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (!startDate || !endDate) { toast.error("Dates are required"); return; }
    if (new Date(endDate) <= new Date(startDate)) { toast.error("End date must be after start date"); return; }

    try {
      const data = await createPayment.mutateAsync({
        orgId, planId,
        amount: parseFloat(amount),
        startDate, endDate,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setResult(data);
      toast.success("Payment link generated successfully");
    } catch (err: any) {
      toast.error("Failed to generate payment link", { description: err?.message });
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.approvalUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setResult(null);
    setOrgId(""); setPlanId(""); setAmount("");
    setStartDate(today); setEndDate(threeMonthsLater);
    setDescription(""); setNotes("");
  };

  return (
    <Box className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <Flex className="items-center gap-3">
          <span className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/30">
            <Link2 className="h-4 w-4 text-[#F98618]" />
          </span>
          <Box className="text-left">
            <p className="text-sm font-semibold text-foreground">Generate Payment Link</p>
            <p className="text-xs text-muted-foreground">Create a PayPal payment link for a custom plan — client pays online, plan activates automatically</p>
          </Box>
        </Flex>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </button>

      {expanded && (
        <Box className="px-5 pb-5 border-t border-border">
          {result ? (
            /* ── Success state ── */
            <Box className="mt-4">
              <Box className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-4 mb-4">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">
                  Payment link created
                </p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  Send this link to the client. When they pay, the plan activates and an invoice is created automatically.
                </p>
              </Box>

              <Label className="mb-2 block text-sm">PayPal Approval URL</Label>
              <Flex className="gap-2">
                <Input
                  readOnly
                  value={result.approvalUrl}
                  className="flex-1 text-xs font-mono bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                  title="Copy link"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
                <a href={result.approvalUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="shrink-0" title="Open link">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </Flex>

              <p className="text-xs text-muted-foreground mt-2">Order ID: <span className="font-mono">{result.orderId}</span></p>

              <Button variant="ghost" className="mt-4 w-full" onClick={handleReset}>
                Generate another link
              </Button>
            </Box>
          ) : (
            /* ── Form ── */
            <>
              <div className="grid grid-cols-2 gap-4 mt-4 max-md:grid-cols-1">
                <Box className="col-span-2 max-md:col-span-1">
                  <Label className="mb-2 block text-sm">Organisation <span className="text-red-500">*</span></Label>
                  <Select value={orgId} onValueChange={handleOrgChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select organisation…" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {orgs.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                          {o.subscriptionPlan?.name && (
                            <span className="ml-2 text-xs text-muted-foreground">({o.subscriptionPlan.name})</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Box>

                <Box>
                  <Label className="mb-2 block text-sm">Plan <span className="text-red-500">*</span></Label>
                  <Select value={planId} onValueChange={handlePlanChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select plan…" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.customPlanName || p.name}
                          <span className="ml-2 text-xs text-muted-foreground">${p.price}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Box>

                <Box>
                  <Label className="mb-2 block text-sm">
                    Amount (USD) <span className="text-red-500">*</span>
                    <span className="text-xs text-muted-foreground font-normal ml-1">(can differ from plan price)</span>
                  </Label>
                  <Flex className="relative items-center">
                    <span className="absolute left-3 text-muted-foreground font-semibold">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-7"
                    />
                  </Flex>
                </Box>

                <Box>
                  <Label className="mb-2 block text-sm">Start Date <span className="text-red-500">*</span></Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </Box>

                <Box>
                  <Label className="mb-2 block text-sm">End Date <span className="text-red-500">*</span></Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </Box>

                <Box className="col-span-2 max-md:col-span-1">
                  <Label className="mb-2 block text-sm">
                    Description <span className="text-xs text-muted-foreground font-normal">(shown to client in PayPal)</span>
                  </Label>
                  <Input
                    placeholder="e.g. Flowlio Agency Plan — Acme Corp"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Box>

                <Box className="col-span-2 max-md:col-span-1">
                  <Label className="mb-2 block text-sm">
                    Internal Notes <span className="text-xs text-muted-foreground font-normal">(not shown to client)</span>
                  </Label>
                  <textarea
                    className="w-full min-h-[56px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g. Negotiated via call on 2026-06-18…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Box>
              </div>

              <Flex className="justify-end mt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={createPayment.isPending}
                  className="min-w-[180px] bg-[#F98618] hover:bg-[#F98618]/85 text-white"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  {createPayment.isPending ? "Generating…" : "Generate Payment Link"}
                </Button>
              </Flex>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};
