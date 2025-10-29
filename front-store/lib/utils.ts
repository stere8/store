import { TypeReviewModel } from "@/types/models";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDate = (date: Date) => {
  const newDate = new Date(date).toDateString();
  return newDate;
};

export const getRatingNote = (reviews: TypeReviewModel[]): number => {
  const ratingTotal = reviews.reduce(
    (accumulator: number, currentValue: TypeReviewModel) =>
      accumulator + currentValue?.rating,
    0
  );
  const rating = (ratingTotal / reviews.length).toFixed(1);

  if (!parseFloat(rating)) {
    return 0;
  }

  return parseFloat(rating);
};

export const discountPrice = (price: number, discount: number): number => {
  let price_final: number = 0;

  price_final = (price * (100 - discount)) / 100;
  return parseFloat(price_final.toFixed(2));
};

// export async function getMessages(locale: string) {
//   return await import(`../public/locales/messages/${locale}.json`);
// }