import type { FC } from "react";
import { MdError } from "react-icons/md";
import { useTranslation } from "next-i18next";

type ErrorProps = {
  error: string | undefined;
};

const Error: FC<ErrorProps> = ({ error }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4">
      <MdError color="red" size={25} />
      <p className="text-red-500">{t(error ?? "")}</p>
    </div>
  );
};

export default Error;
