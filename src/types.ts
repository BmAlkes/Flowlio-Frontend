import type { Role } from "./providers/user.provider";

// Admin Support Ticket Request (for super admin)
export interface CreateSupportTicketRequest {
  subject: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  client: string;
  assignedto: string;
}

// User Support Ticket Request (for regular users)
export interface CreateUserSupportTicketRequest {
  subject: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  client?: string;
  assignedTo: string;
}

// Base SupportTicket interface (without relations)
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "open" | "closed";
  submittedby: string; // User ID
  submittedbyName: string; // User name
  submittedbyRole: string; // User role
  client: string;
  assignedto: string; // Assignee name (not user ID)
  createdon: Date;
  updatedAt: Date;
  // Optional user details for enriched responses
  assignedToUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  submittedByUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// API Response type for support tickets
export interface GetSupportTicketsResponse extends Partial<ApiResponse> {
  data: SupportTicket[];
}

// User Support Ticket Response Types
export interface UserSupportTicketResponse extends Partial<ApiResponse> {
  data: SupportTicket;
}

export interface UserSupportTicketsResponse extends Partial<ApiResponse> {
  data: {
    tickets: SupportTicket[];
    summary: {
      totalTickets: number;
      openTickets: number;
      closedTickets: number;
      highPriority: number;
      mediumPriority: number;
      lowPriority: number;
    };
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

export interface UserRecentTicketsResponse extends Partial<ApiResponse> {
  data: {
    submittedTickets: SupportTicket[];
    assignedTickets: SupportTicket[];
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    summary: {
      totalSubmitted: number;
      totalAssigned: number;
      openSubmitted: number;
      openAssigned: number;
    };
  };
}

export interface PlanFeature {
  maxUsers: number;
  maxProjects: number;
  maxStorage: number;
  maxTasks: number;
  aiAssist: boolean;
  prioritySupport: boolean;
  calendarAccess?: boolean;
  taskManagement?: boolean;
  timeTracking?: boolean;
  customFeatures?: string[];
  [key: string]: any;
}
export type ProjectComment = {
  projectId: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Task related types
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "updated"
  | "delay"
  | "changes";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  endDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
  // Project data
  projectId: string;
  projectName: string;
  projectNumber: string;
  // Assignee data
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  assigneeImage?: string;
  // Creator data
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  // Client data
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientImage?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  attachments?: Array<{
    id: string;
    file: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}

export type IPlan<T = {}> = {
  id: string;
  name: string;
  slug?: string;
  description: string;
  customPlanName?: string | null; // Custom display name
  createdAt: Date;
  updatedAt: Date;
  price: number;
  currency?: string;
  billingCycle?: "days" | "monthly" | "yearly";
  durationValue?: number | null;
  durationType?: "days" | "monthly" | "yearly" | null;
  trialDays?: number | null; // Number of trial days (0 = no trial, null = default 7)
  features: PlanFeature;
  isActive?: boolean;
  sortOrder?: number;
} & T;

export type ISubAdmin<T = {}> = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  permission: "Active" | "Deactivated";
  password: string;
  logo?: string | null;
  logoPublicId?: string | null;
  status: "active" | "inactive" | "suspended";
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
} & T;

export type IUser<T = {}> = {
  id: string;
  role: Role;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  phone: string;
  address: string;
  image: string | null;
  banned: boolean | null;
  emailVerified: boolean;
  banExpires: Date | null;
  banReason: string | null;
  companyId: string | null;
  imagePublicId: string | null;
  twoFactorEnabled: boolean | null;
  canViewProjectHours: boolean | null;
  notificationPreferences: {
    paymentAlerts: boolean;
    invoiceReminders: boolean;
    projectActivityUpdates: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    [key: string]: any;
  } | null;
} & T;

export type INotification<T = {}> = {
  id: string;
  read: boolean;
  title: string;
  userId: string;
  updatedAt: Date;
  createdAt: Date;
  message: string;
  type: // tasks
  | "task_assigned"
    | "task_updated"
    | "task_completed"
    // issues
    | "issue_created"
    | "issue_updated"
    | "issue_resolved"
    // schedule
    | "schedule_created"
    | "schedule_approved"
    | "schedule_rejected"
    // comment
    | "comment_added"
    // project
    | "project_created"
    | "project_updated"
    // member
    | "member_added"
    | "member_removed"
    // global notifications by admin
    | "system_message"
    // sub admin notifications
    | "subadmin_created"
    | "subadmin_updated"
    | "subadmin_deleted";
} & T;

export type CreatePlanRequest = {
  name: string;
  description: string;
  price: number;
  slug?: string;
  customPlanName?: string | null; // Custom display name
  currency: string;
  billingCycle: string;
  durationValue?: number | null;
  durationType?: "days" | "monthly" | "yearly" | null;
  trialDays?: number | null; // Number of trial days (0 = no trial, null = default 7)
  features: PlanFeature;
  isActive: boolean;
  sortOrder: number;
};

// Sub Admin related types
export type SubAdminPermission = "Active" | "Deactivated";
export type SubAdminStatus = "active" | "inactive" | "suspended";
export type CreateSubAdminRequest = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  permission: SubAdminPermission;
  password: string;
  status?: SubAdminStatus;
};

export type UpdateSubAdminRequest = Partial<
  Omit<CreateSubAdminRequest, "password">
>;

export type SubAdminStats = {
  totalSubAdmins: number;
  permissionDistribution: Array<{
    permission: SubAdminPermission;
    count: number;
  }>;
  statusDistribution: Array<{
    status: SubAdminStatus;
    count: number;
  }>;
  recentSubAdmins: number;
};

export type SubAdminListResponse = {
  subAdmins: ISubAdmin[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Permission levels for different user types
export type PermissionLevel =
  | "superAdmin" // Full system access
  | "subAdmin"
  | "user";

// API Response types
export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
};
