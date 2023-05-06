import { z } from "zod";
import { OpenAIApi, Configuration } from "openai";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const openaiRouter = createTRPCRouter({});
