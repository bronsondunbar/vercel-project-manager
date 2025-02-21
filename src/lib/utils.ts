import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function combineErrorTexts(errorLogs: Record<string, any>[]) {
  const errorTexts = errorLogs.map((log) => log.text);
  const combinedErrorText = errorTexts.join("<br />");
  return combinedErrorText;
}
