import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Locale = "ar" | "en";
type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isRTL: boolean;
  t: (key: keyof typeof translations.ar) => string;
};

const LOCALE_KEY = "noum-list.locale.v1";

const translations = {
  ar: {
    home: "الرئيسية",
    library: "مكتبتي",
    stats: "إحصائيات",
    settings: "الإعدادات",
    notes: "المعرفة",
    focus: "التركيز",
    language: "اللغة",
    arabic: "العربية",
    english: "English",
    darkMode: "الوضع الداكن",
    darkModeDescription: "مظهر أسود مريح للعين",
    appName: "Noum List",
    reminder: "تذكير السلسلة اليومي",
    privacy: "بياناتك محفوظة محليًا",
  },
  en: {
    home: "Home",
    library: "Library",
    stats: "Insights",
    settings: "Settings",
    notes: "Knowledge",
    focus: "Focus",
    language: "Language",
    arabic: "العربية",
    english: "English",
    darkMode: "Dark mode",
    darkModeDescription: "A calm black workspace",
    appName: "Noum List",
    reminder: "Daily streak reminder",
    privacy: "Your data stays on this device",
  },
} as const;

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_KEY).then((stored) => {
      if (stored === "ar" || stored === "en") setLocaleState(stored);
    });
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    void AsyncStorage.setItem(LOCALE_KEY, next);
  }, []);

  const value = useMemo(() => ({
    locale,
    setLocale,
    isRTL: locale === "ar",
    t: (key: keyof typeof translations.ar) => translations[locale][key],
  }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
