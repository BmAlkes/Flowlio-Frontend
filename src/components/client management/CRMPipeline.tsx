import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { useUpdateLeadStatus } from "@/hooks/useCRM";
import { PipelineColumn } from "./PipelineColumn";
import { LeadCard } from "./LeadCard";
import { useFetchClients } from "@/hooks/usefetchclients";
import { Loader2 } from "lucide-react";

const STAGES = [
  "New Lead",
  "In Negotiation",
  "Contract Signed",
  "Project In Progress",
  "Completed",
  "Inactive Client",
];

export const CRMPipeline = () => {
  const { data: clientsData, isLoading } = useFetchClients();
  const updateStatus = useUpdateLeadStatus();
  
  const [columns, setColumns] = useState<Record<string, any[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeContainer, setActiveContainer] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (clientsData?.data) {
      const grouped = STAGES.reduce((acc, stage) => {
        acc[stage] = clientsData.data.filter((c: any) => c.status === stage)
          .sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        return acc;
      }, {} as Record<string, any[]>);
      
      // Also catch any clients with unexpected statuses
      const otherClients = clientsData.data.filter((c: any) => !STAGES.includes(c.status));
      if (otherClients.length > 0) {
        grouped["Other"] = otherClients;
      }
      
      setColumns(grouped);
    }
  }, [clientsData]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveContainer(findContainer(active.id as string) || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findContainer(activeId);
    const overCol = overId in columns ? overId : findContainer(overId);

    if (!activeCol || !overCol || activeCol === overCol) {
      return;
    }

    setColumns((prev) => {
      const activeItems = prev[activeCol];
      const overItems = prev[overCol];

      const activeIndex = activeItems.findIndex((item) => item.id === activeId);
      const overIndex = overId in columns ? overItems.length : overItems.findIndex((item) => item.id === overId);

      return {
        ...prev,
        [activeCol]: activeItems.filter((item) => item.id !== activeId),
        [overCol]: [
          ...overItems.slice(0, overIndex),
          activeItems[activeIndex],
          ...overItems.slice(overIndex),
        ],
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveContainer(null);
      return;
    }

    const activeId = active.id as string;

    const currentContainer = findContainer(activeId);
    
    if (activeContainer && currentContainer) {
      const activeItems = columns[currentContainer];
      const activeIndex = activeItems.findIndex((item) => item.id === activeId);

      if (activeContainer !== currentContainer) {
        // Trigger API update for status change
        updateStatus.mutate({
          clientId: activeId,
          newStatus: currentContainer,
          oldStatus: activeContainer,
          newPosition: activeIndex
        });
      }
    }

    setActiveId(null);
    setActiveContainer(null);
  };

  const findContainer = (id: string) => {
    if (id in columns) return id;
    return Object.keys(columns).find((key) => columns[key].find((item) => item.id === id));
  };

  if (isLoading) {
    return (
      <Flex className="h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </Flex>
    );
  }

  const activeClient = activeId 
    ? Object.values(columns).flat().find(c => c.id === activeId)
    : null;

  return (
    <Box className="h-full overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Flex className="gap-4 min-w-max h-full items-start px-2">
          {Object.keys(columns).map((id) => (
            <PipelineColumn id={id} key={id} title={id} items={columns[id]} />
          ))}
        </Flex>

        <DragOverlay>
          {activeId && activeClient ? (
            <LeadCard lead={activeClient} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
};
