import clsx from "clsx";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { useController } from "react-hook-form";

import Select from "react-select";

import Error from "../Error";

type Option = {
  label: string;
  value: string | number | null;
};

export type SelectInputProps<T extends FieldValues> = {
  label?: string;
  placeholder: string;
  name: Path<T>;
  rules?: Exclude<
    RegisterOptions,
    "valueAsNumber" | "valueAsDate" | "setValueAs"
  >;
  defaultValue?: unknown;
  control?: Control<T>;
  options: Option[] | undefined;
  className?: string;
  noError?: boolean;
  isMulti?: boolean;
};

export default function SelectInput<T extends FieldValues>({
  label = "",
  placeholder = "",
  name,
  control = undefined,
  rules = {},
  options = [],
  className = "",
  noError = false,
  isMulti = false,
}: SelectInputProps<T>) {
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
      {label ? (
        <label htmlFor={name} className="block">
          {label}
        </label>
      ) : null}
      <Select
        id={name}
        name={name}
        placeholder={placeholder || label}
        options={options}
        value={
          isMulti
            ? options.filter((option) => value?.includes(option.value))
            : options.find((option) => value == option.value)
        }
        defaultValue={options.find((option) => value == option.value)}
        onChange={(option) => {
          if (isMulti) {
            option = option as Option[];
            onChange(option?.map((o) => o.value));
          } else {
            option = option as Option;
            onChange(option?.value);
          }
        }}
        onBlur={onBlur}
        unstyled={true}
        isMulti={isMulti}
        noOptionsMessage={() => "لا توجد خيارات أخرى"}
        classNames={{
          container: () => "rounded-lg bg-gray-800 ",
          control: ({ hasValue }) =>
            `rounded-lg px-2 py-1 border-gray-500 border ${
              hasValue ? "text-white" : "text-gray-400"
            } outline-none focus:border-white`,
          valueContainer: () => "bg-gray-800 rounded-r-lg gap-2",
          multiValue: () => "bg-gray-700 rounded-lg",
          menu: () => "bg-gray-800 rounded-lg p-2 mt-2",
          option: () => "hover:bg-gray-700 !cursor-pointer p-2 rounded-lg ",
        }}
      />

      {!noError ? (
        <>
          {error ? (
            <Error error={error.message} />
          ) : (
            <div className="h-[25px]" />
          )}
        </>
      ) : null}
    </div>
  );
}
