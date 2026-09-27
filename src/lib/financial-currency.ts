import {formatMoney} from './locale-format';

export function isCurrencyCode(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Z]{3}$/.test(value) &&
    (Intl as typeof Intl & {supportedValuesOf(key:string):string[]}).supportedValuesOf('currency').includes(value);
}
export function financialMoney(value: number|string|null|undefined, locale: string, currency: unknown, unknownLabel: string) {
  return isCurrencyCode(currency) ? formatMoney(value,locale,currency) : unknownLabel;
}
export function selectedTimeCurrency(entries: {currencyCode?:string|null}[]): string|null {
  const code=entries[0]?.currencyCode;
  return isCurrencyCode(code)&&entries.every(entry=>entry.currencyCode===code)?code:null;
}
