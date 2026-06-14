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

// ─── Setup guide content ──────────────────────────────────────────────────────

interface PlatformGuide {
  name: string;
  icon: string;
  steps: string[];
  fieldFormat: string;
  example: string;
}

const PLATFORM_GUIDES: PlatformGuide[] = [
  {
    name: "Elementor (WordPress)",
    icon: "🟦",
    steps: [
      "Open your page in Elementor and add a Form widget.",
      "In each form field, give it a clear ID (e.g. 'name', 'field_phone', 'message').",
      "In Form → Actions After Submit, add the 'Webhook' action.",
      "Paste the Flowlio Webhook URL in the Webhook URL field.",
      "In Flowlio field mapping, use the format shown below as the 'External field name'.",
    ],
    fieldFormat: "fields[FIELD_ID][value]",
    example: "fields[name][value] → Name\nfields[field_phone][value] → Phone\nfields[message][value] → Message (custom)",
  },
  {
    name: "Contact Form 7 (WordPress)",
    icon: "📝",
    steps: [
      "Install the 'CF7 to Webhook' plugin (free on WordPress.org).",
      "Open your CF7 form and go to the new 'Webhook' tab.",
      "Paste the Flowlio Webhook URL and save.",
      "CF7 sends fields using the input name you defined in the form shortcode.",
    ],
    fieldFormat: "FIELD_NAME (as defined in the shortcode)",
    example: "your-name → Name\nyour-email → Email\nyour-phone → Phone",
  },
  {
    name: "WPForms (WordPress)",
    icon: "📋",
    steps: [
      "Requires WPForms Pro with the Webhooks addon.",
      "In your form, go to Settings → Webhooks and enable it.",
      "Paste the Flowlio Webhook URL as the Request URL.",
      "Set Request Method to POST and Request Format to JSON.",
      "Add fields using the 'Field Name' / 'Field Value' pairs below.",
    ],
    fieldFormat: "Custom field name you define in WPForms webhook settings",
    example: "name → Name\nphone → Phone\nmessage → Message (custom)",
  },
  {
    name: "Facebook Lead Ads",
    icon: "📘",
    steps: [
      "Facebook Lead Ads cannot send webhooks directly to third-party URLs.",
      "Use a tool like Make.com (formerly Integromat) or Zapier as the bridge.",
      "In Make.com: create a scenario with 'Facebook Lead Ads' → 'HTTP Request'.",
      "Set the HTTP module URL to the Flowlio Webhook URL, method POST, body as JSON.",
      "Map the lead fields (full_name, phone_number, email) to the JSON body keys.",
    ],
    fieldFormat: "JSON keys you define in Make.com / Zapier",
    example: "name → Name\nphone → Phone\nemail → Email",
  },
  {
    name: "Generic / Custom (any platform)",
    icon: "🔗",
    steps: [
      "Send an HTTP POST request to the Flowlio Webhook URL.",
      "Content-Type can be application/json or application/x-www-form-urlencoded.",
      "Include the fields in the body using simple key-value pairs.",
      "In Flowlio field mapping, use the exact key names you send.",
    ],
    fieldFormat: "Any key name you send in the POST body",
    example: 'JSON: { "name": "John", "phone": "123", "message": "Hi" }\nMapped: name → Name, phone → Phone',
  },
];

