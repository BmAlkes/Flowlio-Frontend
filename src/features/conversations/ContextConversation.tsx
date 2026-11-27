import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useContextConversation, type Audience, type Context } from "./api";
import { ConversationView } from "./ConversationView";

/** The conversation of a project, task or client, embedded where that item is shown (task details, project page). */
export function ContextConversation({ context, compact = true, initialAudience, className }: { context: Context; compact?: boolean; initialAudience?: Audience; className?: string }) {
  const { t } = useTranslation();
  const conversation = useContextConversation(context);
  if (conversation.isLoading) return <div className="p-4"><Loader2 className="size-5 animate-spin text-muted-foreground" aria-label={t("conversations.loading")} /></div>;
  if (!conversation.data) return <p className="p-4 text-sm text-muted-foreground">{t("conversations.unavailable")}</p>;
  return <div className={className ?? "flex h-[28rem] flex-col"}><ConversationView conversation={conversation.data} compact={compact} initialAudience={initialAudience} /></div>;
}
