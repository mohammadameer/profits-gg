import type { Data } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const listRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.list.findMany({
      where: {
        userId: ctx.session?.user.id,
      },
    });
  }),
  data: publicProcedure
    .input(
      z.object({
        listId: z.string(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
      }),
    )
    .query(async ({ ctx, input }) => {
      const take = input.limit ?? 10;
      const skip = input.cursor ?? 0;

      const data: Data[] = await ctx.prisma.data.findMany({
        where: {
          lists: {
            some: {
              id: input.listId,
            },
          },
        },
        take: take + 1, // get an extra item at the end which we'll use as next cursor
        skip,
      });

      const dataFetched = data.length;
      let nextCursor: typeof skip | null = skip;
      if (dataFetched > take) {
        nextCursor += dataFetched;
      } else {
        nextCursor = null;
      }

      return {
        data: data.map((d: Data) => ({
          ...d,
          email: d.email
            ? d.email.replace(/(.{2}).*(.{2})@/, "$1...$2@")
            : null,
          phoneNumber: d.phoneNumber
            ? d.phoneNumber.replace(/(.{2}).*(.{2})/, "$1...$2")
            : null,
        })),
        nextCursor,
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.list.create({
        data: {
          name: input.name,
          description: input.description,
          userId: ctx.session.user.id,
        },
      });
    }),
  retrieve: protectedProcedure
    .input(z.object({ listId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.list.findUnique({
        where: { id: input.listId },
      }),
    ),
  addData: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        dataId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.list.update({
        where: { id: input.listId },
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
        listId: z.string(),
        dataId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.list.update({
        where: { id: input.listId },
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
