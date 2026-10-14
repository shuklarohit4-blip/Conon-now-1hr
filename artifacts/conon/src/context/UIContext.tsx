import React, { createContext, useContext, useState } from "react";

interface UIContextType {
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setCartOpen] = useState(false);

  return (
    <UIContext.Provider value={{ isCartOpen, setCartOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
