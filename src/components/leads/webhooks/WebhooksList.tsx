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
  ToggleLeft,
  ToggleRight,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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
      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
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
      onSuccess: () => {
        setName("");
        setSource("generic");
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>New Webhook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Name *</label>
            <Input
              className="rounded-lg"
              placeholder="e.g. WordPress Contact Form"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Source</label>
            <Select value={source} onValueChange={(v) => setSource(v as WebhookSource)}>
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SOURCE_INFO).map(([val, info]) => (
                  <SelectItem key={val} value={val}>
                    {info.icon} {info.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="rounded-full px-5">Cancel</Button>
          <Button
            onClick={handleCreate}
            disabled={isPending || !name.trim()}
            className="rounded-full px-5"
          >
            {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Create"}
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
    const base = import.meta.env.VITE_API_URL ?? "";
    return `${base}/webhooks/receive/${token}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Each webhook has a unique public URL. Send form submissions to that URL and leads are created automatically.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="rounded-full px-5 flex items-center gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          New Webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <Webhook className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No webhooks yet.</p>
          <p className="text-muted-foreground/60 text-xs mt-1 max-w-xs mx-auto">
            Connect WordPress, Facebook Lead Ads, or any form to automatically create leads.
          </p>
          <Button variant="outline" className="mt-4 rounded-full" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
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
                className="border border-border rounded-xl p-4 bg-card hover:bg-muted/20 transition-colors cursor-pointer group"
                onClick={() => navigate(`/dashboard/leads/webhooks/${wh.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl">
                    {srcInfo.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{wh.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${srcInfo.color}`}>
                        {srcInfo.label}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${wh.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-muted text-muted-foreground border border-border"}`}>
                        {wh.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-2 mt-2 p-2.5 rounded-lg bg-muted/50 border border-border/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <code className="text-xs text-muted-foreground font-mono flex-1 truncate">{url}</code>
                      <CopyButton value={url} />
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {wh.totalCalls !== undefined && (
                        <span>{wh.totalCalls} calls</span>
                      )}
                      {wh.lastCallAt && (
                        <span>Last: {format(new Date(wh.lastCallAt), "d MMM HH:mm")}</span>
                      )}
                      <span>Created {format(new Date(wh.createdAt), "d MMM yyyy")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => updateWebhook.mutate({ id: wh.id, data: { active: !wh.active } })}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={wh.active ? "Deactivate" : "Activate"}
                    >
                      {wh.active
                        ? <ToggleRight className="h-5 w-5 text-emerald-500" />
                        : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => setDeleteId(wh.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors ml-1" />
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
