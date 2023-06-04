import { z } from "zod";
import { OpenAIApi, Configuration } from "openai";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const stripeRouter = createTRPCRouter({
  getCheckoutSession: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const checkoutSession = await ctx.stripe.checkout.sessions.retrieve(
        input.id
      );

      return checkoutSession;
    }),
});
