import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { atom } from "jotai/index";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isDeployingAtom = atom(false);
export const isSwappingAtom = atom(false);
