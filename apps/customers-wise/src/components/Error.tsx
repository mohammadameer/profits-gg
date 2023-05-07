import type { FC } from "react";
import { MdError } from "react-icons/md";

type ErrorProps = {
  error: string | undefined;
};

const Error: FC<ErrorProps> = ({ error }) => {
  return (
    <div className="flex items-center gap-4">
      <MdError color="red" size={25} />
      <p className="text-red-500">{error}</p>
    </div>
  );
};

export default Error;
