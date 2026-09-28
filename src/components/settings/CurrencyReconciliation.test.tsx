import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, expect, it, vi} from 'vitest';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {CurrencyReconciliation} from './CurrencyReconciliation';
const api = vi.hoisted(() => ({get: vi.fn(), post: vi.fn()}));
vi.mock('@/configs/axios.config', () => ({axios: api}));
vi.mock('@/hooks/useDataScope', () => ({useDataScope: () => 'org'}));
vi.mock('react-i18next', () => ({useTranslation: () => ({t: (key: string) => key, i18n: {language: 'en'}})}));
const record = {id: 'invoice-1', type: 'invoice', label: 'INV-1', amount: '4000.00', version: '2026-09-28 10:00:00'};
beforeEach(() => {vi.clearAllMocks(); api.get.mockResolvedValue({data: {data: {records: [record]}}}); api.post.mockResolvedValue({data: {}});});
function setup() {render(<QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}})}><CurrencyReconciliation currencyCode="ILS" /></QueryClientProvider>); return userEvent.setup();}
it('sends only explicitly reviewed records with the displayed amount and version', async () => {
  const user = setup(); await user.click(await screen.findByRole('checkbox', {name: /INV-1/}));
  const save = screen.getByRole('button', {name: 'core.financialSettings.reviewSave'});
  expect(save).toBeDisabled(); await user.click(screen.getByRole('checkbox', {name: 'core.financialSettings.reviewConfirm'})); await user.click(save);
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/organizations/financial-settings/reconcile', {currencyCode: 'ILS', confirm: true, records: [{id: record.id, type: record.type, amount: record.amount, version: record.version}]}));
});
it('changing the historical currency clears selection and requires a new review', async () => {
  const user = setup(); await user.click(await screen.findByRole('checkbox', {name: /INV-1/})); await user.click(screen.getByRole('checkbox', {name: 'core.financialSettings.reviewConfirm'}));
  await user.selectOptions(screen.getByRole('combobox'), 'EUR');
  expect(screen.getByRole('checkbox', {name: /INV-1/})).not.toBeChecked(); expect(screen.getByRole('button', {name: 'core.financialSettings.reviewSave'})).toBeDisabled(); expect(api.post).not.toHaveBeenCalled();
});
