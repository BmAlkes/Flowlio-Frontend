import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DollarSign, Clock, AlertCircle, GripVertical, Pin, Bell } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useLeadInsights } from "@/hooks/useCRM";

interface LeadCardProps {
  lead: any;
  isOverlay?: boolean;
  onCardClick?: () => void;
}

const TEMP_BORDER: Record<string, string> = {
  Hot: "border-l-orange-400",
  Warm: "border-l-amber-400",
  Cold: "border-l-sky-400",
  Lost: "border-l-gray-400",
};

const TEMP_BADGE: Record<string, string> = {
  Hot: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-500/20",
  Warm: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-500/20",
  Cold: "text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-900/20 dark:border-sky-500/20",
  Lost: "text-gray-600 bg-gray-100 border-gray-300 dark:text-gray-400 dark:bg-gray-800/40 dark:border-gray-600/40",
};

const TEMP_EMOJI: Record<string, string> = {
  Hot: "🔥",
  Warm: "🟠",
  Cold: "🔵",
  Lost: "⚫",
};

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
    opacity: isDragging ? 0.2 : 1,
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const formatValue = (val: any) => {
    if (!val || Number(val) === 0) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const showStaleAlert =
    lead.lastInteractionAt &&
    differenceInDays(new Date(), new Date(lead.lastInteractionAt)) > 7;

  const followUpDate = lead.followUpAt ? new Date(lead.followUpAt) : null;
  const followUpOverdue = followUpDate ? differenceInDays(new Date(), followUpDate) >= 0 : false;
  const followUpDaysLeft = followUpDate ? differenceInDays(followUpDate, new Date()) : null;

  const temp = insights?.temperature;
  const formattedValue = formatValue(lead.leadValue);
  const borderClass = temp ? TEMP_BORDER[temp] : "border-l-transparent";

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className={`
        relative bg-white dark:bg-gray-900 rounded-xl border border-border/50
        border-l-[3px] ${borderClass}
        group transition-all duration-150
        ${isOverlay
          ? "shadow-2xl ring-1 ring-black/8 scale-[1.03] cursor-grabbing rotate-[0.5deg]"
          : "hover:shadow-md hover:-translate-y-px cursor-pointer"
        }
      `}
      {...attributes}
      onClick={onCardClick}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 right-3 p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30" />
      </div>

      <div className="p-3.5 pr-8">
        {/* Top */}
        <Flex className="items-start gap-3 mb-3">
          <Avatar className="h-9 w-9 rounded-xl shrink-0">
            <AvatarImage src={lead.image} />
            <AvatarFallback className="rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold">
              {getInitials(lead.name || "UN")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="text-[14px] font-semibold text-foreground truncate leading-tight">
              {lead.name}
            </h4>
            <p className="text-[12px] text-muted-foreground/70 truncate mt-0.5 leading-tight">
              {lead.businessIndustry || "General"}
            </p>
          </div>
        </Flex>

        {/* Temperature + value row */}
        <Flex className="items-center justify-between mb-3">
          {temp && TEMP_BADGE[temp] ? (
            <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${TEMP_BADGE[temp]}`}>
              {insights?.isManualTemperature && <Pin className="h-2 w-2 shrink-0" />}
              <span>{TEMP_EMOJI[temp]}</span>
              <span>{temp}</span>
            </div>
          ) : (
            <div />
          )}

          {formattedValue ? (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[13px] font-bold text-foreground">{formattedValue}</span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground/55 font-medium">No value</span>
          )}
        </Flex>

        {/* Footer */}
        <div className="pt-2.5 border-t border-border/30 space-y-1.5">
          <Flex className="items-center justify-between">
            {showStaleAlert ? (
              <Flex className="items-center gap-1 text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                <AlertCircle className="h-2.5 w-2.5" />
                <span>Follow up</span>
              </Flex>
            ) : (
              <div />
            )}
            {lead.lastInteractionAt ? (
              <Flex className="items-center gap-1 text-[11px] text-muted-foreground/60">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(lead.lastInteractionAt), "MMM d")}</span>
              </Flex>
            ) : (
              <span className="text-[11px] text-muted-foreground/50">No contact yet</span>
            )}
          </Flex>

          {followUpDate && (
            <Flex className={`items-center gap-1 text-[10px] font-semibold ${followUpOverdue ? "text-rose-500" : "text-indigo-500"}`}>
              <Bell className="h-2.5 w-2.5 shrink-0" />
              <span>
                {followUpOverdue
                  ? "Follow-up vencido"
                  : followUpDaysLeft === 0
                  ? "Follow-up hoje"
                  : `Follow-up em ${followUpDaysLeft}d`}
              </span>
            </Flex>
          )}
        </div>
      </div>
    </Box>
  );
};
