import {useState} from 'react';
import type {AxiosError} from 'axios';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {axios} from '@/configs/axios.config';
import {useDataScope} from '@/hooks/useDataScope';
import {Button} from '@/components/ui/button';

type LinkedRevenue = {id: string; amount: string; version: string; currency: string; canCorrect: boolean};
type RecordToReview = {id: string; type: string; label: string; amount: string; version: string; linkedRevenue?: LinkedRevenue | null; linkedCurrencies?: string[]};
type ReviewFailure = {conflicts?: {type: string; id: string; reason: string; currencies: string[]}[]};
const conflictMessages: Record<string, string> = {
  RECORD_CHANGED: 'reviewConflictChanged',
  LINKED_RECORD_CHANGED: 'reviewConflictLinkedChanged',
  LINKED_REVENUE_CONFIRMATION_REQUIRED: 'reviewConflictConfirmation',
  LINKED_CURRENCY_CONFLICT: 'reviewConflictCurrency',
};
export function CurrencyReconciliation({currencyCode}: {currencyCode: string}) {
  const {t, i18n} = useTranslation();
  const scope = useDataScope();
  const qc = useQueryClient();
  const [selection, setSelection] = useState<RecordToReview[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [linkedConfirmed, setLinkedConfirmed] = useState(false);
  const [targetCurrency, setTargetCurrency] = useState(currencyCode);
  const query = useQuery<{records: RecordToReview[]}>({queryKey: ['unresolved-currencies', scope], queryFn: async () => (await axios.get('/organizations/financial-settings/unresolved')).data.data});
  const needsCorrection = (record: RecordToReview) => !!record.linkedRevenue && record.linkedRevenue.currency !== targetCurrency;
  const isBlocked = (record: RecordToReview) => (record.linkedCurrencies ?? []).some(code => code !== targetCurrency) || (needsCorrection(record) && !record.linkedRevenue?.canCorrect);
  const corrections = selection.filter(record => needsCorrection(record) && !isBlocked(record));
  const save = useMutation({
    mutationFn: () => axios.post('/organizations/financial-settings/reconcile', {
      currencyCode: targetCurrency, confirm: confirmed,
      ...(corrections.length && linkedConfirmed ? {confirmLinkedRevenue: true} : {}),
      records: selection.map(record => {
        const {type, id, amount, version, linkedRevenue} = record;
        return {type, id, amount, version, ...(needsCorrection(record) && linkedRevenue?.canCorrect ? {
          linkedRevenue: {id: linkedRevenue.id, amount: linkedRevenue.amount, version: linkedRevenue.version, currency: linkedRevenue.currency},
        } : {})};
      }),
    }),
    onSuccess: async () => {setSelection([]); setConfirmed(false); setLinkedConfirmed(false); await qc.invalidateQueries();},
    onError: () => {setConfirmed(false); setLinkedConfirmed(false);},
  });
  const resetReview = () => {setConfirmed(false); setLinkedConfirmed(false); save.reset();};
  const toggle = (record: RecordToReview) => {
    resetReview();
    setSelection(current => current.some(item => item.type === record.type && item.id === record.id) ? current.filter(item => item.type !== record.type || item.id !== record.id) : [...current, record]);
  };
  const failure = save.error as AxiosError<ReviewFailure> | null;
  const conflicts = failure?.response?.data?.conflicts;
  const requestError = failure?.response?.status === 403 ? 'reviewForbidden' : failure?.response?.status === 400 ? 'reviewInvalid' : 'reviewRequestError';
  const formatAmount = (amount: string) => new Intl.NumberFormat(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(Number(amount));
  const currencyLabel = (code: string) => code || t('core.financialSettings.missing');
  return <section className="space-y-3 border-t pt-4">
    <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{t('core.financialSettings.reviewTitle')}</h3><Button type="button" size="sm" variant="ghost" disabled={query.isFetching || save.isPending} onClick={() => {setSelection([]); resetReview(); void query.refetch();}}>{t('core.retry')}</Button></div>
    <p className="text-sm text-muted-foreground">{t('core.financialSettings.reviewDescription')}</p>
    <label className="flex flex-wrap items-center gap-3 text-sm">{t('core.financialSettings.reviewCurrency')}<select className="rounded-md border bg-background p-2" value={targetCurrency} disabled={save.isPending} onChange={event => {setTargetCurrency(event.target.value); setSelection([]); resetReview();}}>{(Intl as typeof Intl & {supportedValuesOf(key:string):string[]}).supportedValuesOf('currency').filter(code => new Intl.NumberFormat('en', {style: 'currency', currency: code}).resolvedOptions().maximumFractionDigits === 2).map(code => <option key={code} value={code}>{code}</option>)}</select></label>
    {query.isPending ? <p role="status">{t('core.financialSettings.loading')}</p> : query.isError ? <p role="alert">{t('core.financialSettings.loadError')}</p> : !query.data?.records.length ? <p className="text-sm">{t('core.financialSettings.noUnresolved')}</p> : <>
      <div className="max-h-72 space-y-1 overflow-auto rounded-lg border p-2">
        {query.data.records.map(record => {
          const checked = selection.some(item => item.type === record.type && item.id === record.id);
          const blocked = isBlocked(record);
          const currencies = [...new Set([...(record.linkedCurrencies ?? []), ...(record.linkedRevenue ? [record.linkedRevenue.currency] : [])])].map(currencyLabel).join(', ');
          return <label key={record.type + ':' + record.id} className={`flex items-start gap-3 rounded-md p-2 text-sm ${blocked ? 'bg-muted/50' : 'cursor-pointer hover:bg-muted'}`}>
            <input type="checkbox" className="mt-1" checked={checked} disabled={blocked || save.isPending || (!checked && selection.length >= 50)} onChange={() => toggle(record)} />
            <span className="min-w-0 flex-1"><span className="block truncate">{record.label}</span><span className="text-xs text-muted-foreground">{t('core.financialSettings.recordTypes.' + record.type)}</span>
              {blocked ? <span className="mt-1 block text-xs text-destructive">{t('core.financialSettings.reviewBlocked', {currencies})}</span> : needsCorrection(record) && <span className="mt-1 block text-xs text-muted-foreground">{t('core.financialSettings.reviewLinkedHint', {currency: currencyLabel(record.linkedRevenue!.currency)})}</span>}
            </span>
            <span className="shrink-0 tabular-nums" dir="ltr">{formatAmount(record.amount)}</span>
          </label>;
        })}
      </div>
      {corrections.length > 0 && <div className="space-y-3 rounded-lg border border-amber-300/60 bg-amber-50/50 p-4 dark:bg-amber-950/20">
        <h4 className="text-sm font-semibold">{t('core.financialSettings.reviewLinkedTitle')}</h4>
        <p className="text-sm text-muted-foreground">{t('core.financialSettings.reviewLinkedDescription')}</p>
        <ul className="space-y-2 text-sm">{corrections.map(record => <li key={record.id} className="flex flex-wrap items-center justify-between gap-2">
          <span>{record.label}</span><span dir="ltr" className="font-medium tabular-nums">{formatAmount(record.linkedRevenue!.amount)} {currencyLabel(record.linkedRevenue!.currency)} → {formatAmount(record.linkedRevenue!.amount)} {targetCurrency}</span>
        </li>)}</ul>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={linkedConfirmed} disabled={save.isPending} onChange={event => setLinkedConfirmed(event.target.checked)} />{t('core.financialSettings.reviewLinkedConfirm', {currency: targetCurrency})}</label>
      </div>}
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" disabled={!selection.length || save.isPending} checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />{t('core.financialSettings.reviewConfirm', {currency: targetCurrency, count: selection.length})}</label>
      <Button type="button" variant="outline" disabled={!confirmed || !selection.length || selection.some(isBlocked) || (corrections.length > 0 && !linkedConfirmed) || save.isPending} onClick={() => save.mutate()}>{t('core.financialSettings.reviewSave')}</Button>
    </>}
    {save.isError && <div role="alert" className="space-y-2 text-sm text-destructive">
      {conflicts?.length ? <>
        <p>{t('core.financialSettings.reviewBatchUnchanged')}</p>
        <ul className="space-y-1">{conflicts.map(conflict => {
          const record = selection.find(item => item.type === conflict.type && item.id === conflict.id);
          return <li key={conflict.type + ':' + conflict.id}><strong>{record?.label ?? t('core.financialSettings.recordTypes.' + conflict.type)}: </strong>{t('core.financialSettings.' + (conflictMessages[conflict.reason] ?? 'reviewError'), {currencies: conflict.currencies?.map(currencyLabel).join(', ')})}</li>;
        })}</ul>
      </> : <p>{t('core.financialSettings.' + requestError)}</p>}
    </div>}
    {save.isSuccess && <p role="status" className="text-sm">{t('core.financialSettings.saved')}</p>}
  </section>;
}
