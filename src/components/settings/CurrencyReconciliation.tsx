import {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {axios} from '@/configs/axios.config';
import {useDataScope} from '@/hooks/useDataScope';
import {Button} from '@/components/ui/button';

type RecordToReview = {id: string; type: string; label: string; amount: string; version: string};
export function CurrencyReconciliation({currencyCode}: {currencyCode: string}) {
  const {t, i18n} = useTranslation();
  const scope = useDataScope();
  const qc = useQueryClient();
  const [selection, setSelection] = useState<RecordToReview[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [targetCurrency, setTargetCurrency] = useState(currencyCode);
  const query = useQuery<{records: RecordToReview[]}>({queryKey: ['unresolved-currencies', scope], queryFn: async () => (await axios.get('/organizations/financial-settings/unresolved')).data.data});
  const save = useMutation({
    mutationFn: () => axios.post('/organizations/financial-settings/reconcile', {currencyCode: targetCurrency, confirm: confirmed, records: selection.map(({type, id, amount, version}) => ({type, id, amount, version}))}),
    onSuccess: async () => {setSelection([]); setConfirmed(false); await qc.invalidateQueries();},
  });
  const toggle = (record: RecordToReview) => {
    setConfirmed(false); save.reset();
    setSelection(current => current.some(item => item.type === record.type && item.id === record.id) ? current.filter(item => item.type !== record.type || item.id !== record.id) : [...current, record]);
  };
  return <section className="space-y-3 border-t pt-4">
    <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{t('core.financialSettings.reviewTitle')}</h3><Button size="sm" variant="ghost" disabled={query.isFetching || save.isPending} onClick={() => {setSelection([]); setConfirmed(false); save.reset(); void query.refetch();}}>{t('core.retry')}</Button></div>
    <p className="text-sm text-muted-foreground">{t('core.financialSettings.reviewDescription', {currency: targetCurrency})}</p>
    <label className="block text-sm">{t('core.financialSettings.reviewCurrency')}<select className="ms-3 rounded-md border bg-background p-2" value={targetCurrency} disabled={save.isPending} onChange={event => {setTargetCurrency(event.target.value); setSelection([]); setConfirmed(false); save.reset();}}>{(Intl as typeof Intl & {supportedValuesOf(key:string):string[]}).supportedValuesOf('currency').filter(code => new Intl.NumberFormat('en', {style: 'currency', currency: code}).resolvedOptions().maximumFractionDigits === 2).map(code => <option key={code} value={code}>{code}</option>)}</select></label>
    {query.isPending ? <p role="status">{t('core.financialSettings.loading')}</p> : query.isError ? <p role="alert">{t('core.financialSettings.loadError')}</p> : !query.data?.records.length ? <p className="text-sm">{t('core.financialSettings.noUnresolved')}</p> : <>
      <div className="max-h-72 space-y-1 overflow-auto rounded-lg border p-2">
        {query.data.records.map(record => {
          const checked = selection.some(item => item.type === record.type && item.id === record.id);
          return <label key={record.type + ':' + record.id} className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm hover:bg-muted">
            <input type="checkbox" checked={checked} disabled={save.isPending || (!checked && selection.length >= 50)} onChange={() => toggle(record)} />
            <span className="min-w-0 flex-1"><span className="block truncate">{record.label}</span><span className="text-xs text-muted-foreground">{t('core.financialSettings.recordTypes.' + record.type)}</span></span>
            <span className="tabular-nums" dir="ltr">{new Intl.NumberFormat(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(Number(record.amount))}</span>
          </label>;
        })}
      </div>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" disabled={!selection.length || save.isPending} checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />{t('core.financialSettings.reviewConfirm', {currency: targetCurrency, count: selection.length})}</label>
      <Button variant="outline" disabled={!confirmed || !selection.length || save.isPending} onClick={() => save.mutate()}>{t('core.financialSettings.reviewSave')}</Button>
    </>}
    {save.isError && <p role="alert" className="text-sm text-destructive">{t('core.financialSettings.reviewError')}</p>}
    {save.isSuccess && <p role="status" className="text-sm">{t('core.financialSettings.saved')}</p>}
  </section>;
}
