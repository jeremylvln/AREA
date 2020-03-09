import _DIGITAL_CURRENCIES from './digital_currencies.json';
import _PHYSICAL_CURRENCIES from './physical_currencies.json';

export const DIGITAL_CURRENCIES = _DIGITAL_CURRENCIES.map((currency) => currency.code);
export const PHYSICAL_CURRENCIES = _PHYSICAL_CURRENCIES.map((currency) => currency.code);
export const BOTH_CURRENCIES = DIGITAL_CURRENCIES.concat(PHYSICAL_CURRENCIES);

export const DIGITAL_CURRENCIES_FORM = _DIGITAL_CURRENCIES.map((currency) => ({
  name: currency.name,
  value: currency.code,
}));

export const PHYSICAL_CURRENCIES_FORM = _PHYSICAL_CURRENCIES.map((currency) => ({
  name: currency.name,
  value: currency.code,
}));

export const BOTH_CURRENCIES_FORM = DIGITAL_CURRENCIES_FORM.concat(PHYSICAL_CURRENCIES_FORM);