export interface Membership {
  id: number;
  product: string;
  url: string;
  price: number | null;
  discount: number | null;
  discountPrice: number;
}

export const expirationByAmount: { [key: string]: number } = {
  "300": 60 * 60 * 24 * 1, // 1 days
  "3599": 60 * 60 * 24 * 30, // 30 days
  "19999": 60 * 60 * 24 * 365, // 1 year
};

export default [
  {
    id: 1,
    product: "ليوم واحد",
    url: process.env.NEXT_PUBLIC_STRIPE_ONE_DAY_PAYMENT_LINK as string,
    price: null,
    discount: null,
    discountPrice: 3,
  },
  {
    id: 2,
    product: "لشهر واحد",
    url: process.env.NEXT_PUBLIC_STRIPE_ONE_MONTH_PAYMENT_LINK as string,
    price: 90,
    discount: 60,
    discountPrice: 35.99,
  },
  {
    id: 3,
    product: "لسنة واحدة",
    url: process.env.NEXT_PUBLIC_STRIPE_ONE_YEAR_PAYMENT_LINK as string,
    price: 1068,
    discount: 80,
    discountPrice: 199.99,
  },
];
