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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { useUpdateLeadStatus } from "@/hooks/useCRM";
import { PipelineColumn } from "@/components/client management/PipelineColumn";
import { LeadCard } from "@/components/client management/LeadCard";
import { ClientDetailSheet } from "@/components/client management/ClientDetailSheet";
import { useLeads } from "@/hooks/useLeads";
import { Loader2 } from "lucide-react";

const STAGES = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Contract Signed",
  "Project In Progress",
  "Completed",
  "Inactive",
  "Lost",
];

export const LeadsPipeline = () => {
  const { data: leadsData, isLoading } = useLeads();
  const updateStatus = useUpdateLeadStatus();

  const [columns, setColumns] = useState<Record<string, any[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeContainer, setActiveContainer] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (leadsData?.data) {
      const grouped = STAGES.reduce((acc, stage) => {
        acc[stage] = leadsData.data
          .filter((l: any) => l.status === stage)
          .sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        return acc;
      }, {} as Record<string, any[]>);

      const other = leadsData.data.filter((l: any) => !STAGES.includes(l.status));
      if (other.length > 0) grouped["Other"] = other;

      setColumns(grouped);
    }
  }, [leadsData]);

  const findContainer = (id: string) => {
    if (id in columns) return id;
    return Object.keys(columns).find((key) => columns[key].find((item) => item.id === id));
  };

  const handleCardClick = (lead: any) => {
    setSelectedLeadId(lead.id);
    setSheetOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveContainer(findContainer(event.active.id as string) || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItemId = active.id as string;
    const overId = over.id as string;
    const activeCol = findContainer(activeItemId);
    const overCol = overId in columns ? overId : findContainer(overId);

    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumns((prev) => {
      const activeItems = prev[activeCol];
      const overItems = prev[overCol];
      const activeIndex = activeItems.findIndex((item) => item.id === activeItemId);
      const overIndex =
        overId in columns
          ? overItems.length
          : overItems.findIndex((item) => item.id === overId);

      return {
        ...prev,
        [activeCol]: activeItems.filter((item) => item.id !== activeItemId),
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
    if (!over) { setActiveId(null); setActiveContainer(null); return; }

    const activeItemId = active.id as string;
    const currentContainer = findContainer(activeItemId);

    if (activeContainer && currentContainer && activeContainer !== currentContainer) {
      const activeIndex = columns[currentContainer].findIndex((item) => item.id === activeItemId);
      updateStatus.mutate({
        clientId: activeItemId,
        newStatus: currentContainer,
        oldStatus: activeContainer,
        newPosition: activeIndex,
      });
    }

    setActiveId(null);
    setActiveContainer(null);
  };

  if (isLoading) {
    return (
      <Flex className="h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </Flex>
    );
  }

  const activeItem = activeId ? Object.values(columns).flat().find((c) => c.id === activeId) : null;
  const selectedLead = selectedLeadId ? Object.values(columns).flat().find((c) => c.id === selectedLeadId) : null;

  return (
    <>
      <Box className="h-full overflow-x-auto pb-8 pt-2 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Flex className="gap-4 min-w-max h-full items-start px-4 pb-4">
            {Object.keys(columns).map((id) => (
              <PipelineColumn
                key={id}
                id={id}
                title={id}
                items={columns[id]}
                onCardClick={handleCardClick}
              />
            ))}
          </Flex>

          <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeId && activeItem ? <LeadCard lead={activeItem} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </Box>

      <ClientDetailSheet
        client={selectedLead ?? null}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        isLead
      />
    </>
  );
};
