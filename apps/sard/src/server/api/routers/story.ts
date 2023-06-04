import { Prisma, Story } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const storyRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) =>
      ctx.prisma.story.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          categories: true,
        },
      })
    ),
  list: publicProcedure
    .input(
      z.object({
        category: z.string().nullish(),
        place: z.string().nullish(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
      })
    )
    .query(async ({ ctx, input }) => {
      const take = input.limit ?? 10;
      const skip = input.cursor ?? 0;

      const query: Prisma.StoryFindManyArgs = {
        where: {
          AND: {
            categories: {
              some: {
                name: input.category ?? undefined,
              },
            },
            mainImage: {
              not: null,
            },
            place: input?.place ?? undefined,
          },
        },
      };

      const stories: Story[] = await ctx.prisma.story.findMany(query);

      const storiesFetched = stories.length;
      const nextCursor: typeof skip | null =
        storiesFetched > take ? skip + storiesFetched : null;

      return {
        stories,
        nextCursor,
      };
    }),
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        slug: z.string(),
        mainImage: z.string(),
        imagePrompt: z.string(),
        content: z.string(),
        place: z.string(),
        category: z.string(),
        wordCount: z.number(),
        language: z.string(),
        version: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.upsert({
        where: {
          name: input.category,
        },
        create: {
          name: input.category,
        },
        update: {},
      });

      return ctx.prisma.story.create({
        data: {
          title: input.title,
          description: input.description,
          slug: input.slug,
          place: input.place,
          mainImage: input.mainImage,
          imagePrompt: input.imagePrompt,
          content: input.content,
          categories: {
            connect: {
              id: category.id,
            },
          },
          version: input.version,
          wordCount: input.wordCount,
          language: input.language,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().nullish(),
        description: z.string().nullish(),
        slug: z.string().nullish(),
        mainImage: z.string().nullish(),
        imagePrompt: z.string().nullish(),
        content: z.string().nullish(),
        category: z.string().nullish(),
        wordCount: z.number().nullish(),
        language: z.string().nullish(),
        version: z.number().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.story.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          slug: input.slug,
          mainImage: input.mainImage,
          imagePrompt: input.imagePrompt,
          content: input.content,
          wordCount: input.wordCount,
          language: input.language,
          version: input.version,
          categories: {
            connect: {
              name: input.category ?? undefined,
            },
          },
        },
      })
    ),
});