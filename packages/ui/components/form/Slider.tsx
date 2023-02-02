import * as SliderPrimitive from "@radix-ui/react-slider";
import clsx from "clsx";
import React from "react";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { useController } from "react-hook-form";
type SwitchInputProps<T extends FieldValues> = {
  name: Path<T>;
  max?: number;
  step?: number;
  defaultValue?: number;
  rules?: Exclude<
    RegisterOptions,
    "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  control?: Control<T>;
  disabled?: boolean;
};

export default function SliderInput<T extends FieldValues>({
  name,
  max = 500,
  step = 1,
  defaultValue = 0,
  control = undefined,
  rules = {},
  disabled = false,
}: SwitchInputProps<T>) {
  const {
    field: { value, onChange, onBlur },
  } = useController({ name, control, rules });
  return (
    <SliderPrimitive.Root
      defaultValue={[defaultValue]}
      max={max}
      step={step}
      value={value}
      onValueChange={(e) => (disabled ? null : onChange(e))}
      onBlur={onBlur}
      aria-label="value"
      className="relative flex h-10 w-full touch-none items-center"
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-white dark:bg-gray-700 ">
        <SliderPrimitive.Range className="absolute h-full rounded-r-full  dark:bg-white" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={clsx(
          "block h-7 w-7 cursor-pointer rounded-full transition-all hover:scale-105 active:scale-95 dark:bg-white",
          "active:outline-none active:ring active:ring-gray-600"
        )}
      />
    </SliderPrimitive.Root>
  );
}
