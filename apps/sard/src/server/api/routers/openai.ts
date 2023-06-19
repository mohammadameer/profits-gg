import { z } from "zod";
import { OpenAIApi, Configuration, CreateImageRequestSizeEnum } from "openai";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const openaiRouter = createTRPCRouter({
  getImage: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        size: z
          .nativeEnum(CreateImageRequestSizeEnum)
          .default(CreateImageRequestSizeEnum._256x256),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.openai.createImage({
        prompt:
          "cartoonic, colorful and oil pastel painting of " + input.prompt,
        response_format: "b64_json",
        size: input.size,
      });

      if (!data?.data?.data?.[0]?.b64_json) {
        throw new Error("No image");
      }

      return data.data.data[0].b64_json;
    }),
});
