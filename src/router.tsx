import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { LazyWrapper } from "./components/common/LazyWrapper";
import {
  ProtectedRoute,
  SuperAdminRoute,
  SubAdminRoute,
  ViewerRoute,
} from "./components/common/ProtectedRoute";
import {
  useSessionPersistence,
  useSessionRestoration,
} from "./hooks/useSessionPersistence";
import ViewerSettingsPage from "./pages/viewersettings.page";

// Lazy load all page components
const PasswordresetsucessPage = lazy(
  () => import("./pages/passwordresetsuccess.page")
);
const AuthenticationLayout = lazy(() =>
  import("./layouts/authentication.layout").then((module) => ({
    default: module.AuthenticationLayout,
  }))
);
const TaskManagementPage = lazy(() =>
  import("./pages/taskmanagement.page").then((module) => ({
    default: module.TaskManagementPage,
  }))
);
const DashboardLayout = lazy(() =>
  import("./layouts/dashboard.layout").then((module) => ({
    default: module.DashboardLayout,
  }))
);
const ResetpasswordPage = lazy(() => import("./pages/resetpassword.page"));
const VerifyEmailPage = lazy(() => import("./pages/verifyemail.page"));
const VerifyCodePage = lazy(() => import("./pages/verifycode.page"));
const UnsubscribePage = lazy(() => import("./pages/unsubscribe.page"));
const AiAssistPage = lazy(() =>
  import("./pages/aiassist.page").then((module) => ({
    default: module.AiAssistPage,
  }))
);
const SettingsPage = lazy(() => import("./pages/settings.page"));
const DashboardPage = lazy(() => import("./pages/dashboard.page"));
const TimeTrackingPage = lazy(() => import("./pages/timetracking.page"));
const NotFound = lazy(() =>
  import("./pages/notfound.page").then((module) => ({
    default: module.NotFound,
  }))
);
const ForbiddenPage = lazy(() =>
  import("./pages/forbidden.page").then((module) => ({
    default: module.ForbiddenPage,
  }))
);
const SigninPage = lazy(() => import("./pages/signin.page"));
const SignInOTPPage = lazy(() =>
  import("./pages/SignInOTP.page").then((module) => ({
    default: module.SignInOTPPage,
  }))
);
const CheckoutPage = lazy(() => import("./pages/checkout.page"));
const SignupPage = lazy(() => import("./pages/signup.page"));
const UserLayout = lazy(() =>
  import("./layouts/user.layout").then((module) => ({
    default: module.UserLayout,
  }))
);
const HomePage = lazy(() => import("./pages/home.page"));
const WorkFlowPage = lazy(() =>
  import("./pages/workflow.page").then((module) => ({
    default: module.WorkFlowPage,
  }))
);
const InsightsPage = lazy(() =>
  import("./pages/insights.page").then((module) => ({
    default: module.InsightsPage,
  }))
);
const PricingPage = lazy(() =>
  import("./pages/pricing.page").then((module) => ({
    default: module.PricingPage,
  }))
);
const ProjectsPage = lazy(() => import("./pages/projects.page"));
const CreateProjectPage = lazy(() => import("./pages/createproject.page"));
const ProjectViewPage = lazy(() =>
  import("./pages/projectview.page").then((module) => ({
    default: module.ProjectViewPage,
  }))
);
const CreateTaskPage = lazy(() => import("./pages/createtask.page"));
const AddUserMembersPage = lazy(() => import("./pages/addusermemebers.page"));
const UserManagementPage = lazy(() => import("./pages/usermanagement.page"));
const CalenderPage = lazy(() => import("./pages/calender.page"));
const PaymentLinksPage = lazy(() =>
  import("./pages/paymentlinks.page").then((module) => ({
    default: module.PaymentLinksPage,
  }))
);
const InvoicePage = lazy(() => import("./pages/invoice.page"));
const SupportPage = lazy(() => import("./pages/support.page"));
const PrivacyPolicyPage = lazy(() => import("./pages/privacypolicy.page"));
const TermsOfServicePage = lazy(() => import("./pages/termsofservice.page"));
const SuperAdminLayout = lazy(() =>
  import("./layouts/superadmin.layout").then((module) => ({
    default: module.SuperAdminLayout,
  }))
);
const SuperAdminDashboardPage = lazy(
  () => import("./pages/superadmindashboard.page")
);
const SuperAdminDemoAccountsPage = lazy(
  () => import("./pages/superadmindemoaccounts.page")
);
const SuperAdminCompaniesPage = lazy(
  () => import("./pages/superadmincompanies.page")
);
const CompanyViewDetailsPage = lazy(
  () => import("./pages/companyviewdetails.page")
);
const SuperAdminSubAdminPage = lazy(
  () => import("./pages/superadminsubadmin.page")
);
const CreateSubAdmin = lazy(() =>
  import("./components/super admin section/sub admin/createsubadmin").then(
    (module) => ({ default: module.CreateSubAdmin })
  )
);
const SuperAdminSubscriptionsPage = lazy(() =>
  import("./pages/superadminsubscriptions.page").then((module) => ({
    default: module.SuperAdminSubscriptionsPage,
  }))
);
const SuperAdminNewsletterPage = lazy(() =>
  import("./pages/superadminnewsletter.page").then((module) => ({
    default: module.SuperAdminNewsletterPage,
  }))
);
const SuperAdminSupportTicketPage = lazy(
  () => import("./pages/superadminsupportticket.page")
);
const SuperAdminSettingsPage = lazy(
  () => import("./pages/superadminsettings.page")
);
const SuperAdminUsersPage = lazy(
  () => import("./pages/superadminusers.page")
);
const NotificationsPage = lazy(() => import("./pages/notifications.page"));
const ViewerLayout = lazy(() =>
  import("./layouts/viewer.layout").then((module) => ({
    default: module.ViewerLayout,
  }))
);
const ViewerDashboardPage = lazy(() => import("./pages/viewerdashboard.page"));
const ViewermyProjectsPage = lazy(
  () => import("./pages/viewermyprojects.page")
);
const ViewermyTasksPage = lazy(() =>
  import("./pages/viewermytasks.page").then((module) => ({
    default: module.ViewermyTasksPage,
  }))
);
const ViewerSupportsPage = lazy(() => import("./pages/viewersupports.page"));
const ViewerProjectDetailsPage = lazy(
  () => import("./pages/viewerprojectdetails.page")
);
const ViewerCalendarPage = lazy(() => import("./pages/viewercalendar.page"));
const ViewerAiAssistantPage = lazy(() =>
  import("./pages/aiassist.page").then((module) => ({
    default: module.AiAssistPage,
  }))
);
const ClientManagementPage = lazy(
  () => import("./pages/clientmanagement.page")
);
const CreateClient = lazy(() =>
  import("./components/client management/createclient").then((module) => ({
    default: module.CreateClient,
  }))
);
const SubscriptionsPage = lazy(() => import("./pages/subscriptions.page"));

