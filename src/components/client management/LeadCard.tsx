import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DollarSign, Clock, GripVertical, Bell } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useLeadInsights } from "@/hooks/useCRM";
import { useTranslation } from "react-i18next";

interface LeadCardProps {
  lead: any;
  isOverlay?: boolean;
  onCardClick?: () => void;
}

const TEMP_DOT: Record<string, string> = {
  Hot: "bg-orange-500", Warm: "bg-amber-400", Cold: "bg-sky-500", Lost: "bg-gray-400",
};

const TEMP_BORDER: Record<string, string> = {
  Hot: "border-l-orange-400", Warm: "border-l-amber-400", Cold: "border-l-sky-400", Lost: "border-l-gray-400",
};

export const LeadCard = ({ lead, isOverlay, onCardClick }: LeadCardProps) => {
  const { t } = useTranslation();
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

  const initials = (lead.name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const formatValue = (val: any) => {
    if (!val || Number(val) === 0) return null;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(val));
  };

  const followUp = lead.followUpAt ? new Date(lead.followUpAt) : null;
  const followUpOverdue = followUp ? differenceInDays(new Date(), followUp) >= 0 : false;
  const followUpDays = followUp ? differenceInDays(followUp, new Date()) : null;

  const temp = insights?.temperature;
  const formattedValue = formatValue(lead.leadValue);
  const borderClass = temp ? TEMP_BORDER[temp] : "border-l-transparent";

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className={`
        relative bg-card rounded-lg border border-border/50 border-l-[3px] ${borderClass}
        group transition-all duration-150
        ${isOverlay ? "shadow-xl scale-[1.02] cursor-grabbing" : "hover:shadow-sm cursor-pointer"}
      `}
      {...attributes}
      onClick={onCardClick}
    >
      <div {...listeners} onClick={(e) => e.stopPropagation()} className="absolute top-2.5 end-2.5 p-0.5 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <GripVertical className="h-3 w-3 text-muted-foreground/30" />
      </div>

      <div className="p-3">
        <Flex className="items-center gap-2.5 mb-2">
          <Avatar className="h-7 w-7 rounded-lg shrink-0">
            <AvatarImage src={lead.image} />
            <AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-[10px] font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-foreground truncate">{lead.name}</h4>
            <p className="text-[11px] text-muted-foreground truncate">{lead.businessIndustry || "General"}</p>
          </div>
        </Flex>

        <Flex className="items-center justify-between mb-2">
          {temp ? (
            <Flex className="items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${TEMP_DOT[temp] ?? "bg-gray-400"}`} />
              <span className="text-[11px] font-medium text-muted-foreground">{temp}</span>
            </Flex>
          ) : <div />}
          {formattedValue ? (
            <Flex className="items-center gap-0.5">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">{formattedValue}</span>
            </Flex>
          ) : (
            <span className="text-[11px] text-muted-foreground/40">{t("pipeline.noValue")}</span>
          )}
        </Flex>

        <div className="pt-2 border-t border-border/30 flex items-center justify-between">
          {lead.lastInteractionAt ? (
            <Flex className="items-center gap-1 text-[11px] text-muted-foreground/60">
              <Clock className="h-2.5 w-2.5" />
              <span>{format(new Date(lead.lastInteractionAt), "MMM d")}</span>
            </Flex>
          ) : (
            <span className="text-[11px] text-muted-foreground/40">{t("pipeline.noContactYet")}</span>
          )}
          {followUp && (
            <Flex className={`items-center gap-1 text-[10px] font-medium ${followUpOverdue ? "text-rose-500" : "text-foreground"}`}>
              <Bell className="h-2.5 w-2.5" />
              <span>
                {followUpOverdue ? t("pipeline.followUpOverdue") : followUpDays === 0 ? t("pipeline.followUpToday") : t("pipeline.followUpInDays", { count: followUpDays ?? 0 })}
              </span>
            </Flex>
          )}
        </div>
      </div>
    </Box>
  );
};
