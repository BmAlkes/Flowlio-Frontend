# Drag-and-Drop Table Implementation Guide

## Overview

The drag-and-drop reordering system is now fully implemented for the Client Management table. This guide explains how to apply the same pattern to other tables like Projects and Leads.

## Architecture

The implementation uses a reusable pattern based on **dnd-kit** (already installed in the project):

### Components

1. **`DraggableTable`** (`src/components/reusable/draggabletable.tsx`)
   - Generic wrapper component that adds drag-and-drop functionality to any data table
   - Built on top of `ReusableTable` (existing component)
   - Automatically adds a drag handle column on the left

2. **`useBulkUpdateClientPositions`** (`src/hooks/useBulkUpdateClientPositions.ts`)
   - Hook for updating multiple records' positions via API
   - Makes a single PATCH request to update only affected records

3. **`ReusableTable`** Enhancement
   - Updated to detect and render sortable rows when used within `DraggableTable`
   - Uses `SortableRowWrapper` to integrate dnd-kit with table rows

## Features

### ✅ Implemented Features
- ✓ Drag handle icon (GripVertical from lucide-react) on the left of each row
- ✓ Smooth drag-and-drop with visual feedback (row highlight + blue background during drag)
- ✓ Automatic disabling when a sort column is active (sorting takes precedence)
- ✓ Efficient position updates: Only updates affected records in a single PATCH request
- ✓ Persistent order across page refresh
- ✓ Loading state during position updates
- ✓ Error handling with automatic refetch on failure

### Visual Feedback
- Gray drag handle icon - ready to drag
- Light blue row highlight when dragging
- Blue left border during drag operation
- Opacity change (50%) when dragging
- Handle becomes grayed out when sorting is active

## Current Implementation

### Client Management Table Structure

```typescript
export type Data = {
  id: string;
  status: string;
  email: string;
  // ... other fields
  position?: number; // Order field for drag-and-drop
};
```

### Usage in ClientManagementTable

```tsx
import { DraggableTable } from "../reusable/draggabletable";
import { useBulkUpdateClientPositions } from "@/hooks/useBulkUpdateClientPositions";

export const ClientManagementTable = () => {
  // ... existing code ...
  
  const { mutate: bulkUpdatePositions } = useBulkUpdateClientPositions();
  
  const handleReorderComplete = (
    reorderedClients: Data[],
    updates: Array<{ id: string; position: number }>
  ) => {
    bulkUpdatePositions(
      updates.map((update) => ({
        clientId: update.id,
        position: update.position,
      })),
      {
        onSuccess: () => {
          toast.success("Clients reordered successfully");
        },
        onError: (error) => {
          toast.error("Failed to reorder clients");
          refetch(); // Restore original order
        },
      }
    );
  };

  return (
    <DraggableTable
      data={tableData}
      columns={columns}
      onReorderComplete={handleReorderComplete}
      enablePaymentLinksCalender={true}
      dragHandleCell={true}
    />
  );
};
```

## How to Apply to Other Tables

### Step 1: Update Your Data Type

Add the `position` field to your data type:

```typescript
export type ProjectData = {
  id: string;
  name: string;
  // ... other fields
  position?: number; // Add this field
};
```

### Step 2: Create or Update the API Hook

If not already created, create a bulk update positions hook similar to `useBulkUpdateClientPositions.ts`:

```typescript
// src/hooks/useBulkUpdateProjectPositions.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export const useBulkUpdateProjectPositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Array<{ projectId: string; position: number }>
    ) => {
      const response = await axios.patch("/projects/reorder", { updates });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"], // Update with your actual query key
      });
    },
  });
};
```

### Step 3: Update Your Table Component

Replace `ReusableTable` with `DraggableTable`:

```typescript
// Before
<ReusableTable
  data={tableData}
  columns={columns}
/>

// After
import { DraggableTable } from "../reusable/draggabletable";
import { useBulkUpdateProjectPositions } from "@/hooks/useBulkUpdateProjectPositions";

const { mutate: bulkUpdatePositions } = useBulkUpdateProjectPositions();

const handleReorderComplete = (
  reorderedProjects: ProjectData[],
  updates: Array<{ id: string; position: number }>
) => {
  bulkUpdatePositions(
    updates.map((update) => ({
      projectId: update.id,
      position: update.position,
    })),
    {
      onSuccess: () => {
        toast.success("Projects reordered successfully");
      },
      onError: () => {
        toast.error("Failed to reorder projects");
        refetch();
      },
    }
  );
};

<DraggableTable
  data={tableData}
  columns={columns}
  onReorderComplete={handleReorderComplete}
  dragHandleCell={true}
/>
```

