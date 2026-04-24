# Proposal: Automatic Task Creation on Project Status Change

This document outlines the best architecture for implementing automatic task creation when a project's status changes in **Flowlio**.

---

## 1. The "Best Way": Backend Automation (Event-Driven)

The most robust way to handle this is on the **Backend**. This ensures that tasks are created regardless of how the status update was triggered (via UI, API, or automated script).

### Architecture Idea:

- **Backend Trigger**: Add a "post-update" hook or a database trigger in the project service.
- **Logic**: When a project update occurs, compare the `old_status` with the `new_status`.
- **Task Generation**: If the status moves from `pending` -> `ongoing`, trigger a service that reads a "Task Template" and inserts multiple records into the `tasks` table.

**Pros:**

- **Reliable**: No risk of tasks not being created if a user's browser closes or internet hangs.
- **Centralized**: One place to manage the logic.
- **Performant**: Backend can perform bulk inserts in a single transaction.

---

## 2. The "Quick Way": Frontend Success Hook

If you want to implement this immediately within the existing frontend code (`flowlio-fe`), you can leverage the **TanStack Query** `onSuccess` callback.

### Implementation Steps:

1. **Define Templates**: Create a utility file (e.g., `src/utils/projectTemplates.ts`) mapping statuses to sets of tasks.
2. **Modify `useUpdateProject.ts`**:
   - In the `onSuccess` function:
     ```typescript
     onSuccess: (updatedProject) => {
       if (updatedProject.data.status === "ongoing") {
         // Loop through default tasks and call useCreateTask
         defaultTasks.forEach((task) =>
           createTask({ ...task, projectId: updatedProject.data.id }),
         );
       }
     };
     ```

**Pros:**

- Fast to implement without backend access.
- Direct feedback in the UI for the user.

---

## 3. Recommended Approach: Hybrid Pattern

I recommend a **Hybrid Approach**:

1.  **Project Templates**: Introduce a system where users can define "Project Templates" in the UI.
2.  **API Endpoint**: Create a single "Bulk Task Creation" endpoint on the backend (e.g., `/tasks/bulk-create`).
3.  **Automation Rule**: When the project status changes, the frontend or backend calls this bulk endpoint with the project ID and template ID.

### Summary

To get this done efficiently, we should focus on **Backend side-effects**. If you change the status to `ongoing`, the backend should automatically spin up the required tasks for that project type. This keeps the application "lean and smart."

Would you like me to start implementing the **Frontend Hook** logic as a first step, or shall we refine the **Backend logic** if we have access to it?
