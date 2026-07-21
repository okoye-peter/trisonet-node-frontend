import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Rounds to at most 2 decimal places and drops trailing zeros, guarding against
// floating-point drift (e.g. 0.5800000000000001) surfacing in the UI.
export function formatGkwth(amount: number) {
  return Number(amount.toFixed(2))
}
