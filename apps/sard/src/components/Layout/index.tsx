import clsx from "clsx";
import Link from "next-multilingual/link";

import { normalizeLocale, setCookieLocale } from "next-multilingual";
import {
  type LocalizedRouteParameters,
  getLocalizedRouteParameters,
  useRouter,
} from "next-multilingual/router";
import { type KeyValueObject, slugify, useMessages } from "next-multilingual/messages";
import { getLanguageSwitcherUrl } from "next-multilingual/url";
import Head from "next-multilingual/head";
import { type GetStaticProps } from "next";

type DynamicRoutesIdTestsProps = {
  localizedRouteParameters: LocalizedRouteParameters;
};

const localeString = {
  "ar-sa": "سرد بالعربي",
  "en-us": "Sard in English",
};

export default function Layout({
  children,
  localizedRouteParameters,
}: {
  children: React.ReactNode;
  localizedRouteParameters: LocalizedRouteParameters;
}) {
  const router = useRouter();
  const { locale: currentLocale, locales } = router;

  const href = getLanguageSwitcherUrl(router);
  const messages = useMessages();

  return (
    <>
      <Head localizedRouteParameters={localizedRouteParameters}>
        {messages.format("title") && (
          <>
            <meta name="title" content={messages.format("title")} />
            <meta property="og:title" content={messages.format("title")} />
          </>
        )}
        {messages.format("description") && (
          <>
            <meta name="description" content={messages.format("description")} />
            <meta property="og:description" content={messages.format("description")} />
          </>
        )}
        {messages.format("keywords") && <meta name="keywords" content={messages.format("keywords")} />}
      </Head>
      <div
        className={clsx("flex min-h-screen flex-col bg-gray-200 transition-all duration-300")}
        style={{
          backgroundColor: "#e5e7eb",
        }}
        id="sard_page">
        <div className="flex w-full items-center justify-between p-6">
          <Link
            href="/"
            className="text transform cursor-pointer text-4xl font-bold text-gray-900 duration-300 hover:scale-105 active:scale-95 md:text-5xl">
            📖 {messages.format("logoText")}
          </Link>
          <Link
            href="/short-learning-stories-for-childrens/story/new-and-special-story-for-your-children"
            className="text h-auto rounded-lg bg-blue-500 px-6 py-4 text-center font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 active:scale-95">
            {messages.format("newStory")} 🪄
          </Link>
        </div>
        {children}
        <div className="flex flex-col items-center justify-between gap-8 p-4 lg:flex-row">
          <div className="flex gap-4">
            <Link href="/">{messages.format("mainPage")}</Link>
            <Link href="/blog">{messages.format("blog")}</Link>
          </div>
          <div className="flex gap-4">
            {locales
              ?.filter((locale) => locale !== currentLocale)
              .map((locale) => {
                const normalizedLocale = normalizeLocale(locale);

                return (
                  <Link
                    key={locale}
                    className="text text-center font-bold text-gray-900"
                    href={href}
                    locale={locale}
                    lang={normalizedLocale}
                    hrefLang={normalizedLocale}
                    localizedRouteParameters={localizedRouteParameters}
                    onClick={() => {
                      setCookieLocale(locale);
                      document.body.dir = locale === "ar-sa" ? "rtl" : "ltr";
                    }}>
                    {(localeString as KeyValueObject)[locale]}
                  </Link>
                );
              })}
          </div>
          <div className="flex gap-4">
            <p>{messages.format("contactUs")}</p>
            <a
              id="email"
              className="text text-center font-bold text-gray-900"
              href="mailto:mohammad@sard.dev">
              {messages.format("email")}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<DynamicRoutesIdTestsProps> = async (context) => {
  const localizedRouteParameters = getLocalizedRouteParameters(
    context,
    {
      id: context.params?.id as string,
    },
    import.meta.url
  );

  return { props: { localizedRouteParameters } };
};
