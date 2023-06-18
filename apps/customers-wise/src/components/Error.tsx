import type { FC } from "react";

type ErrorProps = {
  error: string | undefined;
};

const Error: FC<ErrorProps> = ({ error }) => {
  return (
    <div className="flex items-center gap-4">
      <p>❗️</p>
      <p className="text-red-500">{error}</p>
    </div>
  );
};

export default Error;
