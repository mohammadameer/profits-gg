import clsx from "clsx";
import type { FC } from "react";

export type ButtonProps = {
  id?: string;
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  styles?: React.CSSProperties;
  noStyles?: boolean;
  printHidden?: boolean;
};

const Button: FC<ButtonProps> = ({
  id = "",
  text = "",
  onClick = () => null,
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  styles = {},
  noStyles = false,
  printHidden = false,
}) => {
  const hiddenProperties = printHidden
    ? { "data-html2canvas-ignore": true }
    : {};
  return (
    <button
      id={id}
      onClick={(e) => {
        if (!disabled && !loading) onClick(e);
      }}
      type={type}
      style={{ ...styles, ...(noStyles ? {} : styles) }}
      className={clsx(
        "rounded-lg px-6 py-4 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 ",
        noStyles ? "text-white hover:bg-white/20" : `bg-white text-black/80`,
        loading && "scale-95 cursor-wait opacity-80 hover:scale-95",
        disabled && "cursor-not-allowed opacity-80",
        className,
      )}
      // if printHidden is true, the button will not be printed
      {...hiddenProperties}
    >
      {loading ? "🪄" : text}
    </button>
  );
};

export default Button;
