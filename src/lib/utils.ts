import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Currency } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  currency: Currency = 'INR',
  exchangeRate: number = 1
) {
  const amountInTargetCurrency = currency === 'USD' ? amount / exchangeRate : amount;
  
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInTargetCurrency);
}