// Main app routes component
const AppRoutes = () => {
  // Track page visits for session persistence
  useSessionPersistence();

  // Handle session restoration for active users
  useSessionRestoration();

  return (
    <Routes>
      {/* Public routes fixed the workflow route*/}
      <Route path="/" element={<LazyWrapper component={HomePage} />} />
      <Route
        path="/pricing"
        element={<LazyWrapper component={PricingPage} />}
      />
      <Route
        path="/workflow"
        element={<LazyWrapper component={WorkFlowPage} />}
      />
      <Route
        path="/insights"
        element={<LazyWrapper component={InsightsPage} />}
      />
      <Route
        path="/privacy-policy"
        element={<LazyWrapper component={PrivacyPolicyPage} />}
      />
      <Route
        path="/terms-of-service"
        element={<LazyWrapper component={TermsOfServicePage} />}
      />

      {/* Authentication layout - no authentication required */}
      <Route
        path="/auth"
        element={<LazyWrapper component={AuthenticationLayout} />}
      >
        <Route path="signin" element={<LazyWrapper component={SigninPage} />} />
        <Route
          path="signin-otp"
          element={<LazyWrapper component={SignInOTPPage} />}
        />
        <Route
          path="verify-email"
          element={<LazyWrapper component={VerifyEmailPage} />}
        />
        <Route
          path="verify-code"
          element={<LazyWrapper component={VerifyCodePage} />}
        />
        <Route
          path="reset-password"
          element={<LazyWrapper component={ResetpasswordPage} />}
        />
        <Route
          path="password-reset-success"
          element={<LazyWrapper component={PasswordresetsucessPage} />}
        />
        <Route path="signup" element={<LazyWrapper component={SignupPage} />} />
      </Route>

      {/* Unsubscribe page - public, no auth layout */}
      <Route
        path="/unsubscribe"
        element={<LazyWrapper component={UnsubscribePage} />}
      />

      {/* Checkout page - no auth layout, just the page */}
      <Route
        path="/checkout"
        element={<LazyWrapper component={CheckoutPage} />}
      />

      {/* Dashboard layout - requires authentication and role-based access */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <LazyWrapper component={DashboardLayout} />
          </ProtectedRoute>
        }
      >
        <Route
          element={<LazyWrapper component={TaskManagementPage} />}
          path="task-management"
        />
        <Route
          element={<LazyWrapper component={CreateTaskPage} />}
          path="task-management/create-task"
        />
        <Route
          element={<LazyWrapper component={ProjectsPage} />}
          path="project"
        />
        <Route
          element={<LazyWrapper component={CreateProjectPage} />}
          path="project/create-project"
        />
        <Route
          element={<LazyWrapper component={CreateProjectPage} />}
          path="project/edit/:id"
        />
        <Route
          element={<LazyWrapper component={ProjectViewPage} />}
          path="project/view/:id"
        />
        <Route
          element={<LazyWrapper component={CalenderPage} />}
          path="calender"
        />
        <Route
          element={<LazyWrapper component={AiAssistPage} />}
          path="ai-assist"
        />
        <Route
          element={<LazyWrapper component={SettingsPage} />}
          path="settings"
        />
        <Route
          element={<LazyWrapper component={NotificationsPage} />}
          path="notifications"
        />
        <Route
          element={<LazyWrapper component={TimeTrackingPage} />}
          path="time-tracking"
        />
        <Route element={<LazyWrapper component={UserLayout} />} path="user" />
        <Route
          element={<LazyWrapper component={AddUserMembersPage} />}
          path="user-management/add-user-members"
        />
        <Route
          element={<LazyWrapper component={UserManagementPage} />}
          path="user-management"
        />
        <Route
          element={<LazyWrapper component={PaymentLinksPage} />}
          path="payment-links"
        />
        <Route
          element={<LazyWrapper component={SupportPage} />}
          path="support"
        />
        <Route
          element={<LazyWrapper component={InvoicePage} />}
          path="invoice"
        />
        <Route
          element={<LazyWrapper component={ClientManagementPage} />}
          path="client-management"
        />
        <Route
          element={<LazyWrapper component={CreateClient} />}
          path="client-management/create-client"
        />
        <Route
          element={<LazyWrapper component={SubscriptionsPage} />}
          path="subscription"
        />
        <Route index element={<LazyWrapper component={DashboardPage} />} />
        <Route path="*" element={<LazyWrapper component={NotFound} />} />
      </Route>

      {/* Super admin layout - requires subadmin role or higher */}
      <Route
        path="/superadmin"
        element={
          <SubAdminRoute>
            <LazyWrapper component={SuperAdminLayout} />
          </SubAdminRoute>
        }
      >
        <Route
          path="companies"
          element={<LazyWrapper component={SuperAdminCompaniesPage} />}
        />
        <Route
          path="companies/details/:slug"
          element={<LazyWrapper component={CompanyViewDetailsPage} />}
        />
        <Route
          path="sub-admin"
          element={<LazyWrapper component={SuperAdminSubAdminPage} />}
        />
        <Route
          path="sub-admin/create-sub-admin"
          element={
            <SuperAdminRoute>
              <LazyWrapper component={CreateSubAdmin} />
            </SuperAdminRoute>
          }
        />
        <Route
          path="subscriptions"
          element={<LazyWrapper component={SuperAdminSubscriptionsPage} />}
        />
        <Route
          path="newsletter"
          element={<LazyWrapper component={SuperAdminNewsletterPage} />}
        />
        <Route
          path="support-tickets"
          element={<LazyWrapper component={SuperAdminSupportTicketPage} />}
        />
        <Route
          path="notifications"
          element={<LazyWrapper component={NotificationsPage} />}
        />
        <Route
          path="settings"
          element={<LazyWrapper component={SuperAdminSettingsPage} />}
        />
        <Route
          path="demo-accounts"
          element={<LazyWrapper component={SuperAdminDemoAccountsPage} />}
        />
        <Route
          path="users"
          element={<LazyWrapper component={SuperAdminUsersPage} />}
        />
        <Route
          index
          element={<LazyWrapper component={SuperAdminDashboardPage} />}
        />
        <Route path="*" element={<LazyWrapper component={NotFound} />} />
      </Route>

      {/* Viewer layout - requires viewer role */}
      <Route
        path="/viewer"
        element={
          <ViewerRoute>
            <LazyWrapper component={ViewerLayout} />
          </ViewerRoute>
        }
      >
        <Route
          index
          element={<LazyWrapper component={ViewerDashboardPage} />}
        />
        <Route
          path="my-projects"
          element={<LazyWrapper component={ViewermyProjectsPage} />}
        />
        <Route
          path="projects/:id"
          element={<LazyWrapper component={ViewerProjectDetailsPage} />}
        />
        <Route
          path="my-tasks"
          element={<LazyWrapper component={ViewermyTasksPage} />}
        />
        <Route
          path="calendar"
          element={<LazyWrapper component={ViewerCalendarPage} />}
        />
        <Route
          path="ai-assistant"
          element={<LazyWrapper component={ViewerAiAssistantPage} />}
        />
        <Route
          path="viewer-support"
          element={<LazyWrapper component={ViewerSupportsPage} />}
        />
        <Route
          path="notifications"
          // element={<LazyWrapper component={NotificationsPage} />}
        />
        <Route
          path="viewer-settings"
          element={<LazyWrapper component={ViewerSettingsPage} />}
        />
        <Route
          path="time-tracking"
          element={<LazyWrapper component={TimeTrackingPage} />}
        />
        <Route path="*" element={<LazyWrapper component={NotFound} />} />
      </Route>

      {/* Error pages */}
      <Route
        path="/forbidden"
        element={<LazyWrapper component={ForbiddenPage} />}
      />
      <Route path="*" element={<LazyWrapper component={NotFound} />} />
    </Routes>
  );
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};
