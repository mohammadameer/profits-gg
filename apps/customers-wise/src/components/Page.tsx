import clsx from "clsx";
import { useRouter } from "next/router";
import type { FC } from "react";
import type { ButtonProps } from "./form/Button";
import Button from "./form/Button";

type page = {
  title: string;
  link: string;
};

type PageProps = {
  children: React.ReactNode;
  title?: string | undefined;
  description?: string;
  buttons?: ButtonProps[];
  isLoading?: boolean;
  loadingComponent?: () => JSX.Element;
  filterComponent?: () => JSX.Element;
  backTitle?: string;
  backButton?: boolean;
  pages?: page[];
  className?: string;
};

const Page: FC<PageProps> = ({
  children,
  title,
  description,
  buttons,
  isLoading,
  loadingComponent = null,
  filterComponent = null,
  backTitle = "الصفحة السابقة",
  backButton = false,
  pages = [],
  className = "",
}) => {
  const router = useRouter();

  return (
    <div className={clsx("flex w-full grow flex-col", className)}>
      {backButton ? (
        <div
          className="cursor-pointer transition-all duration-200 active:scale-95"
          onClick={() => router.back()}
        >
          <p>➡️ {backTitle}</p>
        </div>
      ) : null}
      <div className="flex flex-col items-start justify-between gap-4 pl-2 md:flex-row md:items-start">
        <div className="flex flex-col">
          {pages.length > 0 ? (
            <div className="flex flex-wrap items-center gap-4 md:gap-2">
              {pages.map((page) => (
                <>
                  <p
                    className="cursor-pointer text-2xl transition-all hover:scale-105 active:scale-95"
                    onClick={() => router.push(page.link)}
                  >
                    {page.title}
                  </p>
                  <p className="text-2xl last:hidden">⬅️</p>
                </>
              ))}
            </div>
          ) : (
            <>{title ? <p className="text-2xl">{title}</p> : null}</>
          )}
          {description ? (
            <p className="mt-2">{description}</p>
          ) : (
            <p className="mt-2"> </p>
          )}
        </div>
        {buttons?.length ? (
          <>
            {buttons.map((button, index) => (
              <Button key={index} className="w-full md:w-auto" {...button} />
            ))}
          </>
        ) : (
          <div className="h-[56px] w-2" />
        )}
      </div>
      {filterComponent ? filterComponent() : null}
      <div className="mt-8 flex grow flex-col px-2 pb-10 ">
        {isLoading && loadingComponent ? loadingComponent() : children}
      </div>
    </div>
  );
};

export default Page;
