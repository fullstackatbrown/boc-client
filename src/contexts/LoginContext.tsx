"use client";
import { createContext, useContext, useState } from "react";

const LoginContext = createContext<{
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
} | null>(null);

export const LoginProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  return (
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error("useLogin must be used within a LoginProvider");
  }
  return context;
};
