import {expect,it} from 'vitest';
import {financialMoney,selectedTimeCurrency,financialTotals} from './financial-currency';

it.each(['ILS','USD','EUR','BRL'])('uses recorded %s independently of locale and preserves zero',currency=>{
 for(const locale of ['en-US','pt-BR','es-ES','he-IL']){
  expect(financialMoney(4000,locale,currency,'Missing')).toBe(new Intl.NumberFormat(locale,{style:'currency',currency,currencyDisplay:'code'}).format(4000));
  expect(financialMoney(0,locale,currency,'Missing')).toContain(currency);
 }
});
it('keeps separate totals for each currency and flags unknown amounts without relabeling them',()=>{
 const result=financialTotals([{amount:10,currencyCode:'ILS'},{amount:20,currencyCode:'EUR'},{amount:5,currencyCode:'ILS'},{amount:99}], 'en-US', 'Unknown currency');
 expect(result).toContain('ILS');expect(result).toContain('15.00');expect(result).toContain('EUR');expect(result).toContain('20.00');expect(result).toContain('Unknown currency');expect(result).not.toContain('134');expect(result).not.toContain('USD');
});
it('does not infer a currency and refuses missing or mixed invoice selections',()=>{
 expect(financialMoney(4000,'en-US',null,'Currency not configured')).toBe('Currency not configured');
 expect(selectedTimeCurrency([{currencyCode:'ILS'},{currencyCode:'USD'}])).toBeNull();
 expect(selectedTimeCurrency([{currencyCode:'ILS'},{}])).toBeNull();
 expect(selectedTimeCurrency([{currencyCode:'ILS'}])).toBe('ILS');
});
