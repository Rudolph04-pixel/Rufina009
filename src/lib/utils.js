// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases condicionalmente y aplica twMerge
 *  - Uso: cn("p-4", isActive && "bg-blue-500")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
