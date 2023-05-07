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

const verifyRecaptcha = async (token: string) => {
  const secretKey = process.env.RECAPTCHA_V3_SECRET_KEY;

  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
    {
      method: "POST",
    }
  );

  return await response.json();
};

export default async function handler(req: Request) {
  const { message, token } = (await req.json()) as {
    message: string;
    token: string;
  };

  const recaptchaResponse = await verifyRecaptcha(token);

  if (!recaptchaResponse.success) {
    return new Response("Recaptcha failed", { status: 400 });
  }

  if (recaptchaResponse.score < 0.5) {
    return new Response("Recaptcha score too low", { status: 400 });
  }

  if (!message) {
    return new Response("Message is required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return cors(req, new Response(stream), {
    origin: process.env.NEXTAUTH_URL,
    methods: ["POST"],
  });
}
