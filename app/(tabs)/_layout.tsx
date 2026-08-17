import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCart } from "@/components/providers/cart-provider";
import { useTheme } from "@/components/providers/theme-provider";

export default function TabLayout() {
  const { state } = useCart();
  const { colors, isDark } = useTheme();

  const cartItemCount =
    state.items.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          colors.text,

        tabBarInactiveTintColor:
          colors.secondaryText,

        tabBarStyle: {
          backgroundColor:
            colors.background,

          borderTopColor:
            colors.border,
        },

        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({
            color,
          }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",

          tabBarIcon: ({
            color,
          }) => (
            <IconSymbol
              size={28}
              name="bag.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",

          tabBarBadge:
            cartItemCount > 0
              ? cartItemCount
              : undefined,

          tabBarBadgeStyle: {
            backgroundColor:
              colors.primary,

            color:
              colors.primaryText,
          },

          tabBarIcon: ({
            color,
          }) => (
            <IconSymbol
              size={28}
              name="cart.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({
            color,
          }) => (
            <IconSymbol
              size={28}
              name="person.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="product/[id]"
        options={{
          href: null,
          headerShown: true,
          title: "Product Details",
        }}
      />
    </Tabs>
  );
}