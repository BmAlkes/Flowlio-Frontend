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
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface ClientTimelineProps {
  clientId: string;
  mode?: "admin" | "client";
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  call: <Phone className="w-3 h-3" />,
  email: <Mail className="w-3 h-3" />,
  meeting: <Users className="w-3 h-3" />,
  status_change: <ArrowRightLeft className="w-3 h-3" />,
  temperature_change: <Thermometer className="w-3 h-3" />,
  note: <MessageSquare className="w-3 h-3" />,
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
    <div className="flex flex-col gap-4">

      {/* AI Insight */}
      {mode === "admin" && insights && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">
              Recommended
            </p>
            <p className="text-[12px] text-indigo-800 dark:text-indigo-300 font-medium leading-snug">
              {insights.recommendedAction}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[9px] font-bold text-indigo-400 uppercase">Score</p>
            <p className="text-base font-black text-indigo-700 dark:text-indigo-300">
              {insights.score}%
            </p>
          </div>
        </div>
      )}

      {/* Log form */}
      <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
        <div className="flex gap-1.5 p-2 border-b border-border/40 bg-background/50">
          {(mode === "admin" ? LOG_TYPES : (["note"] as const)).map((t_) => (
            <button
              key={t_}
              onClick={() => setType(t_)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                type === t_
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t_ === "note" && mode === "client" ? "Message" : t_}
            </button>
          ))}
        </div>

        <div className="relative p-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("activity.logPlaceholder", {
              type: type === "note" && mode === "client" ? "message" : type,
            })}
            className="min-h-[72px] resize-none pr-11 rounded-lg text-[13px] border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          />
          <Button
            size="icon"
            className="absolute bottom-4 right-4 rounded-full h-7 w-7 bg-indigo-600 hover:bg-indigo-700 shadow-md"
            onClick={handleSubmit}
            disabled={!content.trim() || addInteraction.isPending}
          >
            {addInteraction.isPending
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Send className="w-3.5 h-3.5" />
            }
          </Button>
        </div>
      </div>

      {/* Timeline list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        </div>
      ) : !visibleTimeline?.length ? (
        <p className="text-center py-8 text-[12px] text-muted-foreground/50 italic">
          No interactions logged yet.
        </p>
      ) : (
        <div className="relative pl-5 space-y-3">
          {/* vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/50" />

          <AnimatePresence initial={false}>
            {visibleTimeline.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ delay: index * 0.03 }}
                className="relative"
              >
                {/* dot */}
                <div className={`absolute -left-[18px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-background z-10 ${TYPE_COLOR[item.type] ?? TYPE_COLOR.note}`}>
                  {TYPE_ICON[item.type] ?? TYPE_ICON.note}
                </div>

                <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
                  {/* item header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 shrink-0">
                        <AvatarImage src={item.user?.image} />
                        <AvatarFallback className="text-[8px] font-bold">
                          {item.user?.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[12px] font-semibold text-foreground">
                        {item.user?.name}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize ${TYPE_COLOR[item.type] ?? TYPE_COLOR.note}`}>
                        {item.type.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(item.createdAt), "MMM d, h:mm a")}</span>
                      </div>
                      {mode === "admin" && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          title="Delete interaction"
                          className="p-1 rounded-md text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-40"
                        >
                          {deletingId === item.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Trash2 className="w-3 h-3" />
                          }
                        </button>
                      )}
                    </div>
                  </div>

                  {/* item content */}
                  <div className="px-3 py-2.5">
                    <p className="text-[13px] text-foreground/85 whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </p>
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
