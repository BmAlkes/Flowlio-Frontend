import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { backendDomain } from "@/configs/axios.config";
import {
  useWebhook, useUpdateWebhook, useUpdateWebhookMapping, useWebhookLogs,
  useTestWebhook, useRotateWebhookToken, useDeleteWebhookLog, WebhookSource,
} from "@/hooks/useWebhooks";
import { useLeadFields, useCreateLeadField } from "@/hooks/useLeadFields";
import { useRetryWebhookLog } from "@/hooks/useLeadExtras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Copy, Check, Loader2, Plus, Trash2, RefreshCw,
  PlayCircle, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const CORE_LEAD_FIELDS = [
  { id: "name", label: "Name" }, { id: "email", label: "Email" },
  { id: "phone", label: "Phone" }, { id: "businessIndustry", label: "Industry" },
  { id: "leadValue", label: "Lead Value" }, { id: "address", label: "Address" },
  { id: "cpfcnpj", label: "VAT / Tax ID" },
];

const SOURCE_LABELS: Record<WebhookSource, string> = {
  wordpress: "WordPress", facebook: "Facebook Lead Ads", generic: "Generic",
};

const GUIDES: { name: string; steps: string[]; format: string; example: string; warning?: string }[] = [
  { name: "Elementor", steps: ["Add a Form widget, give each field an ID.", "Actions After Submit → add Webhook.", "Paste the URL below."], format: "fields[FIELD_ID][value]", example: "fields[name][value] → Name", warning: "Don't copy the [field id=\"...\"] shortcode shown next to each field — that's for email templates only. The webhook needs the fields[FIELD_ID][value] format instead (it'll show up automatically below once a submission arrives)." },
  { name: "Contact Form 7", steps: ["Install 'CF7 to Webhook' plugin.", "Webhook tab → paste URL."], format: "your-name, your-email, etc.", example: "your-name → Name" },
  { name: "WPForms", steps: ["Settings → Webhooks → POST + JSON.", "Map fields by name."], format: "Custom key names", example: "name → Name" },
  { name: "Facebook Ads", steps: ["Use Make.com or Zapier as bridge.", "HTTP Request → POST to URL."], format: "JSON keys", example: "full_name → Name" },
  { name: "Generic", steps: ["POST to the URL with JSON or form-data."], format: "Any key in body", example: '{"name":"John"}' },
];

