import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { CartProvider } from "@/components/providers/cart-provider";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import {
  ThemeProvider,
  useTheme,
} from "@/components/providers/theme-provider";

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppNavigation() {
  const { isDark, colors } = useTheme();

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      };

  return (
    <NavigationThemeProvider
      value={navigationTheme}
    >
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor:
              colors.background,
          },

          headerTintColor:
            colors.text,

          headerTitleStyle: {
            color: colors.text,
          },

          contentStyle: {
            backgroundColor:
              colors.background,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
          }}
        />

        <Stack.Screen
          name="checkout"
          options={{
            title: "Checkout",
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            title: "Sign In",
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="register"
          options={{
            title: "Create Account",
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="orders"
          options={{
            title: "My Orders",
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="wishlist"
          options={{
            title: "Wishlist",
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="payment"
          options={{
            title: "Payment",
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="order-success"
          options={{
            title: "Order Complete",
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="order/[id]"
          options={{
            title: "Order Details",
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="(tabs)/product/[id]"
          options={{
            title: "Product Details",
            headerShown: true,
          }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <CartProvider>
      <CurrencyProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppNavigation />

            <StatusBar style="auto" />
          </AuthProvider>
        </ThemeProvider>
      </CurrencyProvider>
    </CartProvider>
  );
}