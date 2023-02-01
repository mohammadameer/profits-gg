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
import { useEffect, useRef, useState } from "react";

type TextInputProps<T extends FieldValues> = {
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

const VERIFY_CODE_LENGTH = 4;

export default function CodeInput<T extends FieldValues>({
  label = "",
  placeholder = "",
  name,
  control = undefined,
  rules = {},
  className = "",
  autoComplete = "false",
}: TextInputProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control, rules });

  const [focused, setFocused] = useState<boolean>(false);

  useEffect(() => {
    if (inputRef) {
      inputRef?.current?.focus();
    }
  }, []);

  return (
    <div
      className={clsx(
        "relative flex w-full flex-col gap-2 focus-within:border-white",
        className
      )}
    >
      <label htmlFor={name} className="block">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= VERIFY_CODE_LENGTH) {
            onChange(e.target.value);
          }
        }}
        autoComplete={autoComplete}
        className="absolute top-0 left-0 -z-50 bg-transparent text-transparent caret-transparent outline-none"
        ref={inputRef}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      <div className="flex flex-col items-center justify-center md:w-auto">
        <div
          className="mt-6 flex w-full justify-center md:w-auto"
          style={{ direction: "ltr" }}
        >
          {Array(VERIFY_CODE_LENGTH)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className={clsx(
                  `flex h-10 w-full items-center justify-center rounded-lg border border-gray-500 bg-gray-800 px-2 outline-none focus:border-white ${
                    error ? "border-red-500" : "border-gray-400"
                  } mx-2 w-16 cursor-pointer rounded-md`,
                  focused &&
                    (inputRef?.current?.value.length == i ||
                      (inputRef?.current?.value.length === VERIFY_CODE_LENGTH &&
                        i == 3)) &&
                    "border-4"
                )}
                onClick={() => inputRef?.current?.focus()}
              >
                {focused && inputRef?.current?.value.length == i ? (
                  <div
                    className="h-6 animate-pulse bg-white"
                    style={{ width: 1 }}
                  />
                ) : (
                  <p className="text-xl">{value ? value[i] : ""}</p>
                )}
              </div>
            ))}
        </div>
      </div>

      {error ? <Error error={error.message} /> : <div className="h-[25px]" />}
    </div>
  );
}
