import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DollarSign, Clock, TrendingUp, AlertCircle, GripVertical } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useLeadInsights } from "@/hooks/useCRM";

interface LeadCardProps {
  lead: any;
  isOverlay?: boolean;
  onCardClick?: () => void;
}

export const LeadCard = ({ lead, isOverlay, onCardClick }: LeadCardProps) => {
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
    opacity: isDragging ? 0.25 : 1,
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const formatValue = (val: any) => {
    if (!val) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const getTempStyles = (temp?: string) => {
    switch (temp) {
      case "Hot":
        return "bg-orange-50 text-orange-600 border-orange-200/80 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-500/20";
      case "Warm":
        return "bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-500/20";
      default:
        return "bg-sky-50 text-sky-600 border-sky-200/80 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-500/20";
    }
  };

  const showFollowUp =
    lead.lastInteractionAt &&
    differenceInDays(new Date(), new Date(lead.lastInteractionAt)) > 7;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className={`
        relative bg-white dark:bg-gray-900 rounded-xl border border-border/60 shadow-xs
        group transition-all duration-150
        ${isOverlay
          ? "shadow-2xl ring-2 ring-black/10 scale-[1.03] cursor-grabbing"
          : "hover:shadow-sm hover:border-border cursor-pointer"
        }
      `}
      {...attributes}
      onClick={onCardClick}
    >
      {/* Drag handle — only this triggers drag */}
      <div
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2.5 right-2.5 p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
      </div>

      <div className="p-3.5">
        {/* Top row */}
        <Flex className="items-start gap-2.5 mb-3 pr-5">
          <Avatar className="h-8 w-8 rounded-lg shrink-0">
            <AvatarImage src={lead.image} />
            <AvatarFallback className="rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
              {getInitials(lead.name || "UN")}
            </AvatarFallback>
          </Avatar>
          <Box className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-foreground truncate leading-snug">
              {lead.name}
            </h4>
            <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">
              {lead.businessIndustry || "General"}
            </p>
          </Box>
          {insights?.temperature && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold shrink-0 ${getTempStyles(insights.temperature)}`}>
              {insights.temperature.toUpperCase()}
            </span>
          )}
        </Flex>

        {/* Value + probability */}
        <Flex className="items-center justify-between mb-3">
          <Flex className="items-center gap-1">
            <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20">
              <DollarSign className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-foreground">
              {formatValue(lead.leadValue)}
            </span>
          </Flex>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <TrendingUp className="h-2.5 w-2.5 text-indigo-400" />
            <span>{lead.leadProbability || 0}%</span>
          </div>
        </Flex>

        {/* Footer */}
        <div className="pt-2.5 border-t border-border/40">
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
              <Flex className="items-center gap-1 text-[9px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5 opacity-50" />
                <span>{format(new Date(lead.lastInteractionAt), "MMM d")}</span>
              </Flex>
            ) : (
              <span className="text-[9px] text-muted-foreground/50 italic">No contact yet</span>
            )}
          </Flex>
        </div>
      </div>
    </Box>
  );
};
