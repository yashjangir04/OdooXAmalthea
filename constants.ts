
import { Role, ExpenseCategory } from './types';

export const ROLES = Object.values(Role).filter(r => r !== Role.Admin);

export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

export const COUNTRIES: { [key: string]: { name: string; currency: string } } = {
  US: { name: 'United States', currency: 'USD' },
  IN: { name: 'India', currency: 'INR' },
  GB: { name: 'United Kingdom', currency: 'GBP' },
  CA: { name: 'Canada', currency: 'CAD' },
  AU: { name: 'Australia', currency: 'AUD' },
  DE: { name: 'Germany', currency: 'EUR' },
  JP: { name: 'Japan', currency: 'JPY' },
};

export const CURRENCIES = ['USD', 'INR', 'GBP', 'CAD', 'AUD', 'EUR', 'JPY'];

// Mock conversion rates relative to USD
export const CONVERSION_RATES: { [key: string]: number } = {
  USD: 1,
  INR: 83.5,
  GBP: 0.79,
  CAD: 1.37,
  AUD: 1.5,
  EUR: 0.92,
  JPY: 157,
};
