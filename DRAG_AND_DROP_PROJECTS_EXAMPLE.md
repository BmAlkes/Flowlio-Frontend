# Implementation Example: Adding Drag-and-Drop to Projects Table

## Quick Start

Follow these steps to add drag-and-drop reordering to the Projects table:

### Step 1: Update Your Data Type

```typescript
// In your projects component or types file
export type Project = {
  id: string;
  name: string;
  status: string;
  description?: string;
  // ... other fields ...
  position?: number; // ← Add this field for drag-and-drop ordering
};
```

### Step 2: Import Dependencies

```typescript
import { DraggableTable } from "../reusable/draggabletable";
import { useBulkUpdateProjectPositions } from "@/hooks/useBulkUpdateProjectPositions";
import { toast } from "sonner";
```

### Step 3: Transform API Data

Ensure your API response or data transformation includes the position field:

```typescript
const tableData = projectsData?.map((project: any) => ({
  id: project.id,
  name: project.name,
  status: project.status,
  // ... other fields ...
  position: project.position || 0, // Ensure position is included
})) || [];
```

### Step 4: Add the Reorder Handler

```typescript
export const ProjectsTable = () => {
  const { mutate: bulkUpdatePositions, isPending: isUpdatingPositions } =
    useBulkUpdateProjectPositions();

  const handleReorderComplete = (
    reorderedProjects: Project[],
    updates: Array<{ id: string; position: number }>
  ) => {
    // Update positions via API
    bulkUpdatePositions(
      updates.map((update) => ({
        projectId: update.id,
        position: update.position,
      })),
      {
        onSuccess: () => {
          toast.success(t("projectManagement.toastReordered"));
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error ||
            t("projectManagement.toastReorderFailed")
          );
          refetch(); // Restore original order
        },
      }
    );
  };

  return (
    <DraggableTable
      data={tableData}
      columns={columns}
      enablePaymentLinksCalender={true}
      enableGlobalFilter={true}
      onReorderComplete={handleReorderComplete}
      isReorderingDisabled={isUpdatingPositions}
      dragHandleCell={true}
    />
  );
};
```

## Complete Example Component

```typescript
import { ColumnDef } from "@tanstack/react-table";
import { DraggableTable } from "../reusable/draggabletable";
import { useBulkUpdateProjectPositions } from "@/hooks/useBulkUpdateProjectPositions";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState } from "react";

export type Project = {
  id: string;
  name: string;
  status: string;
  position?: number;
};

export const ProjectsTable = () => {
  const { t } = useTranslation();
  const { mutate: bulkUpdatePositions, isPending: isUpdatingPositions } =
    useBulkUpdateProjectPositions();

  // Your existing hooks for fetching data
  const { data: projectsData, refetch } = useFetchProjects();

  // Define columns (existing code)
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: "Project Name",
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <span>{row.original.status}</span>,
    },
    // ... more columns ...
  ];

  // Handle reorder
  const handleReorderComplete = (
    reorderedProjects: Project[],
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
          refetch();
        },
        onError: () => {
          toast.error("Failed to reorder projects");
          refetch(); // Restore original order
        },
      }
    );
  };

  // Transform data to include position
  const tableData = projectsData?.map((project: any) => ({
    id: project.id,
    name: project.name,
    status: project.status,
    position: project.position || 0,
  })) || [];

  return (
    <DraggableTable
      data={tableData}
      columns={columns}
      enablePaymentLinksCalender={true}
      enableGlobalFilter={true}
      onReorderComplete={handleReorderComplete}
      isReorderingDisabled={isUpdatingPositions}
      dragHandleCell={true}
    />
  );
};
```

## What Changes Are Made Automatically

When you use `DraggableTable`:

1. ✅ A drag handle column is automatically added to the left
2. ✅ Drag-and-drop functionality is enabled
3. ✅ Visual feedback is provided during drag operations
4. ✅ Dragging is automatically disabled when sorting is active
5. ✅ Only affected rows are updated when position changes
6. ✅ A single PATCH request is made to the API

## Testing the Implementation

### Manual Testing Checklist
- [ ] Can drag rows up/down without errors
- [ ] Visual feedback appears (blue highlight, left border)
- [ ] Drag handle cursor shows (grab/grabbing)
- [ ] Position updates persist after page refresh
- [ ] Dragging is disabled when a sort column is active
- [ ] Error toast shows if API call fails
- [ ] Original order is restored on error

### API Response Verification
Check your Network tab in DevTools to verify:
1. PATCH request is sent to `/projects/reorder`
2. Only affected rows are in the request body
3. Response includes updated positions
4. All rows with new positions are returned

## Backend Integration

Your backend should implement:

```javascript
// Example Node.js/Express endpoint
app.patch("/projects/reorder", async (req, res) => {
  try {
    const { updates } = req.body;

    // Start transaction
    const results = [];
    for (const update of updates) {
      const project = await Project.updateOne(
        { _id: update.projectId },
        { position: update.position }
      );
      results.push({ id: update.projectId, position: update.position });
    }

    res.json({
      success: true,
      message: "Projects reordered successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
```

## Common Issues & Solutions

### Issue: Drag handle appears but can't drag
**Solution:** 
- Verify `@dnd-kit/sortable` is installed
- Check that ReusableTable is rendering TableCell components
- Ensure SortableContext is wrapping the table

### Issue: Sorting and dragging both work (shouldn't happen)
**Solution:**
- This is actually a feature - dragging is automatically disabled when sorting
- If both work simultaneously, check that `isSortingActive` is being calculated correctly

### Issue: Position changes aren't saved
**Solution:**
- Verify position field is being sent in PATCH request
- Check backend is updating the position field
- Ensure query key invalidation matches your actual query key
- Verify error handling isn't silently failing

### Issue: Only some rows update, not all affected rows
**Solution:**
- This is by design - calculations update only affected range
- If not seeing expected behavior, check `updates` array in onReorderComplete

## Tips & Tricks

1. **Auto-assign positions on create:**
   ```typescript
   const newProject = {
     ...projectData,
     position: (tableData.length),
   };
   ```

2. **Sort by position on first load:**
   ```typescript
   const sortedData = tableData.sort((a, b) => 
     (a.position || 0) - (b.position || 0)
   );
   ```

3. **Disable dragging conditionally:**
   ```typescript
   isReorderingDisabled={isUpdatingPositions || userRole === "viewer"}
   ```

4. **Custom drag handle:**
   - Modify the drag handle cell in `DraggableTable` component
   - Use different icon: `import { Bars, EllipsisVertical } from "lucide-react"`

## Performance Optimization

For tables with 500+ rows:

1. Use virtual scrolling (react-window)
2. Implement pagination
3. Consider debouncing drag updates
4. Use React.memo for row components

```typescript
// Example: Debounce updates
import { debounce } from "lodash";

const debouncedUpdate = debounce((updates) => {
  bulkUpdatePositions(updates);
}, 300);

const handleReorderComplete = (reorderedData, updates) => {
  debouncedUpdate(updates);
};
```

## Next Steps

1. Update your data type with `position` field
2. Ensure backend has position field in database
3. Create/implement PATCH endpoint for bulk position updates
4. Replace `ReusableTable` with `DraggableTable`
5. Add reorder handler and connect to API
6. Test the implementation
7. Gather feedback and iterate

## Support

For questions or issues:
1. Check [DRAG_AND_DROP_GUIDE.md](./DRAG_AND_DROP_GUIDE.md)
2. Review the ClientManagementTable implementation
3. Check browser console for error messages
4. Verify network requests in DevTools