## API Requirements

### Expected Backend Endpoints

1. **PATCH /clients/reorder** (for Client Management)
   ```json
   Request body:
   {
     "updates": [
       { "clientId": "1", "position": 2 },
       { "clientId": "2", "position": 1 }
     ]
   }
   
   Response:
   {
     "success": true,
     "data": [
       { "id": "1", "position": 2 },
       { "id": "2", "position": 1 }
     ]
   }
   ```

2. **PATCH /projects/reorder** (for Projects table - to be implemented)
3. **PATCH /leads/reorder** (for Leads table - to be implemented)

**Backend Implementation Notes:**
- Only update positions for records in the updates array (not all records)
- Use database transaction to ensure consistency
- Return updated records with new positions
- Include proper error handling

## API Query Keys

Make sure to use consistent query keys when invalidating queries:

- Clients: `["organization-clients"]`
- Projects: Update according to your actual query key
- Leads: Update according to your actual query key

## Configuration Options

The `DraggableTable` component supports these props:

```typescript
interface DraggableTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  
  // Callbacks
  onReorder?: (items: TData[]) => void;
  onReorderComplete?: (
    items: TData[], 
    updates: Array<{ id: string; position: number }>
  ) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  
  // Configuration
  dragHandleCell?: boolean; // Show drag handle column (default: true)
  isReorderingDisabled?: boolean; // Disable all drag operations
  getItemId?: (item: TData) => string; // Custom ID extractor
  
  // Inherits all ReusableTableProps
  enableGlobalFilter?: boolean;
  enableSorting?: boolean;
  // ... and more
}
```

## Best Practices

1. **Disable during updates**: Set `isReorderingDisabled={isUpdatingPositions}` while API calls are in progress
2. **Show feedback**: Use toast messages to confirm successful reorder or error states
3. **Handle errors gracefully**: Call `refetch()` to restore original order on API failure
4. **Disable with active sorts**: Automatically disabled when sorting is active (built-in)
5. **Update position on create**: When adding new items, assign them the maximum position + 1

## Translation Keys

Add these to your i18n configuration:

```json
{
  "draggableTable": {
    "dragHandle": "Drag to reorder",
    "sortingActive": "Sorting is active"
  },
  "clientManagement": {
    "toastReordered": "Clients reordered successfully",
    "toastReorderFailed": "Failed to reorder clients"
  }
}
```

## Troubleshooting

### Drag handle appears but dragging doesn't work
- Ensure `dnd-kit` libraries are properly installed
- Check that ReusableTable is using the SortableRowWrapper
- Verify that the DndContext wraps the entire table

### Sorting and dragging both active
- This shouldn't happen by design - sorting disables drag automatically
- Check `defaultSorting` prop value
- Verify `isSortingActive` is being calculated correctly

### Position updates not persisting
- Verify backend is receiving the PATCH request
- Check API endpoint path matches what the hook is calling
- Ensure database position field is being updated
- Check query key invalidation is working

### Performance issues with large lists
- Use virtual scrolling if table has 1000+ rows
- Consider pagination
- Check that update calculations are efficient

## Future Enhancements

- [ ] Add animation when rows move
- [ ] Add keyboard shortcuts (arrow keys to reorder)
- [ ] Add undo/redo functionality
- [ ] Add multi-select drag for bulk operations
- [ ] Add drag-and-drop between different tables
- [ ] Add custom drop zones for categorization

## File Changes Summary

### New Files Created
- `src/hooks/useBulkUpdateClientPositions.ts` - Bulk position update hook
- `src/components/reusable/draggabletable.tsx` - Main DraggableTable component

### Modified Files
- `src/components/client management/clientmanagementtable.tsx` - Integrated DraggableTable
- `src/components/reusable/reusabletable.tsx` - Added sortable row support

### Dependencies
- `@dnd-kit/core` - Already installed
- `@dnd-kit/sortable` - Already installed
- `@dnd-kit/utilities` - Already installed
- `lucide-react` - Already installed (GripVertical icon)
