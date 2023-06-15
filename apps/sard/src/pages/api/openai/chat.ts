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
      model: "gpt-3.5-turbo-16k",
      stream: true,
      temperature: 1,
      top_p: 1,
      max_tokens: 1100,
      messages: [
        {
          role: "system",
          content: `
          act as a storyteller for children

          - i want a title, description, url slug, image prompt for open ai dalle model and the content of the story
          - the story is for childrens and is about ${category}
          - the description should be short and contain the main story parts
          - the character can be a person name, an animal, an inanimate
          - use arabic for the title, slug and the content without translation
          - the content length should be between 200 -  350 word and after every 5 words use a proper emoji 
          - image prompt should use description with min 10 words and should be in english

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

          الفتاة و البحر المجهول
          #
          فتاة شابة شجاعة تضرب في المجهول وتجد السعادة والثقة في نفسها
          #
          الفتاة-والبحر-المجهول
          #
          a silhouette of a girl on a cliff with a view of the sea
          #
          كانت ليلى تعيش في قرية صغيرة على الشاطئ 🏖️. كانت القرية حيوية ومليئة بالمغامرات، ولكن ليلى أرادت المزيد! 🌟

          كانت ليلى جريئة وطموحة 😊. أرادت استكشاف العالم وتحقيق أحلامها الكبيرة. لكنها كانت قلقة ومترددة. 😰

          لكنها قررت أخيرًا المغادرة! ⛵️ واجهت تحديات كثيرة وتعلمت الكثير. 🌍

          في إحدى الأيام، تعرضت ليلى لإعصار مرعب! 🌪️ ولكنها لم تستسلم. استخدمت قوتها الخارقة وتغلبت عليه! 💪

          أصبحت ليلى بطلة البحار 🌟🌊. عادت للقرية محملة بالمغامرات وأصبحت رمزًا للشجاعة والقوة 💖.

          ليلى أدركت قوتها وتصميمها القوي. وقالت: "أستطيع تحقيق أي حلم!" ✨



          الفأر و الرجل العجوز
          #
          فأر يساعد رجل عجوز في مهمته
          #
          الفأر-و-الرجل-العجوز
          #
          old wooden desk with papers and a mouse on it
          #
          جلس العجوز في غرفته 🏠 وعج بالورق والأوراق المتناثرة. كان يحتاج لمساعدة! 🤔

          فجأة، رأى فأرًا صغيرًا 🐭 يتسلل بين الأثاث. فكر في فكرة مجنونة! 🤪

          "ممكن تساعدني؟" قال للفأر. 🐭💭

          الفأر فهم وأخذ الورقة التي كتبها العجوز. قرأها بعناية وبدأ في ترتيب الأوراق. 👏

          عمل الفأر بجد واتقان! 🤩 في النهاية، أصبحت الغرفة منظمة وجميلة. 📚💼

          العجوز شعر بالامتنان والدهشة. أدرك أن المساعدة يمكن أن تأتي من أماكن غير متوقعة. 🙏❤️

          منذ ذلك الحين، أصبح العجوز أكثر تسامحًا وتقديرًا للآخرين. تركت قصة الفأر أثرًا في قلبه. 💖✨
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
