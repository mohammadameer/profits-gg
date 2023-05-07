import { NextApiRequest, NextApiResponse } from "next";
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";
import cors from "@profits-gg/lib/cors";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const config = {
  runtime: "edge",
};

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "1 d"),
});

export default async function handler(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  const identifier = xff ? xff.split(",")[0] : process.env.NEXTAUTH_URL;

  const { success } = await ratelimit.limit(identifier as string);

  if (!success) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  const { message } = (await req.json()) as {
    message: string;
  };

  if (!message) {
    throw new Error("No message provided");
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);

            const message = json.choices[0].delta.content;
            if (counter < 2 && (message?.match(/\n/) || []).length) {
              return;
            }
            const queue = encoder.encode(message);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks & invoke an event for each SSE event stream
      const parser = createParser(onParse);

      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return cors(req, new Response(stream), {
    origin: process.env.NEXTAUTH_URL,
    methods: ["POST"],
  });
}
