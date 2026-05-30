import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { LeadCard } from "./LeadCard";
import { DollarSign } from "lucide-react";

interface PipelineColumnProps {
  id: string;
  title: string;
  items: any[];
  onCardClick: (client: any) => void;
}

export const PipelineColumn = ({ id, title, items, onCardClick }: PipelineColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New Lead": return "bg-blue-500";
      case "Contacted": return "bg-violet-500";
      case "Qualified": return "bg-yellow-400";
      case "Proposal Sent": return "bg-amber-500";
      case "Contract Signed": return "bg-emerald-500";
      case "Project In Progress": return "bg-indigo-500";
      case "Completed": return "bg-green-500";
      case "Inactive": return "bg-gray-400";
      case "Lost": return "bg-rose-500";
      default: return "bg-gray-400";
    }
  };

  const totalValue = items.reduce((acc, item) => acc + (Number(item.leadValue) || 0), 0);

  const formatValue = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <Box
      className={`
        w-72 flex-shrink-0 rounded-2xl border flex flex-col max-h-[calc(100vh-220px)]
        transition-colors duration-150
        ${isOver
          ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50/60 dark:bg-indigo-900/10"
          : "border-border/40 bg-gray-50/60 dark:bg-gray-900/30"
        }
      `}
    >
      {/* Column header */}
      <Box className="px-4 pt-4 pb-3">
        <Flex className="items-center justify-between mb-2">
          <Flex className="items-center gap-2 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(title)}`} />
            <h3 className="font-semibold text-sm text-foreground/90 truncate">{title}</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-border/50 font-bold text-muted-foreground">
              {items.length}
            </span>
          </Flex>
        </Flex>

        <Flex className="items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 border border-border/40">
            <DollarSign className="h-2.5 w-2.5 text-emerald-600" />
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {formatValue(totalValue)}
            </span>
          </div>
          <div className="h-0.5 flex-1 bg-gray-200/60 dark:bg-gray-700/60 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatusColor(title)} opacity-50 transition-all duration-500`}
              style={{ width: `${Math.min((items.length / 10) * 100, 100)}%` }}
            />
          </div>
        </Flex>
      </Box>

      {/* Cards */}
      <Box
        ref={setNodeRef}
        className="flex-1 px-3 pb-4 overflow-y-auto min-h-[140px] space-y-2.5 custom-scrollbar"
      >
        <SortableContext
          id={id}
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <LeadCard
              key={item.id}
              lead={item}
              onCardClick={() => onCardClick(item)}
            />
          ))}

          {items.length === 0 && (
            <div className={`h-20 border-2 border-dashed rounded-xl flex items-center justify-center transition-colors duration-150 ${
              isOver
                ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50/40 dark:bg-indigo-900/10"
                : "border-border/30"
            }`}>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/30">
                Drop here
              </span>
            </div>
          )}
        </SortableContext>
      </Box>
    </Box>
  );
};
