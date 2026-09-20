import type { NavigateFunction } from "react-router";

export interface SignInPorts {
  navigate: NavigateFunction;
  refetchUser: () => Promise<unknown>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
