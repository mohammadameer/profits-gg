import { z } from "zod";
import { OpenAIApi, Configuration } from "openai";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getOpenaiClient } from "~/server/openai";

export const openaiRouter = createTRPCRouter({
  chat: publicProcedure
    .input(
      z.object({
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const openai = await getOpenaiClient();

      const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: input.message,
          },
        ],
      });

      const { choices } = res.data;

      if (!choices || choices.length === 0) {
        throw new Error("No choices returned from OpenAI");
      }

      const firstChoice = choices[0];
      const message = firstChoice?.message?.content;

      if (!message) {
        throw new Error("No message returned from OpenAI");
      }

      return message;
    }),
});
