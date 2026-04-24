import React, { useState, useCallback, useMemo, ReactNode } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ColumnDef } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import { Box } from "@/components/ui/box";
import { ReusableTable, ReusableTableProps } from "./reusabletable";
import { useTranslation } from "react-i18next";
import { TableRow, TableCell } from "@/components/ui/table";

interface SortableRowProps {
  id: string;
  isDragging?: boolean;
  isSortingActive?: boolean;
  showDragHandle?: boolean;
  dragHandleContent?: ReactNode;
  children: ReactNode;
}

// Sortable Row Wrapper Component
const SortableRowWrapper = React.forwardRef<
  HTMLTableRowElement,
  SortableRowProps
>(
  (
    {
      id,
      isDragging,
      isSortingActive,
      showDragHandle,
      dragHandleContent,
      children,
    },
    _ref
  ) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
      useSortable({
        id,
        disabled: isSortingActive,
      });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isSortableDragging ? 0.5 : 1,
    };

    return (
      <TableRow
        ref={setNodeRef}
        style={style}
        data-state={isDragging && "selected"}
        className={`${isSortableDragging ? "bg-blue-50 border-l-2 border-blue-400" : ""} transition-colors ${!isSortingActive ? "cursor-grab" : ""}`}
        {...attributes}
        {...listeners}
      >
        {showDragHandle && (
          <TableCell className="w-12 px-2 py-1">
            <Box
              className={`flex items-center justify-center ${
                isSortingActive ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
              }`}
            >
              {dragHandleContent}
            </Box>
          </TableCell>
        )}
        {children}
      </TableRow>
    );
  }
);

SortableRowWrapper.displayName = "SortableRowWrapper";

export interface DraggableTableProps<TData extends { id: string }>
  extends Omit<ReusableTableProps<TData>, "columns" | "data"> {
  data: TData[];
  columns: ColumnDef<TData>[];
  onReorder?: (items: TData[]) => void;
  onReorderComplete?: (
    items: TData[],
    updates: Array<{ id: string; position: number }>
  ) => void;
  getItemId?: (item: TData) => string;
  isReorderingDisabled?: boolean;
  dragHandleCell?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

// Main DraggableTable Component
export const DraggableTable = React.forwardRef<
  HTMLDivElement,
  DraggableTableProps<any>
>(
  (
    {
      data,
      columns,
      onReorder,
      onReorderComplete,
      getItemId,
      isReorderingDisabled = false,
      dragHandleCell = true,
      defaultSorting,
      onDragStart: onExternalDragStart,
      onDragEnd: onExternalDragEnd,
      meta,
      ...restProps
    },
    _ref
  ) => {
    const { t } = useTranslation();
    const [localData, setLocalData] = useState(data);

    // Update local data when external data changes
    React.useEffect(() => {
      setLocalData(data);
    }, [data]);

    const getIdFromItem = useCallback(
      (item: any) => {
        return getItemId ? getItemId(item) : item.id;
      },
      [getItemId]
    );

    // Memoize the items array with IDs for dnd-kit
    const items = useMemo(
      () => localData.map((item) => getIdFromItem(item)),
      [localData, getIdFromItem]
    );

    // Check if sorting is active (visual indicator for disabling reorder)
    const isSortingActive = (defaultSorting?.length ?? 0) > 0;
    const shouldDisableDrag = isReorderingDisabled || isSortingActive;

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8, // Minimum distance to trigger drag
        },
      })
    );

    const handleDragStart = (_event: DragStartEvent) => {
      if (!shouldDisableDrag) {
        onExternalDragStart?.();
      }
    };

    const handleDragEnd = (event: DragEndEvent) => {
      onExternalDragEnd?.();

      const { active, over } = event;

      if (!over || active.id === over.id || shouldDisableDrag) {
        return;
      }

      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Reorder local data
      const newData = arrayMove([...localData], oldIndex, newIndex);
      setLocalData(newData);

      // Notify parent of reorder
      if (onReorder) {
        onReorder(newData);
      }

      // Calculate position updates for affected items only
      if (onReorderComplete) {
        const affectedIndices = [
          Math.min(oldIndex, newIndex),
          Math.max(oldIndex, newIndex),
        ];

        const updates = newData
          .slice(affectedIndices[0], affectedIndices[1] + 1)
          .map((item, index) => ({
            id: getIdFromItem(item),
            position: affectedIndices[0] + index,
          }));

        onReorderComplete(newData, updates);
      }
    };

    // Add drag handle column if enabled
    const columnsWithDragHandle: ColumnDef<any>[] = dragHandleCell
      ? [
          {
            id: "drag-handle",
            header: () => null,
            cell: () => (
              <Box
                className={`flex items-center justify-center px-1 ${
                  shouldDisableDrag ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
                }`}
                title={
                  shouldDisableDrag
                    ? t("draggableTable.sortingActive", { defaultValue: "Sorting is active" })
                    : t("draggableTable.dragHandle", { defaultValue: "Drag to reorder" })
                }
              >
                <GripVertical
                  className={`w-5 h-5 ${
                    shouldDisableDrag
                      ? "text-gray-300"
                      : "text-muted-foreground hover:text-muted-foreground"
                  }`}
                />
              </Box>
            ),
            size: 40,
            enableSorting: false,
            enableHiding: false,
          },
          ...columns,
        ]
      : columns;

    // Enhanced meta with sortable context
    const enhancedMeta = {
      ...meta,
      sortableContext: {
        items,
        strategy: verticalListSortingStrategy,
        disabled: shouldDisableDrag,
      },
      isSortingActive,
      shouldDisableDrag,
      SortableRowWrapper,
    };

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items}
          strategy={verticalListSortingStrategy}
          disabled={shouldDisableDrag}
        >
          <ReusableTable
            {...restProps}
            data={localData}
            columns={columnsWithDragHandle}
            defaultSorting={defaultSorting}
            meta={enhancedMeta}
          />
        </SortableContext>
      </DndContext>
    );
  }
);

DraggableTable.displayName = "DraggableTable";
