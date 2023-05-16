import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const storyRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ category: z.string().nullish() }))
    .query(async ({ ctx, input }) => ctx.prisma.story.findMany()),
  create: publicProcedure
    .input(
      z.object({
        category: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.upsert({
        where: { name: input.category },
        create: { name: input.category },
        update: {},
      });

      return ctx.prisma.story.create({
        data: {
          content: input.content,
          categories: {
            connect: {
              id: category.id,
            },
          },
          version: 1,
          wordCount: input.content.split(" ").length,
          language: "ar",
        },
      });
    }),
});
