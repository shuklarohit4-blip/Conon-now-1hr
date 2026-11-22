import React, { createContext, useContext, useState } from "react";

export type ScreenRatioMode = "16:9" | "mobile" | "frame16:9";

interface UIContextType {
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  screenRatio: ScreenRatioMode;
  setScreenRatio: (ratio: ScreenRatioMode) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [screenRatio, setScreenRatioState] = useState<ScreenRatioMode>(() => {
    try {
      const saved = localStorage.getItem("conon_screen_ratio");
      if (saved === "16:9" || saved === "mobile" || saved === "frame16:9") return saved;
    } catch (_) {}
    return "16:9";
  });

  const setScreenRatio = (mode: ScreenRatioMode) => {
    setScreenRatioState(mode);
    try {
      localStorage.setItem("conon_screen_ratio", mode);
    } catch (_) {}
  };

  return (
    <UIContext.Provider
      value={{
        isCartOpen,
        setCartOpen,
        isMenuOpen,
        setMenuOpen,
        screenRatio,
        setScreenRatio,
      }}
    >
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
