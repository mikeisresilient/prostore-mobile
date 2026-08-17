import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useCurrency } from "@/components/providers/currency-provider";
import { useTheme } from "@/components/providers/theme-provider";

import { API_BASE_URL } from "@/lib/api";

type SavedAddress = {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
};

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { state } = useCart();
  const { currency, formatPrice } = useCurrency();
  const { user, token, loading: authLoading } =
    useAuth();

  const { colors } = useTheme();

  const { items } = state;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("Nigeria");

  const [savedAddress, setSavedAddress] =
    useState<SavedAddress | null>(null);

  const [addressLoading, setAddressLoading] =
    useState(true);

  const [showSavedAddress, setShowSavedAddress] =
    useState(true);

  const [checkingStock, setCheckingStock] =
    useState(false);

  const [error, setError] = useState("");

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.price) * item.quantity,
    0,
  );

  /*
   * Load the customer's saved delivery information.
   */
  useEffect(() => {
    async function loadSavedAddress() {
      if (authLoading) {
        return;
      }

      if (!token) {
        setAddressLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/mobile/address`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const responseText =
          await response.text();

        console.log(
          "SAVED ADDRESS STATUS:",
          response.status,
        );

        console.log(
          "SAVED ADDRESS RESPONSE:",
          responseText,
        );

        if (!response.ok) {
          return;
        }

        const data =
          JSON.parse(responseText);

        if (data.address) {
          setSavedAddress(data.address);
        }
      } catch (error) {
        console.error(
          "Load saved address error:",
          error,
        );
      } finally {
        setAddressLoading(false);
      }
    }

    loadSavedAddress();
  }, [token, authLoading]);

  /*
   * Use the customer's account email automatically.
   */
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user?.email, email]);

  /*
   * Apply the saved delivery information
   * when the customer taps "Use this".
   */
  function useSavedInformation() {
    if (!savedAddress) {
      return;
    }

    setName(savedAddress.customerName);
    setPhone(savedAddress.phone);
    setAddress(savedAddress.address);
    setCity(savedAddress.city);
    setStateName(savedAddress.state);
    setCountry(savedAddress.country);

    setShowSavedAddress(false);
  }

  async function handleContinue() {
    setError("");

    if (authLoading) {
      return;
    }

    if (!user || !token) {
      setError(
        "Please sign in before continuing to checkout.",
      );
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !stateName.trim() ||
      !country.trim()
    ) {
      setError(
        "Please complete all required delivery information.",
      );
      return;
    }

    try {
      setCheckingStock(true);

      /*
       * STEP 1
       * Verify stock before creating the order.
       */
      const response = await fetch(
        `${API_BASE_URL}/api/products/stock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
          }),
        },
      );

      const responseText =
        await response.text();

      console.log(
        "STOCK STATUS:",
        response.status,
      );

      console.log(
        "STOCK RESPONSE:",
        responseText,
      );

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Stock service returned an invalid response.",
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to verify stock.",
        );
      }

      const unavailable =
        data.stock?.filter(
          (item: {
            available: boolean;
          }) => !item.available,
        );

      if (
        data.missingProducts?.length > 0 ||
        unavailable?.length > 0
      ) {
        setError(
          "Some products in your cart are no longer available in the requested quantity.",
        );
        return;
      }

      /*
       * STEP 2
       * Create the order.
       */
      const orderResponse = await fetch(
        `${API_BASE_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),

            currency,

            customerName: name.trim(),
            customerEmail: email
              .trim()
              .toLowerCase(),

            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            state: stateName.trim(),
            country: country.trim(),
          }),
        },
      );

      const orderResponseText =
        await orderResponse.text();

      console.log(
        "ORDER STATUS:",
        orderResponse.status,
      );

      console.log(
        "ORDER RESPONSE:",
        orderResponseText,
      );

      let orderData;

      try {
        orderData = JSON.parse(
          orderResponseText,
        );
      } catch {
        throw new Error(
          "Order service returned an invalid response.",
        );
      }

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error ||
            "Unable to create your order.",
        );
      }

      console.log(
        "Order created:",
        orderData.order,
      );

      const orderId =
        orderData.order.id;

      /*
       * STEP 3
       * Initialize Paystack.
       */
      const paymentResponse =
        await fetch(
          `${API_BASE_URL}/api/payments/paystack/initialize`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderId,
            }),
          },
        );

      const paymentResponseText =
        await paymentResponse.text();

      console.log(
        "PAYMENT INITIALIZE STATUS:",
        paymentResponse.status,
      );

      console.log(
        "PAYMENT INITIALIZE RESPONSE:",
        paymentResponseText,
      );

      let paymentData;

      try {
        paymentData = JSON.parse(
          paymentResponseText,
        );
      } catch {
        throw new Error(
          "Payment service returned an invalid response.",
        );
      }

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.error ||
            "Unable to initialize payment.",
        );
      }

      console.log(
        "Paystack initialized:",
        paymentData,
      );

      /*
       * STEP 4
       * Open the mobile Paystack payment screen.
       */
      if (
        !paymentData.authorizationUrl ||
        !paymentData.reference
      ) {
        throw new Error(
          "Paystack did not return valid payment information.",
        );
      }

      router.push({
        pathname: "/payment",
        params: {
          authorizationUrl:
            paymentData.authorizationUrl,

          reference:
            paymentData.reference,

          customerName:
            name.trim(),

          phone: phone.trim(),

          address: address.trim(),

          city: city.trim(),

          state: stateName.trim(),

          country: country.trim(),
        },
      });
    } catch (error) {
      console.error(
        "Checkout error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to continue with checkout.",
      );
    } finally {
      setCheckingStock(false);
    }
  }

  /*
   * Empty cart state.
   */
  if (items.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor:
              colors.background,
            paddingBottom:
              insets.bottom,
          },
        ]}
      >
        <Text
          style={[
            styles.emptyTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Your cart is empty
        </Text>

        <Pressable
          style={[
            styles.shopButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() =>
            router.replace(
              "/(tabs)/shop",
            )
          }
        >
          <Text
            style={[
              styles.shopButtonText,
              {
                color:
                  colors.primaryText,
              },
            ]}
          >
            Continue Shopping
          </Text>
        </Pressable>
      </View>
    );
  }

  /*
   * Authentication loading state.
   */
  if (authLoading) {
    return (
      <View
        style={[
          styles.emptyContainer,
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
          Checking your account...
        </Text>
      </View>
    );
  }

  /*
   * Checkout requires login.
   */
  if (!user || !token) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.emptyTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Sign in required
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Please sign in before continuing
          to checkout.
        </Text>

        <Pressable
          style={[
            styles.shopButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() =>
            router.push("/login")
          }
        >
          <Text
            style={[
              styles.shopButtonText,
              {
                color:
                  colors.primaryText,
              },
            ]}
          >
            Sign In
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom:
              insets.bottom + 40,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Checkout
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Complete your information to
          continue.
        </Text>

        {error ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor:
                  colors.errorBackground,
                borderColor:
                  colors.errorBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.errorText,
                {
                  color:
                    colors.danger,
                },
              ]}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* Contact Information */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Contact Information
        </Text>

        {!addressLoading &&
        savedAddress &&
        showSavedAddress ? (
          <Pressable
            style={[
              styles.savedAddressCard,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
            onPress={
              useSavedInformation
            }
          >
            <View
              style={
                styles.savedAddressHeader
              }
            >
              <Text
                style={[
                  styles.savedAddressTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Use saved information
              </Text>

              <Text
                style={[
                  styles.savedAddressAction,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Use this
              </Text>
            </View>

            <Text
              style={[
                styles.savedAddressName,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {savedAddress.customerName}
            </Text>

            <Text
              style={[
                styles.savedAddressText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {savedAddress.phone}
            </Text>

            <Text
              style={[
                styles.savedAddressText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {savedAddress.address}
            </Text>

            <Text
              style={[
                styles.savedAddressText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {savedAddress.city},{" "}
              {savedAddress.state}
            </Text>

            <Text
              style={[
                styles.savedAddressText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {savedAddress.country}
            </Text>
          </Pressable>
        ) : null}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor:
                colors.border,
              backgroundColor:
                colors.inputBackground,
            },
          ]}
          placeholder="Full name"
          placeholderTextColor={
            colors.placeholder
          }
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
        />

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor:
                colors.border,
              backgroundColor:
                colors.inputBackground,
            },
          ]}
          placeholder="Email address"
          placeholderTextColor={
            colors.placeholder
          }
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor:
                colors.border,
              backgroundColor:
                colors.inputBackground,
            },
          ]}
          placeholder="Phone number"
          placeholderTextColor={
            colors.placeholder
          }
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
        />

        {/* Delivery Address */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Delivery Address
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.multilineInput,
            {
              color: colors.text,
              borderColor:
                colors.border,
              backgroundColor:
                colors.inputBackground,
            },
          ]}
          placeholder="Street address"
          placeholderTextColor={
            colors.placeholder
          }
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor:
                colors.border,
              backgroundColor:
                colors.inputBackground,
            },
          ]}
          placeholder="City"
          placeholderTextColor={
            colors.placeholder
          }
          value={city}
          onChangeText={setCity}
          autoCapitalize="words"
        />

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor:
                colors.border,
              backgroundColor:
                colors.inputBackground,
            },
          ]}
          placeholder="State"
          placeholderTextColor={
            colors.placeholder
          }
          value={stateName}
          onChangeText={setStateName}
          autoCapitalize="words"
        />

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor:
                colors.border,
              backgroundColor:
                colors.inputBackground,
            },
          ]}
          placeholder="Country"
          placeholderTextColor={
            colors.placeholder
          }
          value={country}
          onChangeText={setCountry}
          autoCapitalize="words"
        />

        {/* Order Summary */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Order Summary
        </Text>

        <View
          style={[
            styles.summary,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          {items.map((item) => (
            <View
              key={item.id}
              style={styles.summaryRow}
            >
              <Text
                style={[
                  styles.summaryProduct,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
                numberOfLines={1}
              >
                {item.name} ×{" "}
                {item.quantity}
              </Text>

              <Text
                style={[
                  styles.summaryPrice,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {formatPrice(
                  Number(item.price) *
                    item.quantity,
                )}
              </Text>
            </View>
          ))}

          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />

          <View
            style={styles.totalRow}
          >
            <Text
              style={[
                styles.totalLabel,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Subtotal
            </Text>

            <Text
              style={[
                styles.totalPrice,
                {
                  color: colors.text,
                },
              ]}
            >
              {formatPrice(subtotal)}
            </Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.continueButton,
            {
              backgroundColor:
                colors.primary,
            },
            checkingStock &&
              styles.disabledButton,
          ]}
          disabled={checkingStock}
          onPress={handleContinue}
        >
          {checkingStock ? (
            <ActivityIndicator
              color={colors.primaryText}
            />
          ) : (
            <Text
              style={[
                styles.continueButtonText,
                {
                  color:
                    colors.primaryText,
                },
              ]}
            >
              Continue to Payment
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
  },

  savedAddressCard: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },

  savedAddressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  savedAddressTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  savedAddressAction: {
    fontSize: 14,
    fontWeight: "700",
  },

  savedAddressName: {
    fontSize: 14,
    fontWeight: "600",
  },

  savedAddressText: {
    fontSize: 13,
    marginTop: 3,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },

  multilineInput: {
    height: 90,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },

  summary: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryProduct: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },

  summaryPrice: {
    fontSize: 14,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    marginVertical: 6,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },

  totalPrice: {
    fontSize: 22,
    fontWeight: "800",
  },

  continueButton: {
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  continueButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },

  shopButton: {
    marginTop: 24,
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  shopButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});