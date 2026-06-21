import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { backendDomain } from "@/configs/axios.config";
import {
  useWebhook,
  useUpdateWebhook,
  useUpdateWebhookMapping,
  useWebhookLogs,
  useTestWebhook,
  useRotateWebhookToken,
  useDeleteWebhookLog,
  WebhookSource,
} from "@/hooks/useWebhooks";
import { useLeadFields } from "@/hooks/useLeadFields";
import { useRetryWebhookLog } from "@/hooks/useLeadExtras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const CORE_LEAD_FIELDS = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "businessIndustry", label: "Industry" },
  { id: "leadValue", label: "Lead Value ($)" },
  { id: "address", label: "Address" },
  { id: "cpfcnpj", label: "VAT / Tax ID" },
];

const SOURCE_LABELS: Record<WebhookSource, string> = {
  wordpress: "WordPress",
  facebook: "Facebook Lead Ads",
  generic: "Generic / Custom",
};

// ── Setup guides ──────────────────────────────────────────────────────────────

interface PlatformGuide {
  name: string;
  icon: string;
  steps: string[];
  fieldFormat: string;
  example: string;
}

const PLATFORM_GUIDES: PlatformGuide[] = [
  {
    name: "Elementor",
    icon: "🟦",
    steps: [
      "Open your page in Elementor and add a Form widget.",
      "Give each field a clear ID (e.g. 'name', 'field_phone', 'message').",
      "In Form → Actions After Submit, add 'Webhook'.",
      "Paste the Flowlio Webhook URL.",
      "Use the field format below as the 'External field name'.",
    ],
    fieldFormat: "fields[FIELD_ID][value]",
    example: "fields[name][value] → Name\nfields[field_phone][value] → Phone",
  },
  {
    name: "Contact Form 7",
    icon: "📝",
    steps: [
      "Install the 'CF7 to Webhook' plugin.",
      "Open your CF7 form → 'Webhook' tab.",
      "Paste the Flowlio Webhook URL and save.",
    ],
    fieldFormat: "FIELD_NAME (from shortcode)",
    example: "your-name → Name\nyour-email → Email",
  },
  {
    name: "WPForms",
    icon: "📋",
    steps: [
      "Requires WPForms Pro with Webhooks addon.",
      "Settings → Webhooks → enable, paste URL.",
      "Set POST + JSON, map field name/value pairs.",
    ],
    fieldFormat: "Custom field name in WPForms settings",
    example: "name → Name\nphone → Phone",
  },
  {
    name: "Facebook Ads",
    icon: "📘",
    steps: [
      "Use Make.com or Zapier as a bridge.",
      "Facebook Lead Ads → HTTP Request module.",
      "POST to Flowlio URL with JSON body.",
    ],
    fieldFormat: "JSON keys in Make.com / Zapier",
    example: "name → Name\nemail → Email",
  },
  {
    name: "Generic",
    icon: "🔗",
    steps: [
      "Send HTTP POST to the Flowlio Webhook URL.",
      "Content-Type: application/json or form-urlencoded.",
      "Include fields as key-value pairs in the body.",
    ],
    fieldFormat: "Any key in the POST body",
    example: '{ "name": "John", "phone": "123" }',
  },
];

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(label ? `${label} copied` : "Copied");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Status helpers ────────────────────────────────────────────────────────────

