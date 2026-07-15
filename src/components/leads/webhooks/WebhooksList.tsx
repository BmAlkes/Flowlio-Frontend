import { useState } from "react";
import { useNavigate } from "react-router";
import {
  useWebhooks,
  useCreateWebhook,
  useDeleteWebhook,
  useUpdateWebhook,
  WebhookSource,
} from "@/hooks/useWebhooks";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Plus,
  Loader2,
  Webhook,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { backendDomain } from "@/configs/axios.config";

const SOURCE_INFO: Record<WebhookSource, { label: string; color: string; icon: string }> = {
  wordpress: { label: "WordPress", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200", icon: "🟦" },
  facebook: { label: "Facebook Leads", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200", icon: "📘" },
  generic: { label: "Generic / Custom", color: "text-gray-600 bg-gray-100 dark:bg-gray-800/40 border-gray-300", icon: "🔗" },
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
      title="Copy URL"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function CreateWebhookDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [source, setSource] = useState<WebhookSource>("generic");
  const { mutate: create, isPending } = useCreateWebhook();

  const handleCreate = () => {
    if (!name.trim()) return;
    create({ name, source }, {
      onSuccess: () => { setName(""); setSource("generic"); onClose(); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-xl">New Webhook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-semibold mb-1.5 block">Name *</label>
            <Input
              className="rounded-lg h-11 text-base"
              placeholder="e.g. WordPress Contact Form"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1.5 block">Source</label>
            <Select value={source} onValueChange={(v) => setSource(v as WebhookSource)}>
              <SelectTrigger className="rounded-lg h-11 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SOURCE_INFO).map(([val, info]) => (
                  <SelectItem key={val} value={val} className="text-base">
                    {info.icon} {info.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="outline" onClick={onClose} className="rounded-full px-6 h-10">Cancel</Button>
          <Button onClick={handleCreate} disabled={isPending || !name.trim()} className="rounded-full px-6 h-10">
            {isPending ? <><Loader2 className="h-4 w-4 me-2 animate-spin" />Creating...</> : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const WebhooksList = () => {
  const navigate = useNavigate();
  const { data: webhooks = [], isLoading } = useWebhooks();
  const deleteWebhook = useDeleteWebhook();
  const updateWebhook = useUpdateWebhook();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getReceiveUrl = (token: string) => {
    const base = backendDomain.endsWith("/") ? backendDomain.slice(0, -1) : backendDomain;
    return `${base}/api/webhooks/receive/${token}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-base text-muted-foreground">
          Each webhook has a unique public URL. Send form submissions to that URL and leads are created automatically.
        </p>
        <Button onClick={() => setShowCreate(true)} className="rounded-full px-6 h-11 text-base flex items-center gap-2 shrink-0">
          <Plus className="h-5 w-5" />
          New Webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-14 text-center">
          <Webhook className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-foreground text-lg font-semibold">No webhooks yet</p>
          <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
            Connect WordPress, Facebook Lead Ads, or any form to automatically create leads.
          </p>
          <Button variant="outline" className="mt-5 rounded-full px-6 h-10" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 me-2" />
            Create your first webhook
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => {
            const srcInfo = SOURCE_INFO[wh.source];
            const url = getReceiveUrl(wh.token);

            return (
              <div
                key={wh.id}
                className="border border-border rounded-2xl p-5 bg-card hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => navigate(`/dashboard/leads/webhooks/${wh.id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    {srcInfo.icon}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    {/* Name + badges */}
                    <div className="flex items-center gap-2.5 flex-wrap mb-2">
                      <span className="font-bold text-lg text-foreground">{wh.name}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${srcInfo.color}`}>
                        {srcInfo.label}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        wh.active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/30"
                          : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/30"
                      }`}>
                        {wh.active ? "● Active" : "○ Inactive"}
                      </span>
                    </div>

                    {/* URL */}
                    <div
                      className="flex items-center gap-2 p-3 rounded-xl bg-muted/60 border border-border/60"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <code className="text-sm text-muted-foreground font-mono flex-1 truncate">{url}</code>
                      <CopyButton value={url} />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-2.5 text-sm text-muted-foreground">
                      {wh.totalCalls !== undefined && (
                        <span className="flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5" />
                          {wh.totalCalls} calls
                        </span>
                      )}
                      {wh.lastCallAt && (
                        <span>Last: {format(new Date(wh.lastCallAt), "d MMM HH:mm")}</span>
                      )}
                      <span>Created {format(new Date(wh.createdAt), "d MMM yyyy")}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/60 border border-border/40">
                      <span className="text-sm font-medium text-muted-foreground">
                        {wh.active ? "On" : "Off"}
                      </span>
                      <Switch
                        checked={wh.active}
                        onCheckedChange={(checked) =>
                          updateWebhook.mutate({ id: wh.id, data: { active: checked } })
                        }
                      />
                    </div>
                    <button
                      onClick={() => setDeleteId(wh.id)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 text-rose-600 border border-rose-200 dark:border-rose-500/30 transition-colors"
                      title="Delete webhook"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/90 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateWebhookDialog open={showCreate} onClose={() => setShowCreate(false)} />

      <AlertDialog open={!!deleteId} onOpenChange={(v: boolean) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the webhook, its token, and all logs. Integrations using this webhook URL will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (deleteId) deleteWebhook.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
