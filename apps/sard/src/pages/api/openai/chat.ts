import { NextApiRequest, NextApiResponse } from "next";
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";
import cors from "@profits-gg/lib/cors";
import { ipRateLimit } from "@profits-gg/lib/ip-rate-limit";
import { prisma } from "~/server/db";

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
  const { category, place, userId, token } = (await req.json()) as {
    category: string;
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
    recaptchaResponse.hostname !==
      new URL(String(process.env.NEXTAUTH_URL)).hostname
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

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      stream: true,
      temperature: 0.8,
      top_p: 0.7,
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `
          act as a storyteller

          i want a title, description, url slug, image prompt for open ai dalle model and the content of the story

          the story category is ${category}

          the title should contain a character and a place

          ${place ? `the place is ${place}` : ""}

          the description should be short and contain the main story parts

          the character can be a person name, an animal, an inanimate
                                        
          use arabic for the title, slug and the content without translation

          the content length should be between 300 -  450 word and after every 5 words use a proper emoji 

          image prompt should use description with min 6 words and should be in english

          response structure example


          title
          #
          description
          #
          slug
          #
          image prompt
          #
          content

          response examples

          الأطفال و التلفاز الشرير
          #
          تلفاز شرير يمنع الأطفال من النوم
          #
          التلفاز-الشرير
          #
          wide white tv in a black room and children looking at it
          #
          كان هناك تلفاز شرير



          مدرسة الأطفال النائمة
          #
          مدرسة كل الأطفال فيها لا ينامون
          #
          مدرسة -لأطفال
          #
          sleepy children in a school 
          #
          في يوم من الأيام في احد المدارس
          `,
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
