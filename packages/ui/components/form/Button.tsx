import clsx from "clsx";
import type { FC } from "react";

export type ButtonProps = {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  noStyles?: boolean;
};

const Button: FC<ButtonProps> = ({
  text = "",
  onClick = () => null,
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  noStyles = false,
}) => {
  return (
    <button
      onClick={() => {
        if (!disabled || !loading) onClick();
      }}
      type={type}
      className={clsx(
        "rounded-lg px-6 py-4 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 ",
        noStyles ? "text-white hover:bg-white/20" : `bg-white text-black/80`,
        loading && "scale-95 cursor-wait opacity-80 hover:scale-95",
        disabled && "cursor-not-allowed opacity-80",
        className,
      )}
    >
      {loading ? <p>🪄</p> : <p>{text}</p>}
    </button>
  );
};

export default Button;
