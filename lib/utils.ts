import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatSessionDate = (year: number, month: number) =>
  dayjs().set("months", Number(month)).set("year", Number(year)).format("MMMM-YYYY");
