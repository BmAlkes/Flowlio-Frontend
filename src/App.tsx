import { NotificationsProvider } from "./providers/notifications.provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "./components/ui/sonner";
import { AppRouter } from "./router";
import { UserProvider } from "./providers/user.provider";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

const client = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={client}>
      <UserProvider>
        <NotificationsProvider>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
          <Toaster />
          <ReactQueryDevtools />
        </NotificationsProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};

export default App;
// chnages
