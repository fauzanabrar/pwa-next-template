import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";

type ThemeMode = "light" | "dark";

export const useThemeMode = (storageKey: string) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const savedTheme = storage.readString(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    const prefersDark = window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storage.writeString(storageKey, theme);
  }, [storageKey, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme };
};
