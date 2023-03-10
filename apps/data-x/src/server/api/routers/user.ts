import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  retrieve: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    }),
  ),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  emailSignup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      }),
    ),
});
