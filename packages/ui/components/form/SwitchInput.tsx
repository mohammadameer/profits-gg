import * as SwitchPrimitive from "@radix-ui/react-switch";
import clsx from "clsx";
import React from "react";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { useController } from "react-hook-form";

export type SwitchInputProps<T extends FieldValues> = {
  label?: string;
  name: Path<T>;
  rules?: Exclude<
    RegisterOptions,
    "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  defaultValue?: unknown;
  control?: Control<T>;
  disabled?: boolean;
};

export default function SwitchInput<T extends FieldValues>({
  name,
  control = undefined,
  rules = {},
  disabled = false,
}: SwitchInputProps<T>) {
  const {
    field: { value, onChange, onBlur },
  } = useController({ name, control, rules });

  return (
    <SwitchPrimitive.Root
      onClick={() => (disabled ? null : onChange(!value))}
      value={value}
      checked={value}
      onBlur={onBlur}
      className={clsx(
        "relative h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2  border-transparent pt-[2px] transition-colors duration-200 ease-in-out",
        value ? "bg-gray-200" : "bg-gray-700",
      )}
    >
      <SwitchPrimitive.Thumb
        className={clsx(
          "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
          value ? "-translate-x-4" : "translate-x-4",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
