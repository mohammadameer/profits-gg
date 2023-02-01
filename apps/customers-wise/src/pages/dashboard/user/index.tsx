import { useRouter } from "next/router";
import Page from "../../../components/Page";

const pages = [
  // {
  //   title: "📝 بياناتي",
  //   link: "/dashboard/user/details",
  // },
  {
    title: "🏬 مؤسساتي",
    link: "/dashboard/user/organizations",
  },
];

export default function User() {
  const router = useRouter();
  return (
    <Page title="👤 حسابي">
      <div className="grid w-full grid-cols-12 gap-4">
        {pages.map((page) => (
          <div
            key={page.title}
            className="col-span-full h-48 cursor-pointer rounded-lg bg-white p-4 transition-all hover:scale-105 active:scale-95 md:col-span-4"
            onClick={() => router.push(page.link)}
          >
            <p className="select-none text-xl text-black/80">{page.title}</p>
          </div>
        ))}
      </div>
    </Page>
  );
}
