import { format } from "date-fns";

export const formatDate = (date: string | Date) => {
  if (date instanceof Date) {
    return format(date, "dd MMM yyyy");
  }
  if (typeof date === "string") {
    return format(new Date(date), "dd MMM yyyy");
  }

  return "-"
}

export const formatDateTime = (date: string | Date) => {
  if (date instanceof Date) {
    return format(date, "dd MMM yyyy HH:mm");
  }
  if (typeof date === "string") {
    return format(new Date(date), "dd MMM yyyy HH:mm");
  }

  return "-"
}