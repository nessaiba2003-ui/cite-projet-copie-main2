import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Fusionne les classes Tailwind sans conflits (clsx + tailwind-merge). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
