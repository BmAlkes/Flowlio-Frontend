import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/providers/user.provider';
import { useOrganizationCurrency } from '@/hooks/useOrganizationCurrency';
import { axios } from '@/configs/axios.config';
import { Button } from '@/components/ui/button';
import {CurrencyReconciliation} from './CurrencyReconciliation';

export function CurrencySettings() {
  const { data: session } = useUser();
  const user = session?.user;
  const canEdit = !!user && (['superadmin', 'subadmin'].includes(user.role) || (user.role === 'user' && user.isOrganizationOwner));
  const { t, i18n } = useTranslation();
  const settings = useOrganizationCurrency();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const current = settings.data?.currencyCode ?? null;
  const save = useMutation({
    mutationFn: () => axios.put('/organizations/financial-settings', {currencyCode: selected, previousCurrencyCode: current, confirm: confirmed}),
    onSuccess: async () => { setSelected(null); setConfirmed(false); await qc.invalidateQueries(); },
  });
  const names = new Intl.DisplayNames([i18n.language], {type: 'currency'});
  const codes = (Intl as typeof Intl & {supportedValuesOf(key:string):string[]}).supportedValuesOf('currency').filter(code => new Intl.NumberFormat('en', {style: 'currency', currency: code}).resolvedOptions().maximumFractionDigits === 2);
  return <section className="my-4 rounded-xl border bg-card p-5 space-y-4">
    <div><h2 className="font-semibold">{t('core.financialSettings.title')}</h2><p className="text-sm text-muted-foreground mt-1">{t('core.financialSettings.description')}</p></div>
    {settings.isError ? <p role="alert">{t('core.financialSettings.loadError')}</p> : <>
      <label className="block text-sm font-medium" htmlFor="organization-currency">{t('core.financialSettings.currency')}</label>
      <select id="organization-currency" className="h-10 w-full max-w-md rounded-md border bg-background px-3" disabled={!canEdit || settings.isPending || save.isPending} value={selected ?? current ?? ''} onChange={event => {setSelected(event.target.value); setConfirmed(false); save.reset();}}>
        <option value="" disabled>{t('core.financialSettings.missing')}</option>
        {codes.map(code => <option key={code} value={code}>{code} — {names.of(code)}</option>)}
      </select>
      <p className="text-xs text-muted-foreground">{t('core.financialSettings.precision')}</p>
      {canEdit && selected !== null && selected !== current && <>
        <label className="flex gap-2 text-sm items-start"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-1" />{t('core.financialSettings.confirm')}</label>
        <Button disabled={!confirmed || save.isPending} onClick={() => save.mutate()}>{t('core.financialSettings.save')}</Button>
      </>}
      {save.isError && <p role="alert" className="text-sm text-destructive">{t('core.financialSettings.saveError')}</p>}
      {save.isSuccess && <p role="status" className="text-sm">{t('core.financialSettings.saved')}</p>}
    </>}
    {canEdit && current && <CurrencyReconciliation key={current} currencyCode={current} />}
  </section>;
}
