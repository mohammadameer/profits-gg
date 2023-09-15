import Head from "next-multilingual/head";
import { useRouter } from "next-multilingual/router";

type SeoProps = {
  title: string;
  description: string;
  image?: string;
  url?: string;
  keywords?: string[];
  published_time?: string;
  modified_time?: string;
};

export default function SEO({
  title,
  description,
  image,
  url,
  keywords,
  published_time,
  modified_time,
}: SeoProps) {
  const { locale, locales } = useRouter();
  return (
    <Head>
      <title>{title}</title>
      <meta property="og:type" content="article" />

      <meta name="twitter:site" content={url} />
      <meta name="twitter:url" content={url} />
      <meta property="og:url" content={url} />

      {image ? (
        <>
          <meta name="twitter:image" content={image} />
          <meta property="og:image" content={image} />
        </>
      ) : null}

      <meta name="twitter:title" content={title} />
      <meta property="og:title" content={title} />

      <meta name="description" content={description} />
      <meta name="twitter:description" content={description} />
      <meta property="og:description" content={description} />

      <meta name="keywords" content={keywords?.join(", ")} />

      <meta property="og:site_name" content="Sard" />
      <meta property="og:locale" content={locale} />
      {locales?.map((locale) => <meta property="og:locale:alternate" content={locale} key={locale} />)}

      {published_time ? <meta property="og:article:published_time" content={published_time} /> : null}
      {modified_time ? <meta property="og:article:modified_time" content={modified_time} /> : null}

      <meta name="twitter:creator" content="maats_s" />

      <meta name="author" content="Sard" />
    </Head>
  );
}
