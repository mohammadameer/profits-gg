import { Prisma, Story } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        email: z.string().optional(),
        phoneNumber: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) =>
      ctx.prisma.user.findFirst({
        where: {
          id: input.id ?? undefined,
          email: input.email ?? undefined,
          phoneNumber: input.phoneNumber ?? undefined,
        },
      })
    ),
  checkUser: publicProcedure
    .input(
      z.object({
        email: z.string().optional(),
        phoneNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.user.findFirst({
        where: {
          OR: [
            { email: input.email ?? undefined },
            {
              phoneNumber: {
                contains: input.phoneNumber ?? undefined,
              },
            },
          ],
        },
      })
    ),
});
