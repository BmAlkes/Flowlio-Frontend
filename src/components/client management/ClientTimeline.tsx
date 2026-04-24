import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  useClientTimeline, 
  useAddInteraction, 
  useLeadInsights
} from "@/hooks/useCRM";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
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
  Lightbulb
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface ClientTimelineProps {
  clientId: string;
  mode?: "admin" | "client";
}

export const ClientTimeline = ({ clientId, mode = "admin" }: ClientTimelineProps) => {
  const { t } = useTranslation();
  const { data: timeline, isLoading } = useClientTimeline(clientId);
  const { data: insights } = useLeadInsights(clientId);
  const addInteraction = useAddInteraction();
  
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("note");

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    addInteraction.mutate({
      clientId,
      type,
      content: content.trim()
    }, {
      onSuccess: () => {
        setContent("");
      }
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="w-3 h-3" />;
      case "email": return <Mail className="w-3 h-3" />;
      case "meeting": return <Users className="w-3 h-3" />;
      case "status_change": return <ArrowRightLeft className="w-3 h-3" />;
      default: return <MessageSquare className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "call": return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "email": return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
      case "meeting": return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "status_change": return "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400";
      default: return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <Flex className="py-10 justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </Flex>
    );
  }

  return (
    <Box className="space-y-6">
      {/* Lead Insights Banner - Only show to admin */}
      {mode === "admin" && insights && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 p-4 rounded-xl"
        >
          <Flex className="gap-3 items-start">
            <Box className="p-2 bg-indigo-600 rounded-lg text-white">
              <Lightbulb className="w-4 h-4" />
            </Box>
            <Box>
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">Recommended Action</h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">{insights.recommendedAction}</p>
            </Box>
            <Box className="ml-auto text-right">
              <p className="text-[10px] font-bold text-indigo-500 uppercase">Lead Score</p>
              <p className="text-lg font-black text-indigo-900 dark:text-indigo-200">{insights.score}%</p>
            </Box>
          </Flex>
        </motion.div>
      )}

      {/* Quick Log Form */}
      <Box className="bg-muted/30 p-4 rounded-xl border border-border/50">
        <Flex className="gap-2 mb-3">
          {(mode === "admin" ? ["note", "call", "email", "meeting"] : ["note"]).map((t) => (
            <Button
              key={t}
              variant={type === t ? "default" : "outline"}
              size="sm"
              onClick={() => setType(t)}
              className="rounded-full text-[10px] h-7 capitalize px-3"
            >
              {t === "note" && mode === "client" ? "Send Message" : t}
            </Button>
          ))}
        </Flex>
        
        <Box className="relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("activity.logPlaceholder", { type: type === "note" && mode === "client" ? "message" : type })}
            className="min-h-[80px] resize-none pr-12 rounded-xl text-sm focus-visible:ring-indigo-500"
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 rounded-full h-8 w-8 bg-indigo-600 hover:bg-indigo-700"
            onClick={handleSubmit}
            disabled={!content.trim() || addInteraction.isPending}
          >
            {addInteraction.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </Box>
      </Box>

      {/* Timeline List */}
      <Box className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-0 before:w-0.5 before:bg-border/60">
        <AnimatePresence initial={false}>
          {timeline?.filter(item => mode === "admin" || item.type !== "status_change").map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <Box className={`absolute -left-[22px] p-1.5 rounded-full z-10 border-2 border-background ${getTypeColor(item.type)}`}>
                {getIcon(item.type)}
              </Box>
              
              <Box className="bg-card p-3 rounded-xl border border-border shadow-sm">
                <Flex className="justify-between items-start mb-1">
                  <Flex className="items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={item.user?.image} />
                      <AvatarFallback className="text-[8px]">{item.user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold">{item.user?.name}</span>
                  </Flex>
                  <Flex className="items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(new Date(item.createdAt), "MMM d, h:mm a")}
                  </Flex>
                </Flex>
                
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {timeline?.length === 0 && (
          <Box className="text-center py-6 text-muted-foreground text-sm italic">
            No interactions logged yet.
          </Box>
        )}
      </Box>
    </Box>
  );
};
