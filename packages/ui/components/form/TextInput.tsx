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

export type TextInputProps<T extends FieldValues> = {
  label: string;
  placeholder?: string;
  name: Path<T>;
  rules?: Exclude<
    RegisterOptions,
    "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  defaultValue?: unknown;
  control?: Control<T>;
  className?: string;
  autoComplete?: "false" | "true";
};

export default function TextInput<T extends FieldValues>({
  label = "",
  placeholder = "",
  name,
  control = undefined,
  rules = {},
  className = "",
  autoComplete = "false",
}: TextInputProps<T>) {
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
      <input
        id={name}
        name={name}
        placeholder={placeholder || label}
        value={value ?? ""}
        onChange={onChange}
        autoComplete={autoComplete}
        onBlur={onBlur}
        className={`h-10 w-full rounded-lg border border-gray-500 bg-gray-800 px-2 outline-none focus:border-white ${
          error ? "border-red-500" : ""
        }`}
      />

      {error ? <Error error={error.message} /> : <div className="h-[25px]" />}
    </div>
  );
}
