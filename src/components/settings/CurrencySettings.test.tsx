import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, expect, it, vi} from 'vitest';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {CurrencySettings} from './CurrencySettings';
const state = vi.hoisted(() => ({owner: true, currencyCode: 'ILS' as string | null, put: vi.fn()}));
vi.mock('@/providers/user.provider', () => ({useUser: () => ({data: {user: {role: 'user', isOrganizationOwner: state.owner}}})}));
vi.mock('@/hooks/useOrganizationCurrency', () => ({useOrganizationCurrency: () => ({data: {currencyCode: state.currencyCode}})}));
vi.mock('./CurrencyReconciliation', () => ({CurrencyReconciliation: () => null}));
vi.mock('@/configs/axios.config', () => ({axios: {put: state.put}}));
vi.mock('react-i18next', () => ({useTranslation: () => ({t: (key: string) => key, i18n: {language: 'pt'}})}));
beforeEach(() => {state.owner = true; state.currencyCode = 'ILS'; state.put.mockReset().mockResolvedValue({data: {}});});
function setup() {render(<QueryClientProvider client={new QueryClient({defaultOptions: {mutations: {retry: false}}})}><CurrencySettings /></QueryClientProvider>); return userEvent.setup();}
it('requires confirmation and sends the previous recorded currency, independent of Portuguese locale', async () => {
  const user = setup(); expect(screen.getByRole('combobox')).toHaveValue('ILS');
  await user.selectOptions(screen.getByRole('combobox'), 'EUR');
  const save = screen.getByRole('button', {name: 'core.financialSettings.save'});
  expect(save).toBeDisabled(); await user.click(screen.getByRole('checkbox')); await user.click(save);
  await waitFor(() => expect(state.put).toHaveBeenCalledWith('/organizations/financial-settings', {currencyCode: 'EUR', previousCurrencyCode: 'ILS', confirm: true}));
});
it('does not substitute USD for missing organization settings', () => {state.currencyCode = null; setup(); expect(screen.getByRole('combobox')).toHaveValue(''); expect(state.put).not.toHaveBeenCalled();});
it('staff can read the setting but cannot edit it', () => {state.owner = false; setup(); expect(screen.getByRole('combobox')).toBeDisabled(); expect(screen.queryByRole('button')).not.toBeInTheDocument();});
