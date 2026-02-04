import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pageTitle(title?: string) {
  if (title) return `${title} — Kalamari`;
  return "Kalamari by Irving Dinh";
}