function CopyBtn({ value, label }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(value); setOk(true); toast.success(label ? `${label} copied` : "Copied"); setTimeout(() => setOk(false), 1500); }}
      className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
    >
      {ok ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

const isError = (s: string) => ["error", "failed", "permanently_failed"].includes(s);

export const WebhookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: webhook, isLoading } = useWebhook(id ?? "");
  const { data: customFields = [] } = useLeadFields();
  const { data: logsData } = useWebhookLogs(id ?? "");
  const updateWebhook = useUpdateWebhook();
  const saveMapping = useUpdateWebhookMapping();
  const testWebhook = useTestWebhook();
  const rotateToken = useRotateWebhookToken();
  const deleteLog = useDeleteWebhookLog();
  const retryLog = useRetryWebhookLog();
  const createLeadField = useCreateLeadField();

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [newExt, setNewExt] = useState("");
  const [newField, setNewField] = useState("");
  const [rotateOpen, setRotateOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideTab, setGuideTab] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [creatingFieldFor, setCreatingFieldFor] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState("");

  useEffect(() => {
    if (webhook) {
      const fm = webhook.fieldMapping ?? {};
      const nested = (fm as any).mapping;
      setMapping((nested && typeof nested === "object" && !Array.isArray(nested) ? nested : fm) as Record<string, string>);
    }
  }, [webhook?.id]);

  const allFields = [...CORE_LEAD_FIELDS, ...customFields.map((f) => ({ id: `custom_${f.id}`, label: `${f.name} (custom)` }))];
  const base = backendDomain.endsWith("/") ? backendDomain.slice(0, -1) : backendDomain;
  const url = `${base}/api/webhooks/receive/${webhook?.token ?? ""}`;

  const addMap = () => { if (!newExt.trim() || !newField) return; setMapping((p) => ({ ...p, [newExt.trim()]: newField })); setNewExt(""); setNewField(""); };
  const removeMap = (k: string) => setMapping((p) => { const n = { ...p }; delete n[k]; return n; });

  if (isLoading || !webhook) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const logs = logsData?.logs ?? [];
  const latestPayload = logs[0]?.payload ?? {};
  const detectedKeys = Object.keys(latestPayload).filter(
    (k) => latestPayload[k] != null && latestPayload[k] !== "" && typeof latestPayload[k] !== "object",
  );

  const handleDetectedFieldChange = (key: string, value: string) => {
    if (value === "__new__") {
      setCreatingFieldFor(key);
      setNewFieldName("");
      return;
    }
    if (value === "__skip__") {
      removeMap(key);
      return;
    }
    setMapping((p) => ({ ...p, [key]: value }));
  };

  const handleCreateField = () => {
    if (!newFieldName.trim()) return;
    createLeadField.mutate(
      { name: newFieldName.trim(), type: "text" },
      { onSuccess: () => { setCreatingFieldFor(null); setNewFieldName(""); } },
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard/leads/webhooks")} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4 rtl:rotate-180" /></button>
          <h2 className="font-semibold text-lg">{webhook.name}</h2>
          <span className="text-xs text-muted-foreground">{SOURCE_LABELS[webhook.source]}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{webhook.active ? "Active" : "Off"}</span>
          <Switch checked={webhook.active} onCheckedChange={(v) => updateWebhook.mutate({ id: webhook.id, data: { active: v } })} />
        </div>
      </div>

      {/* URL */}
      <div>
        <label className="text-xs text-muted-foreground font-medium block mb-1">Webhook URL</label>
        <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/30">
          <code className="text-xs font-mono flex-1 break-all text-foreground">{url}</code>
          <CopyBtn value={url} label="URL" />
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => testWebhook.mutate(webhook.id)} disabled={testWebhook.isPending}>
            {testWebhook.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3 w-3" />} Test
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-amber-600" onClick={() => setRotateOpen(true)}>
            <RefreshCw className="h-3 w-3" /> Rotate
          </Button>
        </div>
      </div>

      {/* Setup guide */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors text-sm" onClick={() => setGuideOpen((v) => !v)}>
          <span className="font-medium">Setup Guide</span>
          {guideOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {guideOpen && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex gap-1 overflow-x-auto">
              {GUIDES.map((g, i) => (
                <button key={g.name} onClick={() => setGuideTab(i)} className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${guideTab === i ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>
                  {g.name}
                </button>
              ))}
            </div>
            <ol className="space-y-1 text-sm text-foreground">
              {GUIDES[guideTab].steps.map((s, i) => <li key={i}><span className="text-muted-foreground me-1.5">{i + 1}.</span>{s}</li>)}
            </ol>
            <div className="text-xs text-muted-foreground/90">
              <span className="font-medium">Format:</span> <code className="text-foreground">{GUIDES[guideTab].format}</code>
              <span className="mx-2">—</span>
              <span className="font-medium">Example:</span> <code className="text-foreground">{GUIDES[guideTab].example}</code>
            </div>
            {GUIDES[guideTab].warning && (
              <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 rounded-lg px-3 py-2">
                ⚠️ {GUIDES[guideTab].warning}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Field mapping */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium">Field Mapping</label>
          <Button size="sm" className="h-7 text-xs" onClick={() => saveMapping.mutate({ id: webhook.id, mapping })} disabled={saveMapping.isPending}>
            {saveMapping.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground/90 mb-3">
          Fields you don't map still show up on the lead automatically, under "Webhook Data" — you only need to map the ones that should fill Name, Phone, Email, etc.
        </p>

        {Object.keys(mapping).length > 0 && (
          <div className="border border-border rounded-lg divide-y divide-border mb-3">
            {Object.entries(mapping).map(([ext, field]) => (
              <div key={ext} className="flex items-center gap-2 px-3 py-2">
                <code className="text-xs font-mono flex-1 truncate text-foreground">{ext}</code>
                <span className="text-xs text-muted-foreground/90">→</span>
                <span className="text-xs font-medium flex-1 truncate">{allFields.find((f) => f.id === field)?.label ?? field}</span>
                <button onClick={() => removeMap(ext)} className="text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        )}

        {detectedKeys.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground/90 mb-1.5">Detected fields (from last submission)</p>
            <div className="border border-border rounded-lg divide-y divide-border">
              {detectedKeys.filter((k) => !mapping[k]).map((key) => (
                <div key={key} className="flex items-center gap-2 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <code className="text-xs font-mono block truncate text-foreground">{key}</code>
                    <span className="text-xs text-muted-foreground/90 truncate block">{String(latestPayload[key])}</span>
                  </div>
                  <span className="text-xs text-muted-foreground/90">→</span>
                  {creatingFieldFor === key ? (
                    <div className="flex items-center gap-1.5">
                      <Input
                        autoFocus
                        className="h-8 text-xs w-32"
                        placeholder="Field name"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateField()}
                      />
                      <Button size="sm" className="h-8 text-xs" disabled={!newFieldName.trim() || createLeadField.isPending} onClick={() => handleCreateField()}>
                        {createLeadField.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create"}
                      </Button>
                      <button onClick={() => setCreatingFieldFor(null)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <Select value={mapping[key] ?? "__skip__"} onValueChange={(v) => handleDetectedFieldChange(key, v)}>
                      <SelectTrigger className="h-8 text-xs w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__skip__">Leave as extra info</SelectItem>
                        {allFields.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                        <SelectItem value="__new__">+ New field…</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/90 border border-dashed border-border rounded-lg px-3 py-4 text-center">
            No submission received yet. Click <strong>Test</strong> above, or submit your real form once — the fields it sends will show up here to map.
          </p>
        )}

        <button
          onClick={() => setAdvancedOpen((v) => !v)}
          className="text-xs text-muted-foreground/90 hover:text-foreground transition-colors mt-3 flex items-center gap-1"
        >
          {advancedOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          Advanced: add a field mapping manually
        </button>
        {advancedOpen && (
          <div className="flex items-end gap-2 mt-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground/90 mb-0.5 block">External field</label>
              <Input className="h-8 text-xs font-mono" placeholder="fields[name][value]" value={newExt} onChange={(e) => setNewExt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMap()} />
            </div>
            <span className="text-xs text-muted-foreground/90 pb-1.5">→</span>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground/90 mb-0.5 block">Lead field</label>
              <Select value={newField} onValueChange={setNewField}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{allFields.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <button onClick={addMap} disabled={!newExt.trim() || !newField} className="h-8 w-8 flex items-center justify-center rounded bg-foreground text-background disabled:opacity-30 shrink-0">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Logs */}
      <div>
        <label className="text-sm font-medium block mb-3">Recent Calls</label>
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No calls yet.</p>
        ) : (
          <div className="border border-border rounded-lg divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="px-3 py-2.5 flex items-start gap-2.5">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isError(log.status) ? "bg-rose-500" : log.status === "merged" ? "bg-blue-500" : "bg-green-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-medium ${isError(log.status) ? "text-rose-600" : "text-foreground"}`}>{log.status}</span>
                    <span className="text-muted-foreground">{format(new Date(log.createdAt), "d MMM HH:mm")}</span>
                    {log.ip && <span className="text-muted-foreground/90">{log.ip}</span>}
                  </div>
                  {log.error && <p className="text-xs text-rose-500 mt-0.5">{log.error}</p>}
                  {log.leadId && <p className="text-xs text-green-600 mt-0.5">Lead: {log.leadId.slice(0, 8)}</p>}
                  <details className="mt-1">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Payload</summary>
                    <pre className="mt-1 text-xs bg-muted/40 rounded p-2 overflow-x-auto font-mono max-h-32 text-muted-foreground">
                      {log.payload && Object.keys(log.payload).length > 0 ? JSON.stringify(log.payload, null, 2) : "(empty)"}
                    </pre>
                  </details>
                </div>
                <div className="flex gap-1 shrink-0">
                  {isError(log.status) && (
                    <button
                      onClick={() => retryLog.mutate({ logId: log.id, webhookId: log.webhookId }, { onSuccess: () => toast.success("Retried") })}
                      disabled={retryLog.isPending}
                      className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-blue-600 transition-colors"
                      title="Retry"
                    ><RefreshCw className="h-3 w-3" /></button>
                  )}
                  <button
                    onClick={() => deleteLog.mutate({ logId: log.id, webhookId: log.webhookId })}
                    disabled={deleteLog.isPending}
                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors"
                    title="Delete"
                  ><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {logsData && logsData.total > logs.length && (
          <p className="text-xs text-muted-foreground text-center mt-2">Showing {logs.length} of {logsData.total}</p>
        )}
      </div>

      {/* Rotate confirm */}
      <AlertDialog open={rotateOpen} onOpenChange={setRotateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate token?</AlertDialogTitle>
            <AlertDialogDescription>The old URL stops working immediately.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => rotateToken.mutate(webhook.id, { onSuccess: () => setRotateOpen(false) })}>Rotate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
