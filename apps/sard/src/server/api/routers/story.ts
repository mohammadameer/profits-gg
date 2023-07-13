import { Prisma, Story } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const storyRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        slug: z.string().optional(),
        select: z
          .object({
            smallImage: z.boolean().nullish(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) =>
      ctx.prisma.story.findUnique({
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          content: true,
          prepation: true,
          imagePrompt: true,
          mainImage: true,
          smallImage: input.select?.smallImage ? true : false,
          categories: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        where: {
          id: input.id,
          slug: input.slug,
        },
      })
    ),
  list: publicProcedure
    .input(
      z.object({
        id: z.string().nullish(),
        title: z.string().nullish(),
        slug: z.string().nullish(),
        category: z.string().nullish(),
        hidden: z.boolean().nullish(),
        place: z.string().nullish(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
        select: z
          .object({
            mainImage: z.boolean().nullish(),
            smallImage: z.boolean().nullish(),
            description: z.boolean().nullish(),
            content: z.boolean().nullish(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const take = input.limit ?? 10;
      const skip = input.cursor ?? 0;

      const query: Prisma.StoryFindManyArgs = {
        select: {
          id: true,
          title: true,
          slug: true,
          hidden: true,
          mainImage: input.select?.mainImage ? true : false,
          smallImage: input.select?.smallImage ? true : false,
          description: input.select?.description ? true : false,
          content: input.select?.content ? true : false,
          imagePrompt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        where: {
          AND: {
            id: {
              not: input.id ?? undefined,
            },
            categories: {
              some: {
                name: input.category ?? undefined,
              },
            },
            hidden: input.hidden ?? undefined,
            place: input?.place ?? undefined,
          },
        },
        take: take + 1, // get an extra item at the end which we'll use as next cursor
        skip,
      };

      const stories: Story[] = await ctx.prisma.story.findMany(query);

      const dataFetched = stories.length;
      let nextCursor: typeof skip | null = skip;
      if (dataFetched > take) {
        nextCursor += dataFetched;
      } else {
        nextCursor = null;
      }

      return {
        stories,
        nextCursor,
      };
    }),
  create: publicProcedure
    .input(
      z.object({
        account: z.string().nullish(),
        prepation: z.string().nullish(),
        title: z.string(),
        description: z.string(),
        slug: z.string(),
        mainImage: z.string(),
        smallImage: z.string(),
        imagePrompt: z.string(),
        content: z.string(),
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
          prepation: input.prepation,
          title: input.title,
          description: input.description,
          slug: input.slug,
          mainImage: input.mainImage,
          smallImage: input.smallImage,
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
        smallImage: z.string().nullish(),
        imagePrompt: z.string().nullish(),
        content: z.string().nullish(),
        category: z.string().nullish(),
        wordCount: z.number().nullish(),
        language: z.string().nullish(),
        version: z.number().nullish(),
        hidden: z.boolean().nullish(),
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
          smallImage: input.smallImage,
          imagePrompt: input.imagePrompt,
          content: input.content,
          wordCount: input.wordCount,
          language: input.language,
          version: input.version,
          hidden: input.hidden ?? undefined,
        },
      })
    ),
  storyImage: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) =>
      ctx.prisma.story.findUnique({
        where: {
          id: input.id,
        },
        select: {
          mainImage: true,
        },
      })
    ),
});
