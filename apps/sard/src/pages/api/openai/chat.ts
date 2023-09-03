import { NextApiRequest, NextApiResponse } from "next";
import { ParsedEvent, ReconnectInterval, createParser } from "eventsource-parser";
import cors from "@profits-gg/lib/cors";
import { ipRateLimit } from "@profits-gg/lib/ip-rate-limit";
import { prisma } from "~/server/db";
import names from "~/utils/ar-SA.names";
import responsesLocales from "~/utils/responsesLocales";

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
  const { language, category, characterName, place, userId, token } = (await req.json()) as {
    language: string;
    category: string;
    characterName: string;
    token: string;
    place: string;
    userId: string;
  };

  const recaptchaResponse = await verifyRecaptcha(token);

  let res;

  if (userId) {
    res = await ipRateLimit(
      req,
      userId,
      1,
      60 // 1 minute
    );
  } else {
    res = await ipRateLimit(req);
  }

  if (res.status !== 200) return res;

  if (!recaptchaResponse.success) {
    return new Response("Recaptcha failed", { status: 400 });
  }

  if (
    process.env.NODE_ENV === "production" &&
    recaptchaResponse.hostname !== new URL(String(process.env.NEXTAUTH_URL)).hostname
  ) {
    return new Response("Recaptcha hostname mismatch", { status: 400 });
  }

  if (recaptchaResponse.score < 0.5) {
    return new Response("Recaptcha score too low", { status: 400 });
  }

  if (!category) {
    return new Response("Category is required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const locals = {
    "ar-sa": "اللغة العربية - اللهجة السعودية",
    "en-us": "English - United States",
  };

  const local = locals[language as keyof typeof locals];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-16k",
      stream: true,
      temperature: 1.08,
      top_p: 1,
      max_tokens: 1100,
      messages: [
        {
          role: "system",
          content: `
          act as a storyteller for children

          - you should return a title, description, url slug, image prompt for open ai dalle model and the content of the story
          - story should be around a character and be fantastical, with set up, with plot twist, with rising action, with monomyth,  with False start , with Converging ideas , with Sparklines , with dramatic climax, with falling actions, end with resolution
          - the description should be short and contain the main story parts
          - the character can be a person name, an animal, an inanimate
          - use ${local} for the title, slug and the content without translation
          - the content length should be between 200 -  350 word and after every 5 words use a proper emoji 
          - image prompt should use description with min 10 words and should be in english
          - use simple language and simple words for childrens
          - if possible choose part of category not the whole category
          `,
        },
        {
          role: "user",
          content: `story for childrens to learn about bravery and character name is ${responsesLocales[
            language as keyof typeof responsesLocales
          ][0]?.name}`,
        },
        {
          role: "assistant",
          content: responsesLocales[language as keyof typeof responsesLocales][0]?.story,
        },
        {
          role: "user",
          content: `story for childrens to learn about cooperation and character name is الرجل ${responsesLocales[
            language as keyof typeof responsesLocales
          ][1]?.name}`,
        },
        {
          role: "assistant",
          content: responsesLocales[language as keyof typeof responsesLocales][1]?.story,
        },
        {
          role: "user",
          content: `story for childrens to learn about curiosity and character name is ${responsesLocales[
            language as keyof typeof responsesLocales
          ][2]?.name}`,
        },
        {
          role: "assistant",
          content: responsesLocales[language as keyof typeof responsesLocales][2]?.story,
        },
        {
          role: "user",
          content: `story for childrens to learn about self-confidence and character name is عبد ${responsesLocales[
            language as keyof typeof responsesLocales
          ][3]?.name}`,
        },
        {
          role: "assistant",
          content: responsesLocales[language as keyof typeof responsesLocales][3]?.story,
        },
        {
          role: "user",
          content: `story for childrens to learn about cooperation and character name is ${responsesLocales[
            language as keyof typeof responsesLocales
          ][4]?.name}`,
        },
        {
          role: "assistant",
          content: responsesLocales[language as keyof typeof responsesLocales][4]?.story,
        },
        {
          role: "user",
          content: `story for childrens to learn about Hard Work and character name is ${responsesLocales[
            language as keyof typeof responsesLocales
          ][5]?.name}`,
        },
        {
          role: "assistant",
          content: responsesLocales[language as keyof typeof responsesLocales][5]?.story,
        },
        {
          role: "user",
          content: `story for childrens to learn about ${category} and character name is ${characterName}`,
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
