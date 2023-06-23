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

          - you should return a title, description, url slug, image prompt for open ai dalle model and the content of the story
          - story should be around a character and be fantastical, with set up, with plot twist, with rising action, with monomyth,  with False start , with Converging ideas , with Sparklines , with dramatic climax, with falling actions, end with resolution
          - the description should be short and contain the main story parts
          - the character can be a person name, an animal, an inanimate
          - use arabic for the title, slug and the content without translation
          - the content length should be between 200 -  350 word and after every 5 words use a proper emoji 
          - image prompt should use description with min 10 words and should be in english
          - use simple language
          `,
        },
        {
          role: "user",
          content: `story for childrens and is about bravery`,
        },
        {
          role: "assistant",
          content: `
          قصة عن الشجاعة
          #
          الفتاة و البحر المجهول
          #
          فتاة شابة شجاعة تضرب في المجهول وتجد السعادة والثقة في نفسها
          #
          الفتاة-والبحر-المجهول
          #
          a silhouette of a girl on a cliff with a view of the sea
          #
          كانت فاطمة تعيش في قرية صغيرة على الشاطئ 🏖️. كانت القرية حيوية ومليئة بالمغامرات، ولكن فاطمة أرادت المزيد! 🌟

          كانت فاطمة جريئة وطموحة 😊. أرادت استكشاف العالم وتحقيق أحلامها الكبيرة. لكنها كانت قلقة ومترددة. 😰

          لكنها قررت أخيرًا المغادرة! ⛵️ واجهت تحديات كثيرة وتعلمت الكثير. 🌍

          في إحدى الأيام، تعرضت فاطمة لإعصار مرعب! 🌪️ ولكنها لم تستسلم. استخدمت قوتها الخارقة وتغلبت عليه! 💪

          أصبحت فاطمة بطلة البحار 🌟🌊. عادت للقرية محملة بالمغامرات وأصبحت رمزًا للشجاعة والقوة 💖.

          فاطمة أدركت قوتها وتصميمها القوي. وقالت: "أستطيع تحقيق أي حلم!" ✨`,
        },
        {
          role: "user",
          content: `story for childrens and is about cooperation`,
        },
        {
          role: "assistant",
          content: `
          قصة عن المساعدة
          #
          الرجل العجوز و الأوراق المتناثرة
          #
          فأر يساعد رجل عجوز في مهمته
          #
          الرجل-العجوز-و-الأوراق-المتناثرة
          #
          old wooden desk with papers and a mouse on it
          #
          جلس العجوز في غرفته 🏠 وعج بالورق والأوراق المتناثرة. كان يحتاج لمساعدة! 🤔

          فجأة، رأى فأرًا صغيرًا 🐭 يتسلل بين الأثاث. فكر في فكرة مجنونة! 🤪

          "ممكن تساعدني؟" قال للفأر. 🐭💭

          الفأر فهم وأخذ الورقة التي كتبها العجوز. قرأها بعناية وبدأ في ترتيب الأوراق. 👏

          عمل الفأر بجد واتقان! 🤩 في النهاية، أصبحت الغرفة منظمة وجميلة. 📚💼

          العجوز شعر بالامتنان والدهشة. أدرك أن المساعدة يمكن أن تأتي من أماكن غير متوقعة. 🙏❤️

          منذ ذلك الحين، أصبح العجوز أكثر تسامحًا وتقديرًا للآخرين. تركت قصة الفأر أثرًا في قلبه. 💖✨`,
        },
        {
          role: "user",
          content: `story for childrens and is about curiosity`,
        },
        {
          role: "assistant",
          content: `
          قصة عن الفضول
          #
          حلم الفضاء
          #
          قصة عن فتاة تُدعى زينب تمتلك فضولًا لا يشبه أي شيء آخر وتسعى لاكتشاف أسرار الفضاء بمفردها.
          #
          حلم-الفضاء
          #
          an illustration of a girl in a spacesuit, gazing at the stars
          #
          زينب تعشق المغامرات والتحديات التي تواجهها في حياتها اليومية. 🌟

          لديها فضول شديد لا يشبه أي شيء آخر. كانت تسأل نفسها دائمًا: "ماذا سيحدث إذا سافرت إلى الفضاء؟" 🚀

          بينما كانت تحب القراءة عن الكواكب والنجوم، كان لديها رغبة حقيقية في رؤيتها بنفسها. 💫

          تاركة خيالها يسافر بعيدًا، قررت زينب القيام بالمستحيل. حزمت حقيبة صغيرة وأعدت السفر إلى الفضاء! 🧳✨

          عندما وصلت زينب إلى الفضاء، وجدت نفسها مذهولة من الجمال والسكون الذي يحيط بها. كانت النجوم أكثر بريقًا وجمالًا مما تصورت. 🌠

          استمتعت زينب بتجربة الإطلاق في الفضاء وتمكنت من العوم في الفضاء الخارجي. شعرت بأنها حرة مثل الطيور في السماء. 🐦

          سافرت زينب من كوكب إلى آخر واستكشفت الكواكب وأشماسها وأقمارها. لقد كانت رحلة استكشاف ممتعة ومذهلة! 🪐🚀

          عندما عادت زينب إلى الأرض، شعرت بأنها أكثر إلهامًا وتفاؤلا. أدركت أن الفضول والاستكشاف هما مفتاح للتعلم والنمو الشخصي. 🌍🔍

          تذكرت زينب دائمًا أن العالم كبير ومليء بالأشياء الجميلة والمدهشة. وسعت بطموح لمواصلة الكشف عن الأسرار التي يخبئها الفضاء. ✨🔭`,
        },
        {
          role: "user",
          content: `story for childrens and is about self-confidence`,
        },
        {
          role: "assistant",
          content: `
          قصة عن الثقة بالنفس
          #
          الفأر الشجاع
          #
          فأر شجاع يجد الثقة في نفسه ويواجه تحدياته بشجاعة
          #
          الفأر-الشجاع
          #
          a small mouse standing on its hind legs with a determined expression
          #
          كان هناك فأر صغير يدعى عبد اللطيف. كان عبد اللطيف خجولًا وغير واثق من نفسه. 🐭😔

          عندما يواجه عبد اللطيف تحديات صغيرة، كان يشعر بالخوف والقلق. لكن كان لديه رغبة في تغيير ذلك! 💪💖

          قرر عبد اللطيف البحث عن الثقة في نفسه والتغلب على خوفه. قال في نفسه: "أنا شجاع، ويمكنني فعل أي شيء!" 🌟😊

          أول مغامرة لعبد اللطيف كانت مواجهة قطة كبيرة ومخيفة. تردد قليلاً في البداية، ولكنه استخدم شجاعته وواجهها بثقة! 🐈💥

          عندما رأت القطة الشجاعة والثقة في عيني عبد اللطيف، فرت بعيدًا. كانت تعترف بأن عبد اللطيف أصبح فأرًا شجاعًا! 😼✨

          مع مرور الوقت، أصبح عبد اللطيف شجاعًا أكثر وأكثر. أصبح قادرًا على مواجهة كل التحديات التي تعترض طريقه. 🌟💪

          وبدلاً من الخوف، أصبح يشعر بثقة كلما واجه تحديًا جديدًا. أدرك أنه يمكنه تحقيق المستحيل إذا كان يؤمن بنفسه. 💖

          فأصبحت قصة عبد اللطيف قصة الشجاعة والثقة لجميع الفئران الصغيرة في الغابة. كل من يسمع قصته، يدرك أنه يمكنهم الوقوف بثقة وجرأة أمام التحديات! 📚🌟`,
        },
        {
          role: "user",
          content: `story for childrens and is about cooperation`,
        },
        {
          role: "assistant",
          content: `
          قصة عن التعاون
          #
          محمد والغابة
          #
          شاب يكتشف القوة في التعاون والمساعدة مع الحيوانات في الغابة.
          #
          محمد-و-الغابة
          #
          a young man surrounded by wolves in a  forest
          #
          كان هناك مرة شاب يدعى محمد 🌺. كان يعيش في قرية صغيرة قرب الغابة السحرية 🌳. محمد كان شغوف جدا بالطبيعة والحيوانات 🌿🦋.

          في يوم من الأيام، قرر محمد استكشاف الغابة السحرية 🌲. كانت الغابة مليئة بالمخلوقات السحرية والأشجار الضخمة. كان  خائف قليلا ولكنه كان شجاعا 💪.

          أثناء تجواله في الغابة، صادف محمد ذئبًا يحتاج إلى مساعده. الذئب يعاني من إصابة في قدمه ولا يستطيع التحرك. توجه محمد بسرعة لمساعدته 🐺✨.

          باستخدام مهاراته ومعرفته قام محمد بعلاج جرح الذئب ومساعدته على الوقوف على قدميه مرة أخرى. شكر الذئب محمد على مساعدته وعرض عليه الانضمام  ليكون صديقه 🐺❤️.

          محمد والذئب ساروا سويًا في الغابة، وأثناء رحلتهم وجدوا  غزال صغير يحتاج إليهم. كان الغزال عالقًا في شجرة عالية ولا يمكنه النزول 🔝🦌.

          برغم التحدي، قرر محمد والذئب مساعدة الغزال. تعاونوا معًا: صعد ممحد الشجرة وأمسك بالغزال وساعده الذئب ، ونجحوا في إنزال الغزال بسلام وسط فرحة عارمة 🌟🌳❤️.

          ومنذ ذلك الحين، أصبحوا أصدقاء مقربين. يعيشون سويًا في الغابة ويتعاونون معًا لمساعدة الحيوانات الأخرى وحماية الطبيعة. أدرك محمد أن التعاون قوة حقيقية وأنه يمكنه تحقيق الكثير عن طريق مساعدة الآخرين 🤝💖🌿.`,
        },
        {
          role: "user",
          content: `story for childrens and is about Hard Work`,
        },
        {
          role: "assistant",
          content: `
          قصة عن العمل الجاد
          #
          عمار ولعبة الطائرة
          #
          فتى يتعلم قيمة العمل الجاد من خلال ممارسة رياضة الطائرة وبذل الجهد لتحقيق أحلامه.
          #
          عمار-و-لعبة-الطائرة
          #
          a boy practicing volleyball with determination in a gym
          #
          كان هناك صبي يدعى عمار. كان يحب لعب كرة الطائرة منذ الصغر. كان يشاهد اللاعبين المحترفين ويحلم بأن يصبح مثلهم يوماً ما. 🏐💪
          
          لكن عمار عرف أنه لن يتحقق حلمه بسهولة. عليه أن يعمل بجد ويمارس بانتظام ليتطور ويصبح لاعبًا جيدًا. 🏋️‍♂️🤸‍♂️

          استيقظ عمار في الصباح الباكر وذهب إلى الصالة الرياضية. بدأ بتدريباته اليومية، يمارس الضربات والتمريرات ويعمل على تحسين مهاراته. 💦🏐

          لكن لم يكن الطريق سهلاً. كانت هناك لحظات من الإرهاق والإحباط، ولكن عمار واصل العمل بجد وتحمل التحديات. رأى الجهد المستمر نتائجه الإيجابية. 👏✨

          بمرور الوقت، أصبح أحمد لاعبًا مميزًا وقويًا. قاد فريقه إلى العديد من الانتصارات وحصد الكثير من الجوائز. كانت اللعبة تعلمه الصبر والتحمل وأهمية العمل الجاد. 🌟🤝

          صارح عمار الآخرين بأن النجاح لا يأتي بالصدفة، بل يأتي من خلال تحقيق الأهداف والعمل الجاد. بدأ يلهم الآخرين للعمل بجد ومتابعة أحلامهم. 💖💪

          وبهذه الطريقة، أثرت قصة عمار على حياة العديد من الأشخاص، حيث تذكروا دائمًا أهمية العمل الجاد والاجتهاد في تحقيق أحلامهم. 🌟💼

          عمار أدرك أن العمل الجاد هو المفتاح للنجاح والتحقيق. وبفضل العزيمة والجهود الطويلة، يمكنك تجاوز العقبات وتحقيق أحلامك أيضًا.💪`,
        },
        {
          role: "user",
          content: `story for childrens and is about ${category}`,
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
