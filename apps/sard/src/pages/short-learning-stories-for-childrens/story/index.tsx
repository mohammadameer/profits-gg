import Head from "next-multilingual/head";
import { useMessages } from "next-multilingual/messages";

export default function StoryMainPage() {
  const messages = useMessages();
  return (
    <>
      <Head>
        <title>{messages.format("title")}</title>
        <meta name="description" content={messages.format("description")} />
        <meta property="og:title" content={messages.format("title")} />
        <meta
          property="og:description"
          content={`${messages.format("story")} ${messages.format("description")}`}
        />
      </Head>
      <div />
    </>
  );
}
