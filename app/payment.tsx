import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { API_BASE_URL } from "@/lib/api";

export default function PaymentScreen() {
  const router = useRouter();

  const {
    authorizationUrl,
    reference,
    customerName,
    phone,
    address,
    city,
    state,
    country,
  } = useLocalSearchParams<{
    authorizationUrl: string;
    reference: string;
    customerName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
  }>();

  const { token } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] =
    useState(true);

  const [verifying, setVerifying] =
    useState(false);

  const [error, setError] =
    useState("");

  const [cancelled, setCancelled] =
    useState(false);

  const hasVerified = useRef(false);

  async function verifyPayment() {
    if (hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    setVerifying(true);
    setError("");

    if (!token) {
      setError(
        "Your login session has expired. Please sign in again.",
      );

      setVerifying(false);
      hasVerified.current = false;

      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payments/paystack/verify`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            reference,
          }),
        },
      );

      const responseText =
        await response.text();

      console.log(
        "PAYMENT VERIFY STATUS:",
        response.status,
      );

      console.log(
        "PAYMENT VERIFY RESPONSE:",
        responseText,
      );

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Payment verification returned an invalid response.",
        );
      }

      if (
        !response.ok ||
        !data.paid
      ) {
        throw new Error(
          data.error ||
            "Payment could not be verified.",
        );
      }

      console.log(
        "PAYMENT VERIFIED - STARTING ADDRESS SAVE",
      );

      console.log(
        "ADDRESS DATA:",
        {
          customerName,
          phone,
          address,
          city,
          state,
          country,
        },
      );

      /*
       * Save the delivery address only
       * after successful payment verification.
       */
      try {
        const addressResponse =
          await fetch(
            `${API_BASE_URL}/api/mobile/address`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                customerName,
                phone,
                address,
                city,
                state,
                country,
              }),
            },
          );

        const addressResponseText =
          await addressResponse.text();

        console.log(
          "SAVE ADDRESS STATUS:",
          addressResponse.status,
        );

        console.log(
          "SAVE ADDRESS RESPONSE:",
          addressResponseText,
        );

        if (!addressResponse.ok) {
          console.warn(
            "Payment succeeded but address could not be saved.",
          );
        }
      } catch (addressError) {
        console.warn(
          "Payment succeeded but address saving failed:",
          addressError,
        );
      }

      /*
       * Only a verified payment gets here.
       */
      router.replace({
        pathname: "/order-success",
        params: {
          orderId: data.orderId,
        },
      });
    } catch (error) {
      console.error(
        "Payment verification error:",
        error,
      );

      hasVerified.current = false;

      setError(
        error instanceof Error
          ? error.message
          : "Unable to verify payment.",
      );

      setVerifying(false);
    }
  }

  function handleCancelPayment() {
    if (verifying) {
      return;
    }

    Alert.alert(
      "Cancel Payment",
      "Are you sure you want to leave the payment page? Your order will remain pending and you can try again.",
      [
        {
          text: "Stay",
          style: "cancel",
        },

        {
          text: "Cancel Payment",
          style: "destructive",

          onPress: () => {
            setCancelled(true);

            router.replace({
              pathname: "/checkout",
            });
          },
        },
      ],
    );
  }

  if (
    !authorizationUrl ||
    !reference
  ) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.error,
            {
              color: colors.danger,
            },
          ]}
        >
          Invalid payment information.
        </Text>
      </View>
    );
  }

  if (cancelled) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.cancelIcon,
            {
              backgroundColor:
                colors.surface,
              color:
                colors.secondaryText,
            },
          ]}
        >
          ×
        </Text>

        <Text
          style={[
            styles.cancelTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Payment Cancelled
        </Text>

        <Text
          style={[
            styles.cancelMessage,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Your order has not been marked as
          paid. You can return to checkout
          and try again.
        </Text>

        <Pressable
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() =>
            router.replace(
              "/checkout",
            )
          }
        >
          <Text
            style={[
              styles.primaryButtonText,
              {
                color:
                  colors.primaryText,
              },
            ]}
          >
            Return to Checkout
          </Text>
        </Pressable>
      </View>
    );
  }

  if (verifying) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.text}
        />

        <Text
          style={[
            styles.verifyingText,
            {
              color: colors.text,
            },
          ]}
        >
          Verifying your payment...
        </Text>

        <Text
          style={[
            styles.verifyingSubtext,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Please wait. Do not close the app.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.errorIcon,
            {
              backgroundColor:
                colors.errorBackground,
              color: colors.danger,
            },
          ]}
        >
          !
        </Text>

        <Text
          style={[
            styles.errorTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Payment Verification Failed
        </Text>

        <Text
          style={[
            styles.error,
            {
              color: colors.danger,
            },
          ]}
        >
          {error}
        </Text>

        <Pressable
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() => {
            setError("");
            hasVerified.current = false;
          }}
        >
          <Text
            style={[
              styles.primaryButtonText,
              {
                color:
                  colors.primaryText,
              },
            ]}
          >
            Return to Payment
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
          onPress={() =>
            router.replace(
              "/checkout",
            )
          }
        >
          <Text
            style={[
              styles.secondaryButtonText,
              {
                color: colors.text,
              },
            ]}
          >
            Return to Checkout
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {loading && (
        <View
          style={[
            styles.loading,
            {
              backgroundColor:
                colors.background,
            },
          ]}
        >
          <ActivityIndicator
            size="large"
            color={colors.text}
          />

          <Text
            style={[
              styles.loadingText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Loading payment...
          </Text>
        </View>
      )}

      <WebView
        source={{
          uri: authorizationUrl,
        }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onLoadEnd={() =>
          setLoading(false)
        }
        onNavigationStateChange={(
          navigation,
        ) => {
          console.log(
            "PAYSTACK NAVIGATION:",
            navigation.url,
          );
        }}
        onShouldStartLoadWithRequest={(
          request,
        ) => {
          const url = request.url;

          console.log(
            "PAYSTACK REQUEST:",
            url,
          );

          /*
           * This is the production callback
           * that successfully solved the
           * Paystack WebView issue.
           */
          if (
            url.startsWith(
              "https://prostore-ecommerce.vercel.app/api/mobile/paystack-callback",
            )
          ) {
            console.log(
              "PAYSTACK CALLBACK DETECTED",
            );

            verifyPayment();

            return false;
          }

          return true;
        }}
      />

      {!loading && (
        <View
          style={[
            styles.cancelContainer,
            {
              backgroundColor:
                colors.background,
              borderTopColor:
                colors.border,
            },
          ]}
        >
          <Pressable
            style={[
              styles.cancelButton,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
            onPress={
              handleCancelPayment
            }
            disabled={verifying}
          >
            <Text
              style={[
                styles.cancelButtonText,
                {
                  color: colors.danger,
                },
              ]}
            >
              Cancel Payment
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loading: {
    position: "absolute",
    zIndex: 10,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  cancelContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
  },

  cancelButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  verifyingText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "600",
  },

  verifyingSubtext: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
  },

  errorIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 58,
    overflow: "hidden",
  },

  errorTitle: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  error: {
    marginTop: 10,
    maxWidth: 320,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },

  cancelIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    fontSize: 38,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 60,
    overflow: "hidden",
  },

  cancelTitle: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },

  cancelMessage: {
    marginTop: 10,
    maxWidth: 320,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  primaryButton: {
    minWidth: 210,
    height: 50,
    marginTop: 24,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  secondaryButton: {
    minWidth: 210,
    height: 50,
    marginTop: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});