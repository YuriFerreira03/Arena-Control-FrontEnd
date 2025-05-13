import React, { createContext, useContext } from "react";
import useBLE from "./useBLE"; // importando o seu hook

const BLEContext = createContext<ReturnType<typeof useBLE> | null>(null);

export const BLEProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const ble = useBLE();

  return <BLEContext.Provider value={ble}>{children}</BLEContext.Provider>;
};

export const useBLEContext = () => {
  const context = useContext(BLEContext);
  if (!context) {
    throw new Error("useBLEContext deve ser usado dentro de um BLEProvider");
  }
  return context;
};
