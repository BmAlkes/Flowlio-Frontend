import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DollarSign, Clock } from "lucide-react";
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
    opacity: isDragging ? 0.4 : 1,
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

  const getTempColor = (temp?: string) => {
    switch (temp) {
      case "Hot": return "bg-orange-500";
      case "Warm": return "bg-amber-400";
      default: return "bg-blue-400";
    }
  };

  const showFollowUp = lead.lastInteractionAt && differenceInDays(new Date(), new Date(lead.lastInteractionAt)) > 7;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className={`
        bg-card p-3 rounded-lg border border-border shadow-sm group cursor-grab active:cursor-grabbing
        hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors relative
        ${isOverlay ? "shadow-xl ring-2 ring-indigo-500 cursor-grabbing rotate-2" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      {/* Temperature Indicator */}
      <Box className={`absolute top-0 right-0 w-2 h-2 rounded-bl-lg rounded-tr-lg ${getTempColor(insights?.temperature)}`} title={insights?.temperature} />

      <Flex className="justify-between items-start mb-2">
        <Flex className="gap-2 items-center min-w-0">
          <Avatar className="h-6 w-6">
            <AvatarImage src={lead.image} />
            <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              {getInitials(lead.name || "UN")}
            </AvatarFallback>
          </Avatar>
          <Box className="min-w-0">
            <h4 className="text-xs font-semibold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {lead.name}
            </h4>
            <p className="text-[10px] text-muted-foreground truncate">{lead.businessIndustry || "General"}</p>
          </Box>
        </Flex>
        {showFollowUp && (
          <Box className="bg-rose-100 text-rose-600 text-[8px] px-1.5 py-0.5 rounded font-bold animate-pulse">
            FOLLOW UP
          </Box>
        )}
      </Flex>

      <Box className="space-y-1.5 mb-2">
        <Flex className="items-center gap-1.5 text-[10px] text-muted-foreground">
          <DollarSign className="h-3 w-3 text-emerald-500" />
          <span className="font-medium text-foreground">{formatValue(lead.leadValue)}</span>
          <span className="ml-auto opacity-70">{lead.leadProbability || 0}% prob.</span>
        </Flex>
      </Box>

      <Box className="pt-2 border-t border-border/50">
        <Flex className="items-center justify-end">
          {lead.lastInteractionAt ? (
            <Flex className="items-center gap-1 text-[9px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              Last contact: {format(new Date(lead.lastInteractionAt), "MMM d")}
            </Flex>
          ) : (
            <span className="text-[9px] text-muted-foreground italic">Awaiting contact</span>
          )}
        </Flex>
      </Box>
    </Box>
  );
};
