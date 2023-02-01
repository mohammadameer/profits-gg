import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const stripeRouter = router({
  subscription: protectedProcedure
    .input(
      z.object({
        stripeSubscriptionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) =>
      input?.stripeSubscriptionId
        ? ctx.stripe.subscriptions.retrieve(input?.stripeSubscriptionId)
        : null
    ),
  products: protectedProcedure.query(({ ctx }) =>
    ctx.stripe.products.list({ active: true })
  ),
  prices: protectedProcedure.query(({ ctx }) => ctx.stripe.prices.list()),
  getSession: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        stripeCustomerId: z.string(),
        price: z.string(),
        numberOfBranchs: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const checkoutSession = await ctx.stripe.checkout.sessions.create({
        mode: "subscription",
        /* This is where the magic happens - this line will automatically link this Checkout page to the existing customer we created when the user signed-up, so that when the webhook is called our database can automatically be updated correctly.*/
        customer: input?.stripeCustomerId as string,
        client_reference_id: input?.organizationId,
        line_items: [
          {
            price: input.price,
            quantity: input.numberOfBranchs,
          },
        ],
        // {CHECKOUT_SESSION_ID} is a string literal which the Stripe SDK will replace; do not manually change it or replace it with a variable!
        success_url: `${process.env.NEXTAUTH_URL}/dashboard/user/organizations/${input?.organizationId}/subscription`,
        cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/user/organizations/${input?.organizationId}/subscription`,
        automatic_tax: { enabled: true },
        allow_promotion_codes: true,
        customer_update: {
          address: "auto",
        },
        metadata: {
          organizationId: input?.organizationId as string,
        },
        subscription_data: {
          metadata: {
            organizationId: input?.organizationId as string,
          },
        },
      });

      return !checkoutSession.url
        ? "Could not create checkout session"
        : checkoutSession.url;
    }),
});
