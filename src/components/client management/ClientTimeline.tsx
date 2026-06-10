import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useClientTimeline,
  useAddInteraction,
  useDeleteInteraction,
  useLeadInsights,
} from "@/hooks/useCRM";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  MessageSquare,
  Phone,
  Mail,
  Users,
  Clock,
  Send,
  Loader2,
  ArrowRightLeft,
  Thermometer,
  Trash2,
  Lightbulb,
  CornerDownRight,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface ClientTimelineProps {
  clientId: string;
  mode?: "admin" | "client";
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  call: <Phone className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  meeting: <Users className="w-3.5 h-3.5" />,
  status_change: <ArrowRightLeft className="w-3.5 h-3.5" />,
  temperature_change: <Thermometer className="w-3.5 h-3.5" />,
  note: <MessageSquare className="w-3.5 h-3.5" />,
};

const TYPE_COLOR: Record<string, string> = {
  call: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  email: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  meeting: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  status_change: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  temperature_change: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  note: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const LOG_TYPES = ["note", "call", "email", "meeting"] as const;

export const ClientTimeline = ({ clientId, mode = "admin" }: ClientTimelineProps) => {
  const { t } = useTranslation();
  const { data: timeline, isLoading } = useClientTimeline(clientId);
  const { data: insights } = useLeadInsights(clientId);
  const addInteraction = useAddInteraction();
  const deleteInteraction = useDeleteInteraction();

  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("note");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!content.trim()) return;
    addInteraction.mutate(
      { clientId, type, content: content.trim() },
      { onSuccess: () => setContent("") }
    );
  };

  const handleDelete = (interactionId: string) => {
    setDeletingId(interactionId);
    deleteInteraction.mutate(
      { interactionId, clientId },
      { onSettled: () => setDeletingId(null) }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const visibleTimeline = timeline?.filter(
    (item) => mode === "admin" || !["status_change", "temperature_change"].includes(item.type)
  );

  return (
    <div className="flex flex-col gap-5">

      {/* AI Insight */}
      {mode === "admin" && insights && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">
              {t("pipeline.recommendedAction")}
            </p>
            <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium leading-snug">
              {insights.recommendedAction}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-bold text-indigo-400 uppercase">{t("pipeline.scoreLabel")}</p>
            <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">
              {insights.score}%
            </p>
          </div>
        </div>
      )}

      {/* Log form */}
      <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
        <div className="flex gap-1.5 p-2.5 border-b border-border/40 bg-background/50">
          {(mode === "admin" ? LOG_TYPES : (["note"] as const)).map((t_) => (
            <button
              key={t_}
              onClick={() => setType(t_)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                type === t_
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t_ === "note" && mode === "client" ? t("pipeline.typeSendMessage") : t(`pipeline.type${t_.charAt(0).toUpperCase() + t_.slice(1)}` as any)}
            </button>
          ))}
        </div>

        <div className="relative p-2.5">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("activity.logPlaceholder", {
              type: type === "note" && mode === "client" ? "message" : type,
            })}
            className="min-h-[80px] resize-none pr-12 rounded-lg text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          />
          <Button
            size="icon"
            className="absolute bottom-5 right-5 rounded-full h-8 w-8 bg-indigo-600 hover:bg-indigo-700 shadow-md"
            onClick={handleSubmit}
            disabled={!content.trim() || addInteraction.isPending}
          >
            {addInteraction.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </Button>
        </div>
      </div>

      {/* Timeline list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        </div>
      ) : !visibleTimeline?.length ? (
        <p className="text-center py-10 text-sm text-muted-foreground/60 italic">
          {t("pipeline.noInteractions")}
        </p>
      ) : (
        <div className="relative pl-7 space-y-4">
          {/* Vertical line — visible indigo */}
          <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-indigo-200 dark:bg-indigo-800 rounded-full" />

          <AnimatePresence initial={false}>
            {visibleTimeline.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8, height: 0 }}
                transition={{ delay: index * 0.03 }}
                className="relative"
              >
                {/* dot */}
                <div className={`absolute -left-[26px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-background z-10 ${TYPE_COLOR[item.type] ?? TYPE_COLOR.note}`}>
                  {TYPE_ICON[item.type] ?? TYPE_ICON.note}
                </div>

                <div className="bg-card rounded-xl border border-border/70 overflow-hidden shadow-sm">
                  {/* item header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/40">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarImage src={item.user?.image} />
                        <AvatarFallback className="text-[9px] font-bold">
                          {item.user?.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-foreground truncate">
                        {item.user?.name}
                      </span>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md capitalize ${TYPE_COLOR[item.type] ?? TYPE_COLOR.note}`}>
                        {item.type.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{format(new Date(item.createdAt), "MMM d, h:mm a")}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        title={t("pipeline.deleteInteraction")}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-40"
                      >
                        {deletingId === item.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* item content */}
                  <div className="px-4 py-3">
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </p>

                    {/* Replies from team */}
                    {item.replies && item.replies.length > 0 && (
                      <div className="mt-3 space-y-2 border-l-2 border-indigo-200 dark:border-indigo-700 pl-3">
                        {item.replies.map((reply) => (
                          <div key={reply.id} className="bg-indigo-50/60 dark:bg-indigo-900/10 rounded-lg p-3">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                {reply.userName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-semibold text-foreground">{reply.userName}</span>
                              <div className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400">
                                <CornerDownRight className="w-3 h-3" />
                                <span>Reply</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(reply.createdAt), "MMM d, h:mm a")}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
