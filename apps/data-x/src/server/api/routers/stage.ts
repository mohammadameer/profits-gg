import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const stageRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.stage.findMany({
      where: {
        userId: ctx.session?.user.id,
      },
    });
  }),
  data: protectedProcedure
    .input(z.object({ stageId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.data.findMany({
        where: {
          stages: {
            some: {
              id: input.stageId,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.stage.create({
        data: {
          name: input.name,
          description: input.description,
          userId: ctx.session.user.id,
        },
      });
    }),
  retrieve: protectedProcedure
    .input(z.object({ stageId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.stage.findUnique({
        where: { id: input.stageId },
      }),
    ),
  addData: protectedProcedure
    .input(
      z.object({
        stageId: z.string(),
        dataId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.stage.update({
        where: { id: input.stageId },
        data: {
          data: {
            connect: {
              id: input.dataId,
            },
          },
        },
      });
    }),
  removeData: protectedProcedure
    .input(
      z.object({
        stageId: z.string(),
        dataId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.stage.update({
        where: { id: input.stageId },
        data: {
          data: {
            disconnect: {
              id: input.dataId,
            },
          },
        },
      });
    }),
});