function SetupGuide({ webhookUrl }: { webhookUrl: string }) {
  const [open, setOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState(0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-base text-foreground">Setup Guide</p>
            <p className="text-sm text-muted-foreground">How to connect your forms to this webhook</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border">
          {/* Platform tabs */}
          <div className="flex gap-1 p-4 overflow-x-auto border-b border-border/60 bg-muted/20">
            {PLATFORM_GUIDES.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setActivePlatform(i)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activePlatform === i
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{p.icon}</span>
                {p.name.split(" (")[0]}
              </button>
            ))}
          </div>

          {/* Guide content */}
          {(() => {
            const guide = PLATFORM_GUIDES[activePlatform];
            return (
              <div className="p-5 space-y-5">
                <div>
                  <h4 className="font-semibold text-base mb-3">
                    {guide.icon} {guide.name} — Step by step
                  </h4>
                  <ol className="space-y-2">
                    {guide.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-xl bg-muted/50 border border-border/60 p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Field format
                  </p>
                  <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400">{guide.fieldFormat}</code>
                </div>

                <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/60 dark:border-emerald-500/20 p-4">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                    Mapping example
                  </p>
                  <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{guide.example}</pre>
                </div>

                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 p-4">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                    Your webhook URL
                  </p>
                  <code className="text-sm font-mono text-foreground break-all">{webhookUrl}</code>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                    Print / Save as PDF
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(label ? `${label} copied` : "Copied");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

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

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [newExtField, setNewExtField] = useState("");
  const [newLeadField, setNewLeadField] = useState("");
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);

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
    <div className="space-y-6 w-full">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/leads/webhooks")}
          className="flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Webhooks
        </button>
        <span className="text-muted-foreground/40">/</span>
        <h2 className="font-bold text-lg text-foreground">{webhook.name}</h2>
      </div>

      {/* Two-column layout: left = config, right = guide */}
      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-6 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">

          {/* Info card */}
          <div className="border border-border rounded-2xl p-6 bg-card space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-xl text-foreground">{webhook.name}</h3>
                <p className="text-base text-muted-foreground mt-0.5">{SOURCE_LABELS[webhook.source]}</p>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted/60 border border-border/60">
                <span className="text-base font-semibold text-muted-foreground">
                  {webhook.active ? "Active" : "Inactive"}
                </span>
                <Switch
                  checked={webhook.active}
                  onCheckedChange={(checked) =>
                    updateWebhook.mutate({ id: webhook.id, data: { active: checked } })
                  }
                />
              </div>
            </div>

            {/* Webhook URL */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Webhook URL
              </p>
              <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border/50">
                <code className="text-sm font-mono text-foreground flex-1 break-all">{receiveUrl}</code>
                <CopyButton value={receiveUrl} label="URL" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Use this URL as the webhook endpoint in your form / integration.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                className="rounded-full flex items-center gap-2 h-10 px-5 text-base"
                onClick={() => testWebhook.mutate(webhook.id)}
                disabled={testWebhook.isPending}
              >
                {testWebhook.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                Send Test
              </Button>
              <Button
                variant="outline"
                className="rounded-full flex items-center gap-2 h-10 px-5 text-base text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => setShowRotateConfirm(true)}
              >
                <RefreshCw className="h-4 w-4" />
                Rotate Token
              </Button>
            </div>
          </div>

          {/* Field Mapping */}
          <div className="border border-border rounded-2xl p-6 bg-card space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Field Mapping</h3>
            <p className="text-base text-muted-foreground mt-0.5">
              Map the field names sent by your form to lead fields
            </p>
          </div>
          <Button
            className="rounded-full px-5 h-10 text-base"
            onClick={() => saveMapping.mutate({ id: webhook.id, mapping })}
            disabled={saveMapping.isPending}
          >
            {saveMapping.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Mapping"}
          </Button>
        </div>

        {/* Existing mappings */}
        {Object.keys(mapping).length > 0 ? (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
              <span>External field name</span>
              <span />
              <span>Lead field</span>
              <span />
            </div>
            {Object.entries(mapping).map(([extField, leadField]) => {
              const leadFieldLabel = allLeadFields.find((f) => f.id === leadField)?.label ?? leadField;
              return (
                <div key={extField} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                  <div className="px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-base font-mono">
                    {extField}
                  </div>
                  <span className="text-muted-foreground text-base font-bold">→</span>
                  <div className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 text-base text-indigo-700 dark:text-indigo-300 font-medium">
                    {leadFieldLabel}
                  </div>
                  <button
                    onClick={() => removeMapping(extField)}
                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 border border-rose-200 dark:border-rose-500/30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-base text-muted-foreground/60 italic">No mappings yet. Add your first below.</p>
        )}

        {/* Add new mapping row */}
        <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-end pt-4 border-t border-border/50">
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-1.5">External field name</label>
            <Input
              className="rounded-xl text-base font-mono h-11"
              placeholder="e.g. fields[name][value]"
              value={newExtField}
              onChange={(e) => setNewExtField(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMapping()}
            />
          </div>
          <span className="text-muted-foreground text-lg font-bold pb-2">→</span>
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-1.5">Lead field</label>
            <Select value={newLeadField} onValueChange={setNewLeadField}>
              <SelectTrigger className="rounded-xl text-base h-11">
                <SelectValue placeholder="Select lead field" />
              </SelectTrigger>
              <SelectContent>
                {allLeadFields.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="text-base">{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={addMapping}
            disabled={!newExtField.trim() || !newLeadField}
            className="flex items-center justify-center h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors self-end"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="border border-border rounded-2xl p-6 bg-card space-y-4">
        <h3 className="font-bold text-lg">Recent Calls</h3>

        {logs.length === 0 ? (
          <p className="text-base text-muted-foreground/60 italic">No calls received yet.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  log.status === "success"
                    ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10"
                    : "border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-900/10"
                }`}
              >
                {log.status === "success"
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  : <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-sm font-bold ${log.status === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                      {log.status === "success" ? "Success" : "Error"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), "d MMM yyyy HH:mm:ss")}
                    </span>
                    {log.ip && <span className="text-sm text-muted-foreground/60">{log.ip}</span>}
                  </div>
                  {log.error && (
                    <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">{log.error}</p>
                  )}
                  {log.leadId && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Lead created: <code className="font-mono text-xs">{log.leadId}</code>
                    </p>
                  )}
                  <details className="mt-2" open>
                    <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground select-none font-medium">
                      Payload
                    </summary>
                    <pre className="mt-2 text-xs bg-muted/60 rounded-xl p-3 overflow-x-auto text-muted-foreground font-mono">
                      {log.payload && Object.keys(log.payload).length > 0
                        ? JSON.stringify(log.payload, null, 2)
                        : "(payload not stored or empty)"}
                    </pre>
                  </details>
                </div>

                <button
                  onClick={() => deleteLog.mutate({ logId: log.id, webhookId: log.webhookId })}
                  disabled={deleteLog.isPending}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-500 border border-rose-200 dark:border-rose-500/20 transition-colors shrink-0"
                  title="Delete log"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {logsData && logsData.total > logs.length && (
          <p className="text-sm text-muted-foreground text-center">
            Showing {logs.length} of {logsData.total} calls
          </p>
        )}
      </div>

        </div> {/* END left column */}

        {/* ── RIGHT COLUMN — Setup Guide (sticky on desktop) ── */}
        <div className="xl:sticky xl:top-6">
          <SetupGuide webhookUrl={receiveUrl} />
        </div>

      </div> {/* END grid */}

      {/* Rotate token confirm */}
      <AlertDialog open={showRotateConfirm} onOpenChange={setShowRotateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate token?</AlertDialogTitle>
            <AlertDialogDescription>
              A new token will be generated. The old webhook URL will stop working immediately — you must update your integration.
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
