import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useCart } from "@/components/providers/cart-provider";
import { useTheme } from "@/components/providers/theme-provider";

export default function OrderSuccessScreen() {
  const router = useRouter();

  const { dispatch } = useCart();
  const { colors } = useTheme();

  const { orderId } =
    useLocalSearchParams<{
      orderId: string;
    }>();

  useEffect(() => {
    dispatch({
      type: "CLEAR_CART",
    });
  }, [dispatch]);

  function handleContinue() {
    router.replace("/(tabs)");
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text
        style={[
          styles.icon,
          {
            backgroundColor: colors.primary,
            color: colors.primaryText,
          },
        ]}
      >
        ✓
      </Text>

      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        Payment Successful
      </Text>

      <Text
        style={[
          styles.message,
          {
            color: colors.secondaryText,
          },
        ]}
      >
        Your order has been placed successfully.
      </Text>

      {orderId ? (
        <Text
          style={[
            styles.orderId,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          Order ID: {orderId}
        </Text>
      ) : null}

      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
          },
        ]}
        onPress={handleContinue}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: colors.primaryText,
            },
          ]}
        >
          Continue Shopping
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  icon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    fontSize: 42,
    textAlign: "center",
    lineHeight: 68,
    overflow: "hidden",
  },

  title: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: "800",
  },

  message: {
    marginTop: 10,
    fontSize: 15,
    textAlign: "center",
  },

  orderId: {
    marginTop: 16,
    fontSize: 12,
    textAlign: "center",
  },

  button: {
    marginTop: 30,
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});