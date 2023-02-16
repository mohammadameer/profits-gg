import { z } from "zod";
import { getOrCreateStripeCustomerIdForUser } from "../../stripe/webhook-handler";

import { protectedProcedure, createTRPCRouter } from "../trpc";

export const stripeRouter = createTRPCRouter({
  subscription: protectedProcedure.query(async ({ ctx, input }) =>
    ctx.session.user.stripeSubscriptionId
      ? ctx.stripe.subscriptionItems.retrieve(
          ctx.session.user.stripeSubscriptionItemId,
          {
            expand: ["price.product"],
          },
        )
      : null,
  ),
  products: protectedProcedure.query(({ ctx }) =>
    ctx.stripe.products.list({ active: true }),
  ),
  prices: protectedProcedure.query(({ ctx }) => ctx.stripe.prices.list()),
  getSession: protectedProcedure
    .input(
      z.object({
        price: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const checkoutSession = await ctx.stripe.checkout.sessions.create({
        mode: "subscription",
        currency: "sar",
        /* This is where the magic happens - this line will automatically link this Checkout page to the existing customer we created when the user signed-up, so that when the webhook is called our database can automatically be updated correctly.*/
        customer: (await getOrCreateStripeCustomerIdForUser({
          prisma: ctx.prisma,
          stripe: ctx.stripe,
          userId: ctx.session.user.id,
        })) as string,
        client_reference_id: ctx?.session?.user?.id,
        line_items: [
          {
            price: input.price,
            quantity: 1,
          },
        ],
        // {CHECKOUT_SESSION_ID} is a string literal which the Stripe SDK will replace; do not manually change it or replace it with a variable!
        success_url: `${process.env.NEXTAUTH_URL}/user/subscription?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/user/subscription?error=true`,
        automatic_tax: { enabled: true },
        allow_promotion_codes: true,
        customer_update: {
          address: "auto",
        },
        metadata: {
          userId: ctx?.session?.user?.id as string,
        },
        subscription_data: {
          metadata: {
            userId: ctx?.session?.user?.id as string,
          },
        },
      });

      return !checkoutSession.url
        ? "Could not create checkout session"
        : checkoutSession.url;
    }),
});
