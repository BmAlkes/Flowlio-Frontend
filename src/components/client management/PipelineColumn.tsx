import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { LeadCard } from "./LeadCard";
import { DollarSign, MoreVertical, Plus } from "lucide-react";

interface PipelineColumnProps {
  id: string;
  title: string;
  items: any[];
}

export const PipelineColumn = ({ id, title, items }: PipelineColumnProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New Lead": return "bg-blue-500";
      case "In Negotiation": return "bg-amber-500";
      case "Contract Signed": return "bg-indigo-500";
      case "Project In Progress": return "bg-purple-500";
      case "Completed": return "bg-emerald-500";
      case "Inactive Client": return "bg-rose-500";
      default: return "bg-gray-500";
    }
  };

  const totalValue = items.reduce((acc, item) => acc + (Number(item.leadValue) || 0), 0);
  
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <Box className="w-80 flex-shrink-0 bg-gray-50/80 dark:bg-gray-900/40 rounded-2xl border border-border/40 h-full flex flex-col max-h-[calc(100vh-220px)] backdrop-blur-sm shadow-sm">
      <Box className="p-4 flex flex-col gap-2">
        <Flex className="items-center justify-between">
          <Flex className="items-center gap-2 min-w-0">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(title)} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
            <h3 className="font-bold text-sm truncate text-foreground/90">{title}</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-gray-800/80 border border-border/50 font-bold shadow-xs">
              {items.length}
            </span>
          </Flex>
          <Flex className="gap-1">
            <button className="p-1 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-md transition-colors">
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button className="p-1 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-md transition-colors">
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </Flex>
        </Flex>
        
        <Flex className="items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100/50 dark:border-emerald-500/20">
            <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              {formatValue(totalValue)}
            </span>
          </div>
          <div className="h-1 flex-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getStatusColor(title)} opacity-60 transition-all duration-500`} 
              style={{ width: `${Math.min((items.length / 10) * 100, 100)}%` }}
            />
          </div>
        </Flex>
      </Box>

      <Box
        ref={setNodeRef}
        className="flex-1 px-3 pb-4 overflow-y-auto min-h-[150px] space-y-3 custom-scrollbar"
      >
        <SortableContext
          id={id}
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <LeadCard key={item.id} lead={item} />
          ))}
          {items.length === 0 && (
            <div className="h-24 border-2 border-dashed border-border/30 rounded-xl flex items-center justify-center text-muted-foreground/30 text-[10px] uppercase tracking-wider font-bold">
              Drop here
            </div>
          )}
        </SortableContext>
      </Box>
    </Box>
  );
};
