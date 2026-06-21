import { useState } from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useRoutingRules,
  useCreateRoutingRule,
  useUpdateRoutingRule,
  useDeleteRoutingRule,
  useLeadTags,
  RoutingRule,
} from "@/hooks/useLeadExtras";
import { toast } from "sonner";
import { Plus, Trash2, Route, Loader2 } from "lucide-react";
import { useGetCurrentOrgUserMembers } from "@/hooks/usegetallusermembers";

const FIELDS = [
  { value: "source", label: "Source" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "name", label: "Name" },
  { value: "industry", label: "Industry" },
];

const OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "not contains" },
  { value: "starts_with", label: "starts with" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

const TEMPERATURES = [
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
];

type RuleForm = {
  name: string;
  isActive: boolean;
  matchType: "all" | "any";
  conditions: { field: string; operator: string; value: string }[];
  assignTo: string;
  setTemperature: string;
  addTags: string[];
};

const EMPTY_FORM: RuleForm = {
  name: "",
  isActive: true,
  matchType: "all",
  conditions: [{ field: "source", operator: "equals", value: "" }],
  assignTo: "",
  setTemperature: "",
  addTags: [],
};

export const LeadRoutingRules = () => {
  const { data: rules = [], isLoading } = useRoutingRules();
  const { data: tags = [] } = useLeadTags();
  const { data: membersResp } = useGetCurrentOrgUserMembers();
  const members = (membersResp?.data?.userMembers ?? []).map((m) => ({
    id: m.user?.id ?? m.id,
    name: m.user?.name ?? `${m.firstname} ${m.lastname}`.trim(),
    email: m.user?.email ?? m.email,
  }));

  const createRule = useCreateRoutingRule();
  const updateRule = useUpdateRoutingRule();
  const deleteRule = useDeleteRoutingRule();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<RuleForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (rule: RoutingRule) => {
    setForm({
      name: rule.name,
      isActive: rule.isActive,
      matchType: rule.conditions.match,
      conditions: rule.conditions.rules.length > 0 ? rule.conditions.rules : [{ field: "source", operator: "equals", value: "" }],
      assignTo: rule.actions.assignTo ?? "",
      setTemperature: rule.actions.setTemperature ?? "",
      addTags: rule.actions.addTags ?? [],
    });
    setEditingId(rule.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Rule name is required"); return; }

    const payload = {
      name: form.name.trim(),
      isActive: form.isActive,
      priority: 0,
      conditions: {
        match: form.matchType,
        rules: form.conditions.filter((c) => c.field && c.operator),
      },
      actions: {
        assignTo: form.assignTo || null,
        setTemperature: form.setTemperature || null,
        setStatus: null,
        addTags: form.addTags.length > 0 ? form.addTags : [],
        notify: [],
      },
    };

    try {
      if (editingId) {
        await updateRule.mutateAsync({ ruleId: editingId, ...payload });
        toast.success("Rule updated");
      } else {
        await createRule.mutateAsync(payload);
        toast.success("Rule created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error("Failed to save rule", { description: err?.message });
    }
  };

  const addCondition = () => {
    setForm((f) => ({
      ...f,
      conditions: [...f.conditions, { field: "source", operator: "equals", value: "" }],
    }));
  };

  const removeCondition = (idx: number) => {
    setForm((f) => ({
      ...f,
      conditions: f.conditions.filter((_, i) => i !== idx),
    }));
  };

  const updateCondition = (idx: number, key: string, val: string) => {
    setForm((f) => ({
      ...f,
      conditions: f.conditions.map((c, i) => (i === idx ? { ...c, [key]: val } : c)),
    }));
  };

  const isSaving = createRule.isPending || updateRule.isPending;

  return (
    <Box>
      <Flex className="items-center justify-between mb-4">
        <Flex className="items-center gap-2">
          <Route className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Auto-Routing Rules</h2>
        </Flex>
        <Button size="sm" onClick={openCreate} className="gap-1.5 h-8">
          <Plus className="w-3.5 h-3.5" /> Add Rule
        </Button>
      </Flex>

      <p className="text-sm text-muted-foreground mb-5">
        When a new lead arrives via webhook, it's matched against these rules (top to bottom). The first matching rule is applied.
      </p>

      {isLoading ? (
        <Flex className="justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></Flex>
      ) : rules.length === 0 ? (
        <Box className="text-center py-10 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
          No routing rules yet. New leads will remain unassigned.
        </Box>
      ) : (
        <Stack className="gap-2">
          {rules.map((rule) => (
            <Flex
              key={rule.id}
              className="items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => openEdit(rule)}
            >
              <Flex className="items-center gap-3 flex-1 min-w-0">
                <Switch
                  checked={rule.isActive}
                  onCheckedChange={(checked) => {
                    updateRule.mutate({ ruleId: rule.id, isActive: checked });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                />
                <Box className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {rule.conditions.rules.length} condition{rule.conditions.rules.length !== 1 ? "s" : ""}
                    {rule.actions.assignTo && " → assigns"}
                    {rule.actions.setTemperature && ` → ${rule.actions.setTemperature}`}
                    {(rule.actions.addTags?.length ?? 0) > 0 && ` → ${rule.actions.addTags!.length} tag(s)`}
                  </p>
                </Box>
              </Flex>
              <Flex className="items-center gap-2 shrink-0">
                <Badge variant={rule.isActive ? "default" : "outline"} className="text-xs">
                  {rule.isActive ? "Active" : "Inactive"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRule.mutate(rule.id, {
                      onSuccess: () => toast.success("Rule deleted"),
                    });
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </Flex>
            </Flex>
          ))}
        </Stack>
      )}

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Rule" : "Create Routing Rule"}</DialogTitle>
            <DialogDescription>
              Define conditions and actions. The first matching rule (by priority) applies.
            </DialogDescription>
          </DialogHeader>

          <Stack className="gap-5 mt-2">
            <Box>
              <Label className="mb-2 block text-sm">Rule Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Facebook leads → Sales team" />
            </Box>

            {/* Conditions */}
            <Box>
              <Flex className="items-center justify-between mb-2">
                <Label className="text-sm">Conditions (match {form.matchType})</Label>
                <Select value={form.matchType} onValueChange={(v: "all" | "any") => setForm({ ...form, matchType: v })}>
                  <SelectTrigger className="w-20 h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </Flex>
              <Stack className="gap-2">
                {form.conditions.map((cond, idx) => (
                  <Flex key={idx} className="gap-2 items-center">
                    <Select value={cond.field} onValueChange={(v) => updateCondition(idx, "field", v)}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{FIELDS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={cond.operator} onValueChange={(v) => updateCondition(idx, "operator", v)}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{OPERATORS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input className="flex-1 h-8 text-xs" placeholder="value" value={cond.value} onChange={(e) => updateCondition(idx, "value", e.target.value)} />
                    {form.conditions.length > 1 && (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeCondition(idx)}>
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    )}
                  </Flex>
                ))}
                <Button variant="ghost" size="sm" className="self-start text-xs gap-1 h-7" onClick={addCondition}>
                  <Plus className="w-3 h-3" /> Add condition
                </Button>
              </Stack>
            </Box>

            {/* Actions */}
            <Box>
              <Label className="mb-2 block text-sm">Actions</Label>
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <Box>
                  <Label className="text-xs text-muted-foreground mb-1 block">Assign to</Label>
                  <Select value={form.assignTo || "none"} onValueChange={(v) => setForm({ ...form, assignTo: v === "none" ? "" : v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="No assignment" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No assignment</SelectItem>
                      {members.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.name || m.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Box>
                <Box>
                  <Label className="text-xs text-muted-foreground mb-1 block">Set temperature</Label>
                  <Select value={form.setTemperature || "none"} onValueChange={(v) => setForm({ ...form, setTemperature: v === "none" ? "" : v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Don't change" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Don't change</SelectItem>
                      {TEMPERATURES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Box>
              </div>
              {tags.length > 0 && (
                <Box className="mt-3">
                  <Label className="text-xs text-muted-foreground mb-1 block">Add tags</Label>
                  <Flex className="flex-wrap gap-1.5">
                    {tags.map((tag) => {
                      const selected = form.addTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => setForm((f) => ({
                            ...f,
                            addTags: selected ? f.addTags.filter((id) => id !== tag.id) : [...f.addTags, tag.id],
                          }))}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selected ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:bg-muted"}`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </Flex>
                </Box>
              )}
            </Box>
          </Stack>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : editingId ? "Update Rule" : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