const LOG_STATUS: Record<string, { label: string; icon: typeof CheckCircle2; cls: string; bg: string }> = {
  success:            { label: "Success",   icon: CheckCircle2, cls: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20" },
  merged:             { label: "Merged",    icon: CheckCircle2, cls: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-500/20" },
  retried_success:    { label: "Retried OK",icon: CheckCircle2, cls: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20" },
  error:              { label: "Error",     icon: AlertCircle,  cls: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-500/20" },
  failed:             { label: "Failed",    icon: AlertCircle,  cls: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-500/20" },
  pending_retry:      { label: "Retrying…", icon: RefreshCw,    cls: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/20" },
  permanently_failed: { label: "Perm. Fail",icon: AlertCircle,  cls: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-500/20" },
};

const isFailedStatus = (s: string) => ["error", "failed", "permanently_failed"].includes(s);

// ── Main component ────────────────────────────────────────────────────────────

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

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [newExtField, setNewExtField] = useState("");
  const [newLeadField, setNewLeadField] = useState("");
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guidePlatform, setGuidePlatform] = useState(0);

  useEffect(() => {
    if (webhook) {
      const fm = webhook.fieldMapping ?? {};
      const nested = (fm as any).mapping;
      const normalized = nested && typeof nested === "object" && !Array.isArray(nested) ? nested : fm;
      setMapping(normalized as Record<string, string>);
    }
  }, [webhook?.id]);

  const allLeadFields = [
    ...CORE_LEAD_FIELDS,
    ...customFields.map((f) => ({ id: `custom_${f.id}`, label: `${f.name} (custom)` })),
  ];

  const base = backendDomain.endsWith("/") ? backendDomain.slice(0, -1) : backendDomain;
  const receiveUrl = `${base}/api/webhooks/receive/${webhook?.token ?? ""}`;

  const addMapping = () => {
    if (!newExtField.trim() || !newLeadField) return;
    setMapping((prev) => ({ ...prev, [newExtField.trim()]: newLeadField }));
    setNewExtField("");
    setNewLeadField("");
  };

  const removeMapping = (key: string) => {
    setMapping((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  if (isLoading || !webhook) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const logs = logsData?.logs ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard/leads/webhooks")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="font-bold text-xl text-foreground">{webhook.name}</h2>
          <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
            {SOURCE_LABELS[webhook.source]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{webhook.active ? "Active" : "Inactive"}</span>
          <Switch
            checked={webhook.active}
            onCheckedChange={(checked) => updateWebhook.mutate({ id: webhook.id, data: { active: checked } })}
          />
        </div>
      </div>

      {/* ── Webhook URL + actions (compact) ── */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Webhook URL</p>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50 mb-3">
          <code className="text-xs font-mono text-foreground flex-1 break-all leading-relaxed">{receiveUrl}</code>
          <CopyButton value={receiveUrl} label="URL" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline" size="sm"
            className="rounded-lg gap-1.5 h-8 text-xs"
            onClick={() => testWebhook.mutate(webhook.id)}
            disabled={testWebhook.isPending}
          >
            {testWebhook.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
            Send Test
          </Button>
          <Button
            variant="outline" size="sm"
            className="rounded-lg gap-1.5 h-8 text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
            onClick={() => setShowRotateConfirm(true)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Rotate Token
          </Button>
        </div>
      </div>

      {/* ── Setup Guide (collapsible, full width) ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
          onClick={() => setGuideOpen((v) => !v)}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-semibold text-foreground">Setup Guide</span>
            <span className="text-xs text-muted-foreground">— how to connect your forms</span>
          </div>
          {guideOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {guideOpen && (
          <div className="border-t border-border">
            <div className="flex gap-1 p-3 overflow-x-auto border-b border-border/50 bg-muted/20">
              {PLATFORM_GUIDES.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => setGuidePlatform(i)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    guidePlatform === i
                      ? "bg-indigo-600 text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span>{p.icon}</span> {p.name}
                </button>
              ))}
            </div>
            {(() => {
              const g = PLATFORM_GUIDES[guidePlatform];
              return (
                <div className="p-4 space-y-3">
                  <ol className="space-y-1.5">
                    {g.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        <span className="text-foreground leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                    <div className="rounded-lg bg-muted/50 border border-border/50 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Field format</p>
                      <code className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{g.fieldFormat}</code>
                    </div>
                    <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/60 dark:border-emerald-500/20 p-3">
                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Example</p>
                      <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">{g.example}</pre>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => window.print()}>
                      <Printer className="h-3 w-3" /> Print
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── Field Mapping ── */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Field Mapping</h3>
            <p className="text-xs text-muted-foreground">Map external field names to lead fields</p>
          </div>
          <Button
            size="sm"
            className="rounded-lg h-8 text-xs"
            onClick={() => saveMapping.mutate({ id: webhook.id, mapping })}
            disabled={saveMapping.isPending}
          >
            {saveMapping.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Mapping"}
          </Button>
        </div>

        {Object.keys(mapping).length > 0 && (
          <div className="space-y-1.5">
            {Object.entries(mapping).map(([extField, leadField]) => {
              const label = allLeadFields.find((f) => f.id === leadField)?.label ?? leadField;
              return (
                <div key={extField} className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs font-mono truncate">{extField}</div>
                  <span className="text-muted-foreground text-xs font-bold shrink-0">→</span>
                  <div className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/60 dark:border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 font-medium truncate">{label}</div>
                  <button onClick={() => removeMapping(extField)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-rose-500 transition-colors shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {Object.keys(mapping).length === 0 && (
          <p className="text-xs text-muted-foreground italic">No mappings yet.</p>
        )}

        <div className="flex items-end gap-2 pt-3 border-t border-border/50">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">External field</label>
            <Input
              className="rounded-lg text-xs font-mono h-8"
              placeholder="e.g. fields[name][value]"
              value={newExtField}
              onChange={(e) => setNewExtField(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMapping()}
            />
          </div>
          <span className="text-muted-foreground text-xs font-bold pb-1.5">→</span>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Lead field</label>
            <Select value={newLeadField} onValueChange={setNewLeadField}>
              <SelectTrigger className="rounded-lg text-xs h-8"><SelectValue placeholder="Select field" /></SelectTrigger>
              <SelectContent>
                {allLeadFields.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={addMapping}
            disabled={!newExtField.trim() || !newLeadField}
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Recent Calls ── */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="font-semibold text-sm">Recent Calls</h3>

        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-4 text-center">No calls received yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const st = LOG_STATUS[log.status] ?? LOG_STATUS.error;
              const Icon = st.icon;
              return (
                <div key={log.id} className={`flex items-start gap-2.5 p-3 rounded-lg border ${st.bg}`}>
                  <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${st.cls}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold ${st.cls}`}>{st.label}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(log.createdAt), "d MMM HH:mm")}</span>
                      {log.ip && <span className="text-xs text-muted-foreground/50">{log.ip}</span>}
                    </div>
                    {log.error && <p className="text-xs text-rose-600 mt-0.5">{log.error}</p>}
                    {log.leadId && <p className="text-xs text-emerald-600 mt-0.5">Lead: <code className="font-mono">{log.leadId.slice(0, 8)}</code></p>}
                    <details className="mt-1.5">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none">Payload</summary>
                      <pre className="mt-1 text-[11px] bg-muted/60 rounded-lg p-2 overflow-x-auto text-muted-foreground font-mono max-h-40">
                        {log.payload && Object.keys(log.payload).length > 0
                          ? JSON.stringify(log.payload, null, 2)
                          : "(empty)"}
                      </pre>
                    </details>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {isFailedStatus(log.status) && (
                      <button
                        onClick={() => retryLog.mutate(
                          { logId: log.id, webhookId: log.webhookId },
                          { onSuccess: () => toast.success("Retry sent"), onError: (e: any) => toast.error(e?.message ?? "Retry failed") }
                        )}
                        disabled={retryLog.isPending}
                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 transition-colors"
                        title="Retry"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteLog.mutate({ logId: log.id, webhookId: log.webhookId })}
                      disabled={deleteLog.isPending}
                      className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {logsData && logsData.total > logs.length && (
          <p className="text-xs text-muted-foreground text-center">
            Showing {logs.length} of {logsData.total} calls
          </p>
        )}
      </div>

      {/* Rotate token confirm */}
      <AlertDialog open={showRotateConfirm} onOpenChange={setShowRotateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate token?</AlertDialogTitle>
            <AlertDialogDescription>
              A new token will be generated. The old URL stops working immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => rotateToken.mutate(webhook.id, { onSuccess: () => setShowRotateConfirm(false) })}
            >
              Rotate Token
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
