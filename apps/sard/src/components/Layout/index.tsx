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
import { Button, Modal } from "@profits-gg/ui";
import { useState } from "react";

type DynamicRoutesIdTestsProps = {
  localizedRouteParameters: LocalizedRouteParameters;
};

const localeString = {
  "ar-sa": "العربية",
  "en-us": "English",
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

  const [isChooseLanguageOpen, setIsChooseLanguageOpen] = useState(false);

  const href = getLanguageSwitcherUrl(router);
  const messages = useMessages();

  return (
    <>
      <Head localizedRouteParameters={localizedRouteParameters}>
        <></>
      </Head>
      <div
        className={clsx(
          "flex min-h-screen flex-col bg-gray-200 transition-all duration-300",
          isChooseLanguageOpen ? "blur-sm" : ""
        )}
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
          <Button text="English/عربي" onClick={() => setIsChooseLanguageOpen(true)} />
        </div>
        {children}
        <div className="flex flex-col items-center justify-between gap-8 p-4 lg:flex-row">
          <div className="flex gap-4">
            <Link href="/">{messages.format("mainPage")}</Link>
            <Link href="/blog">{messages.format("blog")}</Link>
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

      <Modal
        open={isChooseLanguageOpen}
        setOpen={setIsChooseLanguageOpen}
        onClose={() => {
          setIsChooseLanguageOpen(false);
        }}
        bottomModal={true}
        className="bg-white">
        <div className="mt-2 flex w-full flex-col">
          {locales?.map((locale) => {
            const normalizedLocale = normalizeLocale(locale);

            return (
              <Link
                key={locale}
                className={clsx(
                  "text w-full rounded-md p-4 text-center font-bold text-gray-900",
                  locale === currentLocale ? "bg-blue-500 text-white " : ""
                )}
                href={href}
                locale={locale}
                lang={normalizedLocale}
                hrefLang={normalizedLocale}
                localizedRouteParameters={localizedRouteParameters}
                onClick={() => {
                  setCookieLocale(locale);
                  document.body.dir = locale === "ar-sa" ? "rtl" : "ltr";
                  setIsChooseLanguageOpen(false);
                }}>
                {(localeString as KeyValueObject)[locale]}
              </Link>
            );
          })}
        </div>
      </Modal>
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
