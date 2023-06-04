import clsx from "clsx";
import type { Dispatch, FC, SetStateAction } from "react";

export type ModalProps = {
  children: React.ReactNode;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((value: boolean) => void);
  onClose?: () => void;
  className?: string;
};

const Modal: FC<ModalProps> = ({
  children,
  open,
  setOpen,
  onClose,
  className,
}) => {
  return (
    <div
      className={clsx(
        "xl:pt-30 fixed left-0 top-0 z-40 flex h-full w-full items-end justify-center pt-8 xl:items-center",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={() => {
        setOpen(false);
        onClose?.();
      }}
    >
      <div
        className={clsx(
          "relative z-50 flex max-h-screen w-full flex-col items-center justify-start gap-6 overflow-scroll rounded-lg bg-gray-700 p-4 pb-10 pt-8 shadow-2xl transition-all duration-500 md:pb-4 xl:h-auto xl:w-auto xl:min-w-[30vw] xl:max-w-[30vw]",
          open ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="absolute right-5 top-2 cursor-pointer text-2xl font-bold transition-all duration-300 hover:scale-105 active:scale-95"
          onClick={() => {
            setOpen(false);
            onClose?.();
          }}
        >
          x
        </p>
        {children}
      </div>
    </div>
  );
};

export default Modal;
