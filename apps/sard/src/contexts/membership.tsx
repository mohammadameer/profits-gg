import { createContext, useContext, useState } from "react";

const MempershipModalOpenContext = createContext({
  isMempershipModalOpen: false,
  setIsMempershipModalOpen: (value: boolean) => {},
});

export const MempershipModalOpenProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isMempershipModalOpen, setIsMempershipModalOpen] = useState(false);

  return (
    <MempershipModalOpenContext.Provider
      value={{ isMempershipModalOpen, setIsMempershipModalOpen }}
    >
      {children}
    </MempershipModalOpenContext.Provider>
  );
};

export const useMempershipModalOpen = () => {
  const context = useContext(MempershipModalOpenContext);

  if (context === undefined) {
    throw new Error(
      "useMempershipModalOpen must be used within a MempershipModalOpenProvider"
    );
  }

  return context;
};
