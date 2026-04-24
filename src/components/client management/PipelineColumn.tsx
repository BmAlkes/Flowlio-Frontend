import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { LeadCard } from "./LeadCard";

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
      case "New Lead": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Contacted": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "Qualified": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "Proposal Sent": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "Negotiation": return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
      case "Closed Won": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Closed Lost": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <Box className="w-80 flex-shrink-0 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border border-border/50 h-full flex flex-col max-h-[calc(100vh-250px)]">
      <Box className="p-3 border-b border-border/50">
        <Flex className="items-center justify-between mb-1">
          <h3 className="font-semibold text-sm truncate">{title}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(title)}`}>
            {items.length}
          </span>
        </Flex>
        {/* Progress bar or total value could go here */}
      </Box>

      <Box
        ref={setNodeRef}
        className="flex-1 p-2 overflow-y-auto min-h-[150px] space-y-3"
      >
        <SortableContext
          id={id}
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <LeadCard key={item.id} lead={item} />
          ))}
        </SortableContext>
      </Box>
    </Box>
  );
};
