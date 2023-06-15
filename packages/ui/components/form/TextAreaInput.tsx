// utils
import { useController } from "react-hook-form";
import type {
  Path,
  FieldValues,
  Control,
  RegisterOptions,
} from "react-hook-form";

// components
import Error from "../Error";
import clsx from "clsx";

export type TextAreaInputProps<T extends FieldValues> = {
  label?: string;
  placeholder: string;
  name: Path<T>;
  rules?: Exclude<
    RegisterOptions,
    "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  defaultValue?: unknown;
  control?: Control<T>;
  className?: string;
  inputClassName?: string;
  height?: string;
};

export default function TextAreaInput<T extends FieldValues>({
  label = "",
  placeholder = "",
  name,
  control = undefined,
  rules = {},
  className = "",
  inputClassName = "",
  height = "h-10",
}: TextAreaInputProps<T>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <div
      className={clsx(
        "relative flex w-full flex-col gap-2 focus-within:border-white",
        className,
      )}
    >
      <label htmlFor={name} className="block">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder || label}
        value={value ?? ""}
        onChange={onChange}
        autoComplete="off"
        onBlur={onBlur}
        className={clsx(
          `h-10 w-full rounded-lg border border-gray-500 bg-gray-800 px-2 pb-4 outline-none focus:border-white ${
            error ? "border-red-500" : ""
          }`,
          height,
          inputClassName,
        )}
      />

      {error ? <Error error={error.message} /> : <div className="h-[25px]" />}
    </div>
  );
}
