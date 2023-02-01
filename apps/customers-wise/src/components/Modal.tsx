import clsx from "clsx";
import { Dispatch, FC, SetStateAction } from "react";

interface ModalProps {
  children: React.ReactNode;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
}

const Modal: FC<ModalProps> = ({ children, open, setOpen, onClose }) => {
  if (!open) return null;
  return (
    <div
      className={clsx(
        "fixed top-0 left-0 z-40 flex h-full w-full items-start justify-center pt-40"
      )}
      onClick={() => {
        setOpen(false);
        onClose?.();
      }}
    >
      <div
        className={clsx(
          "z-50 flex h-full w-full flex-col items-center justify-center gap-6 rounded-lg bg-gray-700 p-4 shadow-2xl transition-all duration-200 md:h-auto md:w-auto md:min-w-[30vw]",
          open ? "opacity-100" : "translate-y-20 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
