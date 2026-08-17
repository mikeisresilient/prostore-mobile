import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  useColorScheme as useSystemColorScheme,
} from "react-native";

export type ThemeMode =
  | "light"
  | "dark"
  | "system";

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;

  text: string;
  secondaryText: string;
  mutedText: string;

  border: string;

  primary: string;
  primaryText: string;

  inputBackground: string;
  placeholder: string;

  danger: string;
  errorBackground: string;
  errorBorder: string;

  success: string;
  successBackground: string;

  warning: string;
  warningBackground: string;
};

export const lightColors: ThemeColors = {
  background: "#FFFFFF",
  surface: "#F7F7F7",
  surfaceSecondary: "#EEEEEE",

  text: "#111111",
  secondaryText: "#777777",
  mutedText: "#AAAAAA",

  border: "#E5E5E5",

  primary: "#111111",
  primaryText: "#FFFFFF",

  inputBackground: "#FFFFFF",
  placeholder: "#999999",

  danger: "#C00000",
  errorBackground: "#FFF0F0",
  errorBorder: "#FFCCCC",

  success: "#16803C",
  successBackground: "#EAF7EE",

  warning: "#9A6700",
  warningBackground: "#FFF7D6",
};

export const darkColors: ThemeColors = {
  background: "#111111",
  surface: "#1C1C1C",
  surfaceSecondary: "#292929",

  text: "#FFFFFF",
  secondaryText: "#AAAAAA",
  mutedText: "#777777",

  border: "#333333",

  primary: "#FFFFFF",
  primaryText: "#111111",

  inputBackground: "#1C1C1C",
  placeholder: "#777777",

  danger: "#FF6B6B",
  errorBackground: "#351919",
  errorBorder: "#5A2525",

  success: "#5DD889",
  successBackground: "#183323",

  warning: "#FFD166",
  warningBackground: "#382F17",
};

type ThemeContextValue = {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (
    mode: ThemeMode,
  ) => Promise<void>;
};

const ThemeContext =
  createContext<
    ThemeContextValue | undefined
  >(undefined);

const THEME_STORAGE_KEY =
  "prostore-mobile-theme";

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const systemScheme =
    useSystemColorScheme();

  const [themeMode, setThemeModeState] =
    useState<ThemeMode>("system");

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const storedTheme =
          await AsyncStorage.getItem(
            THEME_STORAGE_KEY,
          );

        if (
          storedTheme === "light" ||
          storedTheme === "dark" ||
          storedTheme === "system"
        ) {
          setThemeModeState(
            storedTheme,
          );
        }
      } catch (error) {
        console.error(
          "Failed to load theme:",
          error,
        );
      } finally {
        setLoaded(true);
      }
    }

    loadTheme();
  }, []);

  async function setThemeMode(
    mode: ThemeMode,
  ) {
    setThemeModeState(mode);

    try {
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        mode,
      );
    } catch (error) {
      console.error(
        "Failed to save theme:",
        error,
      );
    }
  }

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" &&
      systemScheme === "dark");

  const colors = isDark
    ? darkColors
    : lightColors;

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider",
    );
  }

  return context;
}