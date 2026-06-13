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
  WebhookSource,
} from "@/hooks/useWebhooks";
import { useLeadFields } from "@/hooks/useLeadFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle2,
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
      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

const SOURCE_LABELS: Record<WebhookSource, string> = {
  wordpress: "WordPress",
  facebook: "Facebook Lead Ads",
  generic: "Generic / Custom",
};

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

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [newExtField, setNewExtField] = useState("");
  const [newLeadField, setNewLeadField] = useState("");
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);

  useEffect(() => {
    if (webhook) {
      setMapping(webhook.fieldMapping ?? {});
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
    setMapping((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSaveMapping = () => {
    if (!id) return;
    saveMapping.mutate({ id, mapping });
  };

  if (isLoading || !webhook) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const logs = logsData?.logs ?? [];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/leads/webhooks")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Webhooks
        </button>
        <span className="text-muted-foreground/40">/</span>
        <h2 className="font-semibold text-foreground">{webhook.name}</h2>
      </div>

      {/* Info card */}
      <div className="border border-border rounded-xl p-5 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg">{webhook.name}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{SOURCE_LABELS[webhook.source]}</span>
          </div>
          <button
            onClick={() => updateWebhook.mutate({ id: webhook.id, data: { active: !webhook.active } })}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            {webhook.active
              ? <><ToggleRight className="h-5 w-5 text-emerald-500" /> <span className="text-emerald-600">Active</span></>
              : <><ToggleLeft className="h-5 w-5 text-muted-foreground" /> <span className="text-muted-foreground">Inactive</span></>}
          </button>
        </div>

        {/* Webhook URL */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Webhook URL
          </p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
            <code className="text-sm font-mono text-foreground flex-1 break-all">{receiveUrl}</code>
            <CopyButton value={receiveUrl} label="URL" />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Use this URL as the webhook endpoint in your form / integration.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full flex items-center gap-1.5"
            onClick={() => testWebhook.mutate(webhook.id)}
            disabled={testWebhook.isPending}
          >
            {testWebhook.isPending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <PlayCircle className="h-3.5 w-3.5" />}
            Send Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full flex items-center gap-1.5 text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            onClick={() => setShowRotateConfirm(true)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Rotate Token
          </Button>
        </div>
      </div>

      {/* Field Mapping */}
      <div className="border border-border rounded-xl p-5 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Field Mapping</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Map the field names sent by your form to lead fields
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-full px-4"
            onClick={handleSaveMapping}
            disabled={saveMapping.isPending}
          >
            {saveMapping.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Mapping"}
          </Button>
        </div>

        {/* Existing mappings */}
        {Object.keys(mapping).length > 0 ? (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              <span>External field name</span>
              <span />
              <span>Lead field</span>
              <span />
            </div>
            {Object.entries(mapping).map(([extField, leadField]) => {
              const leadFieldLabel = allLeadFields.find((f) => f.id === leadField)?.label ?? leadField;
              return (
                <div key={extField} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                  <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm font-mono">
                    {extField}
                  </div>
                  <span className="text-muted-foreground text-sm">→</span>
                  <div className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 text-sm text-indigo-700 dark:text-indigo-300">
                    {leadFieldLabel}
                  </div>
                  <button
                    onClick={() => removeMapping(extField)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/60 italic">No mappings yet. Add your first below.</p>
        )}

        {/* Add new mapping row */}
        <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-end pt-2 border-t border-border/50">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">External field name</label>
            <Input
              className="rounded-lg text-sm font-mono"
              placeholder="e.g. first_name"
              value={newExtField}
              onChange={(e) => setNewExtField(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMapping()}
            />
          </div>
          <span className="text-muted-foreground text-sm pb-2">→</span>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Lead field</label>
            <Select value={newLeadField} onValueChange={setNewLeadField}>
              <SelectTrigger className="rounded-lg text-sm">
                <SelectValue placeholder="Select lead field" />
              </SelectTrigger>
              <SelectContent>
                {allLeadFields.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={addMapping}
            disabled={!newExtField.trim() || !newLeadField}
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors pb-0 self-end"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="border border-border rounded-xl p-5 bg-card space-y-3">
        <h3 className="font-semibold">Recent Calls</h3>

        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 italic">No calls received yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  log.status === "success"
                    ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10"
                    : "border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-900/10"
                }`}
              >
                {log.status === "success"
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  : <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${log.status === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                      {log.status === "success" ? "Success" : "Error"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.createdAt), "d MMM yyyy HH:mm:ss")}
                    </span>
                    {log.ip && (
                      <span className="text-xs text-muted-foreground/60">{log.ip}</span>
                    )}
                  </div>
                  {log.error && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{log.error}</p>
                  )}
                  {log.leadId && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Lead created: <code className="font-mono">{log.leadId}</code>
                    </p>
                  )}
                  <details className="mt-1.5">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none">
                      View payload
                    </summary>
                    <pre className="mt-1.5 text-xs bg-muted/50 rounded-lg p-2 overflow-x-auto text-muted-foreground font-mono">
                      {log.payload && Object.keys(log.payload).length > 0
                        ? JSON.stringify(log.payload, null, 2)
                        : "(payload not stored or empty)"}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
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
              A new token will be generated. The old webhook URL will stop working immediately — you must update your integration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => {
                rotateToken.mutate(webhook.id, { onSuccess: () => setShowRotateConfirm(false) });
              }}
            >
              Rotate Token
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
