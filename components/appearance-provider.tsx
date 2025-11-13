"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AppearanceContextType = {
  background: string | null;
  transparency: number;
  setBackground: (background: string | null) => void;
  setTransparency: (transparency: number) => void;
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [background, setBg] = useState<string | null>(null);
  const [transparency, setTrans] = useState(0.1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const storedBg = localStorage.getItem("dashboard-background");
      const storedTrans = localStorage.getItem("dashboard-transparency");
      if (storedBg) {
        setBg(storedBg);
      }
      if (storedTrans) {
        setTrans(parseFloat(storedTrans));
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  const setBackground = (newBg: string | null) => {
    setBg(newBg);
    if (isMounted) {
      try {
        if (newBg) {
          localStorage.setItem("dashboard-background", newBg);
        } else {
          localStorage.removeItem("dashboard-background");
        }
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  };

  const setTransparency = (newTrans: number) => {
    setTrans(newTrans);
    if (isMounted) {
       try {
        localStorage.setItem("dashboard-transparency", newTrans.toString());
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  };

  if (!isMounted) {
    return null; 
  }

  return (
    <AppearanceContext.Provider value={{ background, transparency, setBackground, setTransparency }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
}
