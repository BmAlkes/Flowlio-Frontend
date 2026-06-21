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
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { useUpdateLeadStatus } from "@/hooks/useCRM";
import { PipelineColumn } from "./PipelineColumn";
import { LeadCard } from "./LeadCard";
import { ClientDetailSheet } from "./ClientDetailSheet";
import { useFetchClients } from "@/hooks/usefetchclients";
import { Loader2 } from "lucide-react";

const STAGES = [
  "Active",
  "Onboarding",
  "On Hold",
  "Inactive",
  "Completed",
  "Churned",
];

export const CRMPipeline = () => {
  const { data: clientsData, isLoading } = useFetchClients();
  const updateStatus = useUpdateLeadStatus();

  const [columns, setColumns] = useState<Record<string, any[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeContainer, setActiveContainer] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (clientsData?.data) {
      const grouped = STAGES.reduce((acc, stage) => {
        acc[stage] = clientsData.data
          .filter((c: any) => c.status === stage)
          .sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        return acc;
      }, {} as Record<string, any[]>);

      const otherClients = clientsData.data.filter((c: any) => !STAGES.includes(c.status));
      if (otherClients.length > 0) {
        grouped["Other"] = otherClients;
      }

      setColumns(grouped);
    }
  }, [clientsData]);

  const handleCardClick = (client: any) => {
    setSelectedClientId(client.id);
    setSheetOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveContainer(findContainer(active.id as string) || null);
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

    if (!over) {
      setActiveId(null);
      setActiveContainer(null);
      return;
    }

    const activeItemId = active.id as string;
    const currentContainer = findContainer(activeItemId);

    if (activeContainer && currentContainer && activeContainer !== currentContainer) {
      const activeItems = columns[currentContainer];
      const activeIndex = activeItems.findIndex((item) => item.id === activeItemId);
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

  const findContainer = (id: string) => {
    if (id in columns) return id;
    return Object.keys(columns).find((key) =>
      columns[key].find((item) => item.id === id)
    );
  };

  if (isLoading) {
    return (
      <Flex className="h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </Flex>
    );
  }

  const activeClient = activeId
    ? Object.values(columns).flat().find((c) => c.id === activeId)
    : null;

  const selectedClient = selectedClientId
    ? Object.values(columns).flat().find((c) => c.id === selectedClientId)
    : null;

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

          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {activeId && activeClient ? (
              <LeadCard lead={activeClient} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>

      <ClientDetailSheet
        client={selectedClient ?? null}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
};
