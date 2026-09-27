import {expect,it} from 'vitest';
import {financialMoney,selectedTimeCurrency} from './financial-currency';

it.each(['ILS','USD','EUR'])('uses recorded %s independently of locale and preserves zero',currency=>{
 for(const locale of ['en-US','pt-BR','he-IL']){
  expect(financialMoney(4000,locale,currency,'Missing')).toBe(new Intl.NumberFormat(locale,{style:'currency',currency,currencyDisplay:'code'}).format(4000));
  expect(financialMoney(0,locale,currency,'Missing')).toContain(currency);
 }
});
it('does not infer a currency and refuses missing or mixed invoice selections',()=>{
 expect(financialMoney(4000,'en-US',null,'Currency not configured')).toBe('Currency not configured');
 expect(selectedTimeCurrency([{currencyCode:'ILS'},{currencyCode:'USD'}])).toBeNull();
 expect(selectedTimeCurrency([{currencyCode:'ILS'},{}])).toBeNull();
 expect(selectedTimeCurrency([{currencyCode:'ILS'}])).toBe('ILS');
});
