import { useMessages } from "next-multilingual/messages";
import { useRouter } from "next-multilingual/router";
import { useGetLocalizedUrl } from "next-multilingual/url";
import SEO from "~/components/SEO";

export default function StoryMainPage() {
  const router = useRouter();
  const { getLocalizedUrl } = useGetLocalizedUrl();

  const messages = useMessages();
  return (
    <>
      <SEO
        title={messages.format("title")}
        description={messages.format("description")}
        url={getLocalizedUrl(`/short-learning-stories-for-childrens/story`, router.locale, undefined, true)}
        keywords={[messages.format("title"), messages.format("description")]}
      />
      <div />
    </>
  );
}
