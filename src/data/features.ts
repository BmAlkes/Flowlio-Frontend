export type FeatureCategory =
  | "All"
  | "Projects"
  | "CRM"
  | "Tasks"
  | "Time"
  | "Billing"
  | "AI"
  | "Client Portal"
  | "Reports";

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: Exclude<FeatureCategory, "All">;
  videoId: string;
  duration: string; // "M:SS"
  uploadDate: string; // ISO date
}

export const CATEGORIES: FeatureCategory[] = [
  "All",
  "Projects",
  "CRM",
  "Tasks",
  "Time",
  "Billing",
  "AI",
  "Client Portal",
  "Reports",
];

export const features: Feature[] = [
  {
    id: "create-project",
    title: "Create & Manage Projects",
    description: "Set up a project in seconds, assign team members, define milestones and track every phase from kick-off to delivery.",
    category: "Projects",
    videoId: "PROJECTS_VIDEO_1",
    duration: "1:45",
    uploadDate: "2024-11-01",
  },
  {
    id: "project-templates",
    title: "Project Templates",
    description: "Start from a battle-tested template and skip the setup overhead. Customise milestones, task lists and assignees in one click.",
    category: "Projects",
    videoId: "ilo5LVs3Yt8",
    duration: "1:20",
    uploadDate: "2024-11-05",
  },
  {
    id: "kanban-board",
    title: "Kanban & List Views",
    description: "Switch between Kanban board and list view without losing any context. Drag tasks across columns, bulk-edit and filter by assignee or deadline.",
    category: "Projects",
    videoId: "PROJECTS_VIDEO_3",
    duration: "2:10",
    uploadDate: "2024-11-10",
  },
  {
    id: "crm-contacts",
    title: "Contact & Client Management",
    description: "Store every client, lead and prospect in one searchable database. Add notes, files, tags and activity history to each contact.",
    category: "CRM",
    videoId: "CRM_VIDEO_1",
    duration: "1:55",
    uploadDate: "2024-11-12",
  },
  {
    id: "sales-pipeline",
    title: "Visual Sales Pipeline",
    description: "Drag deals through custom stages, set close-date targets and get a real-time total of your projected revenue at a glance.",
    category: "CRM",
    videoId: "CRM_VIDEO_2",
    duration: "2:00",
    uploadDate: "2024-11-15",
  },
  {
    id: "task-assignment",
    title: "Task Creation & Assignment",
    description: "Create tasks from any screen, assign them to teammates, add due dates, subtasks, attachments and watchers — all in under 30 seconds.",
    category: "Tasks",
    videoId: "TASKS_VIDEO_1",
    duration: "1:30",
    uploadDate: "2024-11-18",
  },
  {
    id: "recurring-tasks",
    title: "Recurring Tasks & Dependencies",
    description: "Automate repetitive work with recurring tasks and prevent bottlenecks by linking tasks so that one can only start when another finishes.",
    category: "Tasks",
    videoId: "TASKS_VIDEO_2",
    duration: "1:40",
    uploadDate: "2024-11-20",
  },
  {
    id: "time-tracking",
    title: "Time Tracking",
    description: "Start and stop a timer directly from any task, or log hours manually. Every second is captured and linked to the right project.",
    category: "Time",
    videoId: "TIME_VIDEO_1",
    duration: "1:25",
    uploadDate: "2024-11-22",
  },
  {
    id: "timesheets",
    title: "Team Timesheets",
    description: "See your whole team's hours in a weekly grid. Approve, reject or edit time entries before payroll or client billing runs.",
    category: "Time",
    videoId: "TIME_VIDEO_2",
    duration: "1:50",
    uploadDate: "2024-11-25",
  },
  {
    id: "invoice-creation",
    title: "Invoice Creation",
    description: "Turn tracked hours and approved quotes into a professional invoice in one click. Customise branding, add taxes and send directly by email.",
    category: "Billing",
    videoId: "BILLING_VIDEO_1",
    duration: "2:05",
    uploadDate: "2024-11-27",
  },
  {
    id: "payment-tracking",
    title: "Payment Tracking & Reminders",
    description: "Monitor outstanding invoices, mark payments received and auto-send reminder emails to overdue clients — no spreadsheet needed.",
    category: "Billing",
    videoId: "BILLING_VIDEO_2",
    duration: "1:35",
    uploadDate: "2024-12-01",
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    description: "Ask the AI to summarise a project's status, draft a client update email, suggest task priorities or generate a weekly report in seconds.",
    category: "AI",
    videoId: "AI_VIDEO_1",
    duration: "2:15",
    uploadDate: "2024-12-03",
  },
  {
    id: "ai-insights",
    title: "AI-Powered Insights",
    description: "The AI analyses your team's velocity, spots at-risk projects before they slip and surfaces actionable recommendations every Monday morning.",
    category: "AI",
    videoId: "AI_VIDEO_2",
    duration: "1:55",
    uploadDate: "2024-12-05",
  },
  {
    id: "client-portal",
    title: "Client Portal",
    description: "Give each client their own branded portal where they can view project progress, approve deliverables, download files and message your team.",
    category: "Client Portal",
    videoId: "PORTAL_VIDEO_1",
    duration: "2:20",
    uploadDate: "2024-12-08",
  },
  {
    id: "client-approvals",
    title: "Client Approvals & Feedback",
    description: "Share deliverables for review inside the portal. Clients leave timestamped comments, click Approve or Request Changes — no more email chains.",
    category: "Client Portal",
    videoId: "PORTAL_VIDEO_2",
    duration: "1:45",
    uploadDate: "2024-12-10",
  },
  {
    id: "reports-dashboard",
    title: "Reports Dashboard",
    description: "A single screen showing revenue, billable hours, project health and team utilisation — updated in real time so you always know where you stand.",
    category: "Reports",
    videoId: "REPORTS_VIDEO_1",
    duration: "2:00",
    uploadDate: "2024-12-12",
  },
  {
    id: "performance-reports",
    title: "Team Performance Reports",
    description: "Drill into individual and team-level metrics: on-time delivery rate, average task completion time, billable vs non-billable hour split.",
    category: "Reports",
    videoId: "REPORTS_VIDEO_2",
    duration: "1:50",
    uploadDate: "2024-12-15",
  },
];
