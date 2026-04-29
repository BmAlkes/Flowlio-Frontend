import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DollarSign, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useLeadInsights } from "@/hooks/useCRM";

interface LeadCardProps {
  lead: any;
  isOverlay?: boolean;
}

export const LeadCard = ({ lead, isOverlay }: LeadCardProps) => {
  const { data: insights } = useLeadInsights(lead.id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatValue = (val: any) => {
    if (!val) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(Number(val));
  };

  const getTempStyles = (temp?: string) => {
    switch (temp) {
      case "Hot": return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/50 dark:border-orange-500/20";
      case "Warm": return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20";
      default: return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20";
    }
  };

  const showFollowUp = lead.lastInteractionAt && differenceInDays(new Date(), new Date(lead.lastInteractionAt)) > 7;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className={`
        bg-white dark:bg-gray-800/80 p-3.5 rounded-xl border border-border/60 shadow-sm group cursor-grab active:cursor-grabbing
        hover:border-indigo-400/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative
        ${isOverlay ? "shadow-2xl ring-2 ring-indigo-500/50 cursor-grabbing scale-[1.02] rotate-1 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />

      <Flex className="justify-between items-start mb-3 relative z-10">
        <Flex className="gap-2.5 items-center min-w-0">
          <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-700 shadow-sm">
            <AvatarImage src={lead.image} />
            <AvatarFallback className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 font-bold">
              {getInitials(lead.name || "UN")}
            </AvatarFallback>
          </Avatar>
          <Box className="min-w-0">
            <h4 className="text-xs font-bold truncate text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {lead.name}
            </h4>
            <p className="text-[10px] text-muted-foreground/80 truncate font-medium">{lead.businessIndustry || "General"}</p>
          </Box>
        </Flex>
        {insights?.temperature && (
          <Box className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${getTempStyles(insights.temperature)}`}>
            {insights.temperature.toUpperCase()}
          </Box>
        )}
      </Flex>

      <Box className="space-y-2 mb-3 relative z-10">
        <Flex className="items-center justify-between">
          <Flex className="items-center gap-1.5">
            <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20">
              <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-foreground">{formatValue(lead.leadValue)}</span>
          </Flex>
          <Flex className="items-center gap-1 text-[10px] font-bold text-muted-foreground bg-gray-100/50 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
            <TrendingUp className="h-2.5 w-2.5 text-indigo-500" />
            <span>{lead.leadProbability || 0}%</span>
          </Flex>
        </Flex>
      </Box>

      <Box className="pt-2.5 border-t border-border/40 relative z-10">
        <Flex className="items-center justify-between">
          {showFollowUp ? (
            <Flex className="items-center gap-1 text-[9px] font-bold text-rose-500">
              <AlertCircle className="h-2.5 w-2.5" />
              <span>FOLLOW UP</span>
            </Flex>
          ) : (
            <div />
          )}
          
          {lead.lastInteractionAt ? (
            <Flex className="items-center gap-1 text-[9px] text-muted-foreground font-medium">
              <Clock className="h-2.5 w-2.5 opacity-60" />
              <span>{format(new Date(lead.lastInteractionAt), "MMM d")}</span>
            </Flex>
          ) : (
            <span className="text-[9px] text-muted-foreground/60 italic">No contact yet</span>
          )}
        </Flex>
      </Box>
    </Box>
  );
};
