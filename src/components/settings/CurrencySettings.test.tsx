import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, expect, it, vi} from 'vitest';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {CurrencySettings} from './CurrencySettings';
const state = vi.hoisted(() => ({owner: true, scope: 'org-a', currencyCode: 'ILS' as string | null, put: vi.fn()}));
vi.mock('@/providers/user.provider', () => ({useUser: () => ({data: {user: {role: 'user', isOrganizationOwner: state.owner}}})}));
vi.mock('@/hooks/useOrganizationCurrency', () => ({useOrganizationCurrency: () => ({data: {currencyCode: state.currencyCode}})}));
vi.mock('@/hooks/useDataScope', () => ({useDataScope: () => state.scope}));
vi.mock('./CurrencyReconciliation', () => ({CurrencyReconciliation: () => <div data-testid="historical-review" />}));
vi.mock('@/configs/axios.config', () => ({axios: {put: state.put}}));
vi.mock('react-i18next', () => ({useTranslation: () => ({t: (key: string) => key, i18n: {language: 'pt'}})}));
beforeEach(() => {state.owner = true; state.scope = 'org-a'; state.currencyCode = 'ILS'; state.put.mockReset().mockResolvedValue({data: {}});});
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
it('omits historical reconciliation when embedded in onboarding', () => {
  render(<QueryClientProvider client={new QueryClient()}><CurrencySettings showReconciliation={false} /></QueryClientProvider>);
  expect(screen.queryByTestId('historical-review')).not.toBeInTheDocument();
});
it('clears an unsaved currency and consent when switching organizations', async () => {
  const client = new QueryClient();
  const view = render(<QueryClientProvider client={client}><CurrencySettings /></QueryClientProvider>);
  const user = userEvent.setup();
  await user.selectOptions(screen.getByRole('combobox'), 'EUR');
  await user.click(screen.getByRole('checkbox'));
  state.scope = 'org-b'; state.currencyCode = null;
  view.rerender(<QueryClientProvider client={client}><CurrencySettings /></QueryClientProvider>);
  expect(screen.getByRole('combobox')).toHaveValue('');
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', {name: 'core.financialSettings.save'})).not.toBeInTheDocument();
  expect(state.put).not.toHaveBeenCalled();
});
