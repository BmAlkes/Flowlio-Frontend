import { useUser } from "@/providers/user.provider";
import { sessionScope } from "@/utils/sessionScope";

export function useDataScope() {
  const { data } = useUser();
  return sessionScope(data, data?.user);
}
