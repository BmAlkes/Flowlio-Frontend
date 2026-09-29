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
const linkedRevenue = {id: 'revenue-1', amount: '4000.00', currency: 'USD', version: '2026-09-28 10:00:00.123456', canCorrect: true};
it('requires separate consent for a linked revenue correction and sends its reviewed snapshot', async () => {
  api.get.mockResolvedValue({data: {data: {records: [{...record, linkedRevenue}]}}});
  const user = setup();
  await user.click(await screen.findByRole('checkbox', {name: /INV-1/}));
  expect(screen.getByText('4,000.00 USD → 4,000.00 ILS')).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', {name: 'core.financialSettings.reviewConfirm'}));
  const save = screen.getByRole('button', {name: 'core.financialSettings.reviewSave'});
  expect(save).toBeDisabled();
  await user.click(screen.getByRole('checkbox', {name: 'core.financialSettings.reviewLinkedConfirm'}));
  await user.click(save);
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/organizations/financial-settings/reconcile', {
    currencyCode: 'ILS', confirm: true, confirmLinkedRevenue: true,
    records: [{id: record.id, type: record.type, amount: record.amount, version: record.version, linkedRevenue: {id: linkedRevenue.id, amount: linkedRevenue.amount, currency: 'USD', version: linkedRevenue.version}}],
  }));
});
it('clears the linked confirmation when the selected records change', async () => {
  api.get.mockResolvedValue({data: {data: {records: [{...record, linkedRevenue}, {...record, id: 'invoice-2', label: 'INV-2'}]}}});
  const user = setup();
  await user.click(await screen.findByRole('checkbox', {name: /INV-1/}));
  await user.click(screen.getByRole('checkbox', {name: 'core.financialSettings.reviewLinkedConfirm'}));
  await user.click(screen.getByRole('checkbox', {name: 'core.financialSettings.reviewConfirm'}));
  await user.click(screen.getByRole('checkbox', {name: /INV-2/}));
  expect(screen.getByRole('checkbox', {name: 'core.financialSettings.reviewLinkedConfirm'})).not.toBeChecked();
  expect(screen.getByRole('button', {name: 'core.financialSettings.reviewSave'})).toBeDisabled();
});
it.each([
  {linkedRevenue: {...linkedRevenue, canCorrect: false}},
  {linkedCurrencies: ['USD']},
])('keeps linked currency conflicts out of an ILS batch but allows their recorded currency', async related => {
  api.get.mockResolvedValue({data: {data: {records: [{...record, ...related}]}}});
  const user = setup();
  expect(await screen.findByRole('checkbox', {name: /INV-1/})).toBeDisabled();
  expect(screen.getByText('core.financialSettings.reviewBlocked')).toBeInTheDocument();
  await user.selectOptions(screen.getByRole('combobox'), 'USD');
  expect(screen.getByRole('checkbox', {name: /INV-1/})).toBeEnabled();
  expect(api.post).not.toHaveBeenCalled();
});
it('identifies the conflicting record, clears consent, and refreshes before a new review', async () => {
  api.post.mockRejectedValue({response: {status: 409, data: {conflicts: [{type: 'invoice', id: record.id, reason: 'LINKED_RECORD_CHANGED', currencies: []}]}}});
  const user = setup();
  await user.click(await screen.findByRole('checkbox', {name: /INV-1/}));
  await user.click(screen.getByRole('checkbox', {name: 'core.financialSettings.reviewConfirm'}));
  await user.click(screen.getByRole('button', {name: 'core.financialSettings.reviewSave'}));
  const error = await screen.findByRole('alert');
  expect(error).toHaveTextContent('INV-1:');
  expect(error).toHaveTextContent('core.financialSettings.reviewConflictLinkedChanged');
  expect(error).toHaveTextContent('core.financialSettings.reviewBatchUnchanged');
  expect(screen.getByRole('checkbox', {name: 'core.financialSettings.reviewConfirm'})).not.toBeChecked();
  await user.click(screen.getByRole('button', {name: 'core.retry'}));
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
  expect(screen.getByRole('checkbox', {name: /INV-1/})).not.toBeChecked();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
