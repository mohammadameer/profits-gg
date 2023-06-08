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
      temperature: 1,
      top_p: 1,
      max_tokens: 1100,
      messages: [
        {
          role: "system",
          content: `
          act as a storyteller

          - i want a title, description, url slug, image prompt for open ai dalle model and the content of the story
          - the story category is ${category}
          - the title should contain a character and a place
          - the description should be short and contain the main story parts
          - the character can be a person name, an animal, an inanimate
          - use arabic for the title, slug and the content without translation
          - the content length should be between 300 -  450 word and after every 5 words use a proper emoji 
          - image prompt should use description with min 6 words and should be in english

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
          #كانت ليلى تعيش في قرية صغيرة تقع على ساحل البحر الأبيض المتوسط. كانت القرية مزدهرة بالحياة والنشاطات البحرية، ولكن ليلى كان لديها حلم كبير يدور حول استكشاف قدراتها وتحقيق إنجازات عظيمة خارج حدود القرية التقليدية. كانت تتطلع إلى اكتشاف ما وراء الأفق واكتشاف المجهول.

          كانت ليلى فتاة جريئة وطموحة، لكنها كانت تعاني من قلق وشك في نفسها. ترددت لفترة طويلة قبل أن تقرر أخيرًا مغادرة القرية والخروج في رحلة إلى البحر المجهول. كانت تشعر بخوف شديد وحيرة عندما رأت امتداد البحر الشاسع أمامها والسماء الصافية الزرقاء. ومع ذلك، تذكرت الحلم الذي دفعها لهذه الرحلة وأصبحت واثقة من قدراتها.

          بدأت ليلى مغامرتها في البحر المجهول. في كل مرة تتغلب فيها على تحديات مخيفة، تكتسب المزيد من الثقة في نفسها. اكتشفت أنها تمتلك قوة داخلية لا تعرف عنها، وعزمًا لا يعرف الاستسلام. مرت الأيام والليالي، ومع كل خطوة تقدمها، زادت تجربتها واكتسبت حكمة جديدة.

          وفي أحد الأيام، وقفت ليلى أمام تحدي غير متوقع. كان هناك إعصار قوي يقترب منها، وكانت محاصرة بينه وبين الشاطئ. تواجهت ليلى بصعوبة في البداية، ولكنها لم تفقد الأمل. فجأة، تشكلت سحابة غامضة فوق رأسها، وظهرت لها قوة غير معتادة. استخدمت هذه القوة للتصدى للإ

          عصار وتفريقه.

          كانت هذه اللحظة هي منعطف القصة الذي لم يكن ليلى تتوقعه. اكتشفت قدراتها الخارقة وأصبحت بطلة في عالم السحر والقوى الخارقة. ومع ذلك، لم تتغير شخصيتها الحقيقية. بقيت ليلى الفتاة الجريئة والطموحة، ولكنها اكتشفت قوة جديدة في داخلها تضاعف إصرارها على مواصلة الاستكشاف والمغامرة.

          بعد هذه التجربة، عادت ليلى إلى قريتها محملة بالمغامرات والذكريات الثمينة. قصتها انتشرت في القرية وأصبحت مصدر إلهام للأجيال القادمة. أصبحت ليلى رمزًا للشجاعة والإصرار والقوة.

          وكانت هذه الرحلة ليلى تعبيرًا حيًا عن صوتها الشخصي. خلالها، تمكنت من تجاوز تحدياتها الداخلية والخارجية وكشفت عن نفسها الحقيقية وقدراتها المذهلة.

          "الآن أعلم أنني قادرة على تحقيق أي حلم يملكه قلبي، ولن أتوقف أبدًا عن السعي لتحقيقه"، قالت ليلى بفخر.



          الفأر و الرجل العجوز
          #
          فأر يساعد رجل عجوز في مهمته
          #
          الفأر-و-الرجل-العجوز
          #
          old wooden desk with papers and a mouse on it
          #
          كان الرجل العجوز يجلس في غرفته الصغيرة، محاطًا بأوراق ومستندات متناثرة. كان يحتاج إلى مساعدة لترتيب كل هذا الفوضى. وفي تلك اللحظة، لاحظ حركة صغيرة في الزاوية. كان هناك فأر يتسلل بين الأثاث.

          الرجل العجوز لم يكن يشعر بالراحة تجاه الفئران، لكن هذا الفأر كان مختلفًا. كان يحمل ورقة بين فكيه ويبدو أنه يحاول أن يعلمها. فكر الرجل العجوز في فكرة مجنونة - ربما يمكن أن يساعده الفأر في ترتيب الأوراق وإعادة النظام إلى غرفته المحترفة.

          "مرحبًا يا صغير، هل يمكنك مساعدتي؟" قال الرجل العجوز بصوت ودي للفأر.

          وبشكل مدهش، توقف الفأر ونظر إلى الرجل العجوز بعيونه الحمراء الصغيرة. بدا وكأنه يفهم ما يقوله.

          الرجل العجوز أمسك بقلم ورقة فارغة وبدأ في كتابة تعليمات بسيطة للفأر. ثم قام بإلقاء الورقة أمام الفأر وأعطاه إشارة بيده ليقرأها.

          فأخذ الفأر الورقة بين يديه الصغيرتين وبدأ يراجعها بدقة. ثم، بدأ يسحب الأوراق المتناثرة ويوضعها في أماكنها المناسبة، مثلما ورد في التعليمات. كان الفأر يعمل بجد وببراعة مدهشة.

          تجاوزت الفأر توقعات الرجل العجوز. لم يكن مجرد فأر عادي، بل كان يمتلك ذكاءً ومهارات استثنائية. قام بترتيب كل شيء بدقة واتقان، وبعد وقت قصير، تحوَّلت الفوضى إلى غرفة منظمة ومرتبة.

          عندما انتهى الفأر من المهمة، نظر إلى الرجل العجوز بابتسامة صغيرة على وجهه، ثم اختفى في زاوية الغرفة.

          صدم الرجل العجوز ولكنه أحس بالامتنان العميق نحو الفأر الذي أنقذه من الفوضى. أدرك أن العالم مليء بالمفاجآت وأن القوة والمساعدة يمكن أن تأتي من أماكن غير متوقعة.

          منذ ذلك الحين، أصبح الرجل العجوز أكثر تسامحًا وتقديرًا للمختلف والفريد في العالم. وتركت قصة الفأر العجيبة أثرًا في قلبه، مشيرًا إلى أن العمر لا يحد من القدرات والمساهمة في جعل العالم أفضل.
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
