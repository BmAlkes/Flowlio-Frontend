import React from "react";

type ErrorBoundaryState = { hasError: boolean; error?: any; retryKey: number };

type ErrorBoundaryProps = React.PropsWithChildren<{
  /** Human-readable label for what this boundary wraps, shown in the error UI and
   * console log so a crash can be traced to a section without needing DevTools. */
  section?: string;
  /** When this value changes (e.g. the route pathname) while an error is shown,
   * the boundary auto-recovers — so navigating away from a broken page doesn't
   * require the user to click Retry or refresh. */
  resetKey?: string | number;
  /** Renders full-screen instead of a contained card — only the top-level,
   * app-wide boundary in App.tsx should use this. */
  fullScreen?: boolean;
}>;

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryKey: 0 };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error, retryKey: 0 };
  }

  componentDidCatch(error: any, info: any) {
    const section = this.props.section ?? "app";
    console.error(`UI ErrorBoundary caught (${section}):`, error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.hasError &&
      prevProps.resetKey !== undefined &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.handleRetry();
    }
  }

  handleRetry = () => {
    // Reset error state and increment retry key to force remount
    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      retryKey: prevState.retryKey + 1,
    }));
  };

  handleRefresh = () => {
    // Force a full page refresh
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { section, fullScreen } = this.props;
      return (
        <div
          className={
            fullScreen
              ? "flex min-h-screen items-center justify-center p-6"
              : "flex items-center justify-center p-6"
          }
        >
          <div className="max-w-md w-full bg-card border rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">
              {section ? `Something went wrong in ${section}` : "Something went wrong"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Please try again. If the problem persists, refresh the page.
            </p>
            <div className="text-start bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-xs text-red-800 break-words">
              <div className="font-medium mb-1">Error:</div>
              <pre className="whitespace-pre-wrap">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center rounded-full bg-black px-4 py-2 text-white hover:bg-black/80 cursor-pointer transition-all duration-300"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={this.handleRefresh}
                className="inline-flex items-center rounded-full bg-muted px-4 py-2 text-gray-800 hover:bg-gray-300 cursor-pointer transition-all duration-300"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    // Use retryKey to force remount on retry
    return <div key={this.state.retryKey}>{this.props.children}</div>;
  }
}
