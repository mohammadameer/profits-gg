import type { Data, Prisma } from "@prisma/client";
import { DataType } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const dataRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().nullish(),
        type: z.enum(["onlineStore", "company"]).nullish(),
        maroofType: z.number().nullish(),
        lists: z.array(z.string()).nullish(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
      }),
    )
    .query(async ({ ctx, input }) => {
      const take = input.limit ?? 10;
      const skip = input.cursor ?? 0;

      const query: Prisma.DataFindManyArgs = {
        where: {
          type: {
            equals: input.type || undefined,
          },
          nameAr: {
            contains: input.search || undefined,
            mode: "insensitive",
          },
          maroofBusinessTypeId: {
            equals: input.maroofType || undefined,
          },
        },
        take: take + 1, // get an extra item at the end which we'll use as next cursor
        skip,
      };

      if (input.lists) {
        query.where = {
          ...query.where,
          lists: {
            some: {
              id: {
                in: input.lists,
              },
            },
          },
        };
      }

      const data: Data[] = await ctx.prisma.data.findMany(query);

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
  retrieve: publicProcedure
    .input(z.object({ dataId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.data.findFirst({ where: { id: input.dataId } }),
    ),
  lists: publicProcedure
    .input(
      z.object({
        dataId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) =>
      ctx.prisma.list.findMany({
        where: {
          user: {
            id: ctx.session?.user.id,
          },
          dataIDs: {
            has: input.dataId,
          },
        },
      }),
    ),
  stage: publicProcedure
    .input(
      z.object({
        dataId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) =>
      ctx.prisma.stage.findFirst({
        where: {
          id: input.dataId,
          user: {
            id: ctx.session?.user.id,
          },
        },
      }),
    ),
});
