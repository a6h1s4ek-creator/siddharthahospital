import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import NepaliDate from 'nepali-date-converter';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatToNpr(amount: number) {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
  }).format(amount);
}

export function convertToNepaliDate(date: string | Date) {
  try {
    const d = new Date(date);
    // The library throws an error for dates outside its supported range.
    // We'll check the year to avoid crashing the app.
    const year = d.getFullYear();
    if (year < 2000 || year > 2090) {
        // Return the Gregorian date as a fallback for unsupported dates.
        return d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    }
    const nepaliDate = new NepaliDate(d);
    return nepaliDate.format('YYYY-MM-DD');
  } catch (error) {
    console.error("Error converting date to Nepali date:", date, error);
    // Return original date string or a placeholder if conversion fails
    return date.toString();
  }
}

export function formatToNepaliTime(date: Date) {
    return date.toLocaleTimeString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', hour12: true });
}
