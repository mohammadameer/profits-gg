import { z } from "zod";
import { OpenAIApi, Configuration } from "openai";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const openaiRouter = createTRPCRouter({
  getImage: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.openai.createImage({
        prompt:
          "cartoonic, colorful and oil pastel painting of " + input.prompt,
        response_format: "b64_json",
        size: "512x512",
      });

      if (!data?.data?.data?.[0]?.b64_json) {
        throw new Error("No image");
      }

      return data.data.data[0].b64_json;
    }),
  createStory: publicProcedure
    .input(
      z.object({
        category: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
                you are responsible for creating a blueprint that will be used later to create a story

                i want a title, description, url slug and detailed image prompt for open ai dalle model

                the story category is ${input.category}

                the title should contain a character and a place

                the description should be short and contain the main story parts

                the character can be a person name, an animal, an inanimate
                    
                use arabic for the title and slug without translation

                use english for the image prompt

                respond in json format

                examples

                {
                "title": "التلفاز الشرير"،
                "description": "تلفاز شرير يمنع الأطفال من النوم"،
                "slug": "التلفاز-الشرير",
                "image_prompt": "evil tv"
                }

                {
                "title": "مدرسة الأطفال"،
                "description": "مدرسة كل الأطفال فيها لا ينامون"،
                "slug": "مدرسة -لأطفال",
                "image_prompt": "children school"
                }
                `,
          },
        ],
      });

      if (!data?.data?.choices?.length) {
        throw new Error("No choices");
      }

      const message = data.data.choices[0]?.message?.content;

      if (!message) {
        throw new Error("No message");
      }

      const parsedMessage = JSON.parse(message);

      if (
        !parsedMessage.title ||
        !parsedMessage.description ||
        !parsedMessage.slug ||
        !parsedMessage.image_prompt
      ) {
        throw new Error("Invalid message");
      }

      const category = await ctx.prisma.category.upsert({
        where: {
          name: input.category,
        },
        create: {
          name: input.category,
        },
        update: {},
      });

      const story = await ctx.prisma.story.count({
        where: {
          title: parsedMessage.title,
          slug: parsedMessage.slug,
        },
      });

      if (story) {
        throw new Error("Story already exists");
      }

      return ctx.prisma.story.create({
        data: {
          title: story
            ? `${parsedMessage.title} ${story || ""}`
            : parsedMessage.title,
          description: parsedMessage.description,
          slug: parsedMessage.slug,
          imagePrompt: parsedMessage.image_prompt,
          categories: {
            connect: {
              id: category.id,
            },
          },
        },
      });
    }),
});
