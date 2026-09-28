import { useQuery } from '@tanstack/react-query';
import { axios } from '@/configs/axios.config';
import { useDataScope } from './useDataScope';

export function useOrganizationCurrency() {
  const scope = useDataScope();
  return useQuery<{currencyCode: string | null}>({
    queryKey: ['organization-currency', scope],
    queryFn: async () => (await axios.get('/organizations/financial-settings')).data.data,
    staleTime: 60_000,
  });
}
