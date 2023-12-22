import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const openaiRouter = createTRPCRouter({
  getImage: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        size: z.enum(["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]).default("512x512"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.openai.images.generate({
        model: "dall-e-2",
        prompt: "cartoonic, colorful and oil pastel painting of " + input.prompt,
        response_format: "b64_json",
        size: input.size,
      });

      if (!data?.data?.[0]?.b64_json) {
        throw new Error("No image");
      }

      return data.data[0].b64_json;
    }),
});
