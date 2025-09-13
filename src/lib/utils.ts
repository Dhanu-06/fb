import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Currency } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency = 'INR', exchangeRate: number = 1) {
  const convertedAmount = currency === 'USD' ? amount / exchangeRate : amount;
  
  const formattedAmount = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(convertedAmount));

  if (currency === 'USD') {
    return `$${formattedAmount}`;
  }
  return `₹${formattedAmount}`;
}
