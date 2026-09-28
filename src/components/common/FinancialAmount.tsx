import { useTranslation } from 'react-i18next';
import { financialMoney } from '@/lib/financial-currency';

export function FinancialAmount({value, currency}: {value: number|string|null|undefined; currency: unknown}) {
  const {t, i18n} = useTranslation();
  return <>{financialMoney(value, i18n.language, currency, t('core.currencyUnknown'))}</>;
}
