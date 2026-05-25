export interface UseCase {
  id: string;
  persona: string;
  icon: string; // lucide icon name
  videoId: string;
  duration: string;
  uploadDate: string;
  description: string;
  scenario: string;
  features: string[];
}

export const useCases: UseCase[] = [
  {
    id: "web-agency",
    persona: "Web & Digital Agencies",
    icon: "Monitor",
    videoId: "USECASE_AGENCY",
    duration: "3:10",
    uploadDate: "2024-12-18",
    description: "Digital agencies juggle dozens of active clients, campaigns and creative deliverables at once — often across different time zones and tools.",
    scenario:
      "A 12-person agency uses Flowlio to manage every client engagement from first contact to final invoice. New leads enter the CRM pipeline, convert into projects with template-based task lists, team members log time against each deliverable, the client reviews work in their branded portal and approves, and the invoice is generated automatically from tracked hours — all without leaving Flowlio. Monthly reports show profitability per client in seconds.",
    features: ["CRM Pipeline", "Project Templates", "Client Portal", "Time Tracking", "Invoicing"],
  },
  {
    id: "freelancer",
    persona: "Freelancers & Solo Consultants",
    icon: "Laptop",
    videoId: "USECASE_FREELANCER",
    duration: "2:45",
    uploadDate: "2024-12-19",
    description: "Freelancers need to wear every hat — salesperson, project manager, accountant — without drowning in admin work that takes time away from billable hours.",
    scenario:
      "A freelance UX designer uses Flowlio to track every prospect in the CRM, send proposals, manage active projects with task checklists, run a timer on every design session, share progress with clients via the portal and send branded invoices the moment a milestone is complete. The AI assistant drafts client update emails in seconds. At month-end, a revenue report shows exactly which clients and project types are most profitable.",
    features: ["CRM", "Task Management", "Time Tracking", "Client Portal", "Invoicing", "AI Assistant"],
  },
  {
    id: "service-company",
    persona: "Service Companies & Field Teams",
    icon: "Building2",
    videoId: "USECASE_SERVICE",
    duration: "2:55",
    uploadDate: "2024-12-20",
    description: "Service businesses with field or on-site teams need tight coordination between operations, sales and finance — across jobs, technicians and clients.",
    scenario:
      "A facilities management company with 30 technicians uses Flowlio to receive service requests via the CRM, convert them into projects with assigned technicians, track labour hours per job in real time via the mobile app, attach site photos and sign-off documents to tasks, generate invoices instantly when a job closes and report on technician utilisation per week. Managers see a live dashboard of every open job, overdue task and outstanding invoice in one view.",
    features: ["CRM", "Projects", "Time Tracking", "Reports", "Invoicing"],
  },
  {
    id: "marketing-agency",
    persona: "Marketing & Creative Agencies",
    icon: "Megaphone",
    videoId: "USECASE_MARKETING",
    duration: "3:00",
    uploadDate: "2024-12-21",
    description: "Marketing agencies run complex multi-channel campaigns for multiple brands simultaneously, requiring precise planning, creative review workflows and transparent client communication.",
    scenario:
      "A performance-marketing agency manages paid, SEO and content campaigns for 20 brands. Each campaign is a Flowlio project with a kanban board, content calendar tasks and a dedicated client portal. Creatives log time per campaign, clients approve ad copy and design assets without email, and the monthly retainer invoice pulls tracked hours and approved scope changes automatically. The AI generates campaign performance summaries the account manager pastes straight into the client call deck.",
    features: ["Projects", "Kanban Board", "Client Portal", "AI Assistant", "Billing"],
  },
  {
    id: "consulting-firm",
    persona: "Consulting & Advisory Firms",
    icon: "BriefcaseBusiness",
    videoId: "USECASE_CONSULTING",
    duration: "2:50",
    uploadDate: "2024-12-22",
    description: "Consulting firms sell expertise and time. Winning new engagements requires a tight CRM, while delivering them requires meticulous time tracking and clear client reporting.",
    scenario:
      "A strategy consultancy uses Flowlio's CRM to track opportunities from first meeting through proposal to signed contract. Signed engagements become projects with phased task lists and per-consultant hour budgets. Every billable hour is tracked and tagged to a project phase. The client receives weekly automated progress reports via the portal, and the partner reviews a profitability-per-engagement dashboard before billing. Year-end revenue and utilisation reports are exported in one click.",
    features: ["CRM", "Time Tracking", "Reports", "Client Portal", "Invoicing"],
  },
  {
    id: "design-studio",
    persona: "Design & Creative Studios",
    icon: "Palette",
    videoId: "USECASE_DESIGN",
    duration: "2:40",
    uploadDate: "2024-12-23",
    description: "Design studios live and die by creative feedback loops — the faster clients review and approve, the faster the studio can bill and move to the next project.",
    scenario:
      "A branding studio uses Flowlio to manage all active projects on a single kanban board. Designers attach mockups, presentations and style guides directly to tasks. Clients log into their portal, leave pinpoint feedback comments and click Approve when satisfied — replacing 20-email threads with a clean approval history. Time is tracked per design round, so the studio can prove scope creep and raise change orders backed by data. Invoices reference the approval log so clients never dispute a line item.",
    features: ["Client Portal", "Task Management", "Time Tracking", "Projects", "Invoicing"],
  },
];
