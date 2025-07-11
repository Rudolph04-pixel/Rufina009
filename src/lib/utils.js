// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases condicionalmente */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
