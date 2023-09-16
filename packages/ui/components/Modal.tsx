import clsx from "clsx";
import type { Dispatch, FC, SetStateAction } from "react";

export type ModalProps = {
  children: React.ReactNode;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((value: boolean) => void);
  onClose?: () => void;
  className?: string;
  bottomModal?: boolean;
};

const Modal: FC<ModalProps> = ({ children, open, setOpen, onClose, className, bottomModal = false }) => {
  return (
    <div
      className={clsx(
        "fixed left-0 top-0 z-40 flex h-[-webkit-fill-available] min-h-[-webkit-fill-available] w-full flex-col items-start xl:items-center",
        open ? "opacity-100" : "pointer-events-none opacity-0",
        bottomModal ? "justify-end xl:justify-center" : "justify-center"
      )}
      onClick={() => {
        setOpen(false);
        onClose?.();
      }}>
      <div
        className={clsx(
          "relative z-50 mt-8 flex max-h-screen w-full flex-col items-center justify-start overflow-scroll rounded-xl  bg-gray-700 p-4 shadow-2xl transition-all duration-500 md:pb-4 xl:mt-0 xl:h-auto xl:w-auto xl:min-w-[30vw] xl:max-w-[30vw]",
          open ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0",
          className
        )}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex w-full">
          <p
            className="cursor-pointer text-3xl font-bold  transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => {
              setOpen(false);
              onClose?.();
            }}>
            x
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
