import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useAuth } from "@/components/providers/auth-provider";
import { useCurrency } from "@/components/providers/currency-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { API_BASE_URL } from "@/lib/api";

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
  };
};

type Order = {
  id: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  chargedCurrency: string;
  chargedAmount: number | null;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  paymentReference: string | null;
  paidAt: string | null;
  createdAt: string;
  items: OrderItem[];
};

function getStatusLabel(
  status: OrderStatus,
) {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "PAID":
      return "Paid";

    case "PROCESSING":
      return "Processing";

    case "SHIPPED":
      return "Shipped";

    case "DELIVERED":
      return "Delivered";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

export default function OrderDetailsScreen() {
  const router = useRouter();

  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const { colors } = useTheme();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchOrder =
    useCallback(async () => {
      if (!token) {
        setLoading(false);

        setError(
          "Please sign in to view this order.",
        );

        return;
      }

      if (!id) {
        setLoading(false);
        setError(
          "Order ID is missing.",
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/mobile/orders/${id}`,
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
          "ORDER DETAILS STATUS:",
          response.status,
        );

        console.log(
          "ORDER DETAILS RESPONSE:",
          responseText,
        );

        let data;

        try {
          data = JSON.parse(
            responseText,
          );
        } catch {
          throw new Error(
            "Order details returned an invalid response.",
          );
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load order.",
          );
        }

        setOrder(data.order);
      } catch (error) {
        console.error(
          "Order details error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load order.",
        );
      } finally {
        setLoading(false);
      }
    }, [id, token]);

  useFocusEffect(
    useCallback(() => {
      fetchOrder();
    }, [fetchOrder]),
  );

  if (loading) {
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
            styles.loadingText,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Loading order...
        </Text>
      </View>
    );
  }

  if (error || !order) {
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
            styles.errorTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Unable to load order
        </Text>

        <Text
          style={[
            styles.errorMessage,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          {error || "Order not found."}
        </Text>

        <Pressable
          style={[
            styles.backButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() => router.back()}
        >
          <Text
            style={[
              styles.backButtonText,
              {
                color:
                  colors.primaryText,
              },
            ]}
          >
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const orderDate = new Date(
    order.createdAt,
  ).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statusBackground =
    order.status === "CANCELLED"
      ? colors.errorBackground
      : order.status === "PENDING"
        ? colors.warningBackground
        : colors.successBackground;

  const statusColor =
    order.status === "CANCELLED"
      ? colors.danger
      : order.status === "PENDING"
        ? colors.warning
        : colors.success;

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}

      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backIconButton,
            {
              backgroundColor:
                colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.backIcon,
              {
                color: colors.text,
              },
            ]}
          >
            ←
          </Text>
        </Pressable>

        <Text
          style={[
            styles.topBarTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Order Details
        </Text>

        <View
          style={styles.topBarSpacer}
        />
      </View>

      {/* Order Header */}

      <View
        style={[
          styles.headerCard,
          {
            backgroundColor:
              colors.surface,
          },
        ]}
      >
        <View>
          <Text
            style={[
              styles.orderLabel,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            ORDER
          </Text>

          <Text
            style={[
              styles.orderId,
              {
                color: colors.text,
              },
            ]}
            numberOfLines={1}
          >
            #{order.id}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusBackground,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: statusColor,
              },
            ]}
          >
            {getStatusLabel(
              order.status,
            )}
          </Text>
        </View>
      </View>

      {/* Order Information */}

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionLabel,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          ORDER INFORMATION
        </Text>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor:
                colors.surface,
            },
          ]}
        >
          <InfoRow
            label="Date"
            value={orderDate}
            colors={colors}
          />

          <InfoRow
            label="Items"
            value={`${order.items.reduce(
              (total, item) =>
                total + item.quantity,
              0,
            )}`}
            colors={colors}
          />

          {order.paidAt && (
            <InfoRow
              label="Paid"
              value={new Date(
                order.paidAt,
              ).toLocaleDateString(
                "en-NG",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              )}
              colors={colors}
            />
          )}
        </View>
      </View>

      {/* Products */}

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionLabel,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          PRODUCTS
        </Text>

        {order.items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.productCard,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
          >
            <Image
              source={{
                uri: item.product.image,
              }}
              style={[
                styles.productImage,
                {
                  backgroundColor:
                    colors.surfaceSecondary,
                },
              ]}
            />

            <View
              style={styles.productInfo}
            >
              <Text
                style={[
                  styles.productName,
                  {
                    color: colors.text,
                  },
                ]}
                numberOfLines={2}
              >
                {item.product.name}
              </Text>

              <Text
                style={[
                  styles.quantity,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Quantity: {item.quantity}
              </Text>

              <Text
                style={[
                  styles.productPrice,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {formatPrice(
                  item.price,
                )}{" "}
                each
              </Text>
            </View>

            <Text
              style={[
                styles.itemTotal,
                {
                  color: colors.text,
                },
              ]}
            >
              {formatPrice(
                item.price *
                  item.quantity,
              )}
            </Text>
          </View>
        ))}
      </View>

      {/* Payment Summary */}

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionLabel,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          PAYMENT SUMMARY
        </Text>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor:
                colors.surface,
            },
          ]}
        >
          <InfoRow
            label="Subtotal"
            value={formatPrice(
              order.subtotal,
            )}
            colors={colors}
          />

          <InfoRow
            label="Shipping"
            value={formatPrice(
              order.shippingCost,
            )}
            colors={colors}
          />

          <View
            style={[
              styles.summaryDivider,
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
                  color: colors.text,
                },
              ]}
            >
              Total
            </Text>

            <Text
              style={[
                styles.totalValue,
                {
                  color: colors.text,
                },
              ]}
            >
              {formatPrice(
                order.total,
              )}
            </Text>
          </View>

          {order.chargedAmount !==
            null &&
            order.chargedCurrency ===
              "NGN" && (
              <View
                style={[
                  styles.chargedAmount,
                  {
                    borderTopColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chargedLabel,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  Amount charged
                </Text>

                <Text
                  style={[
                    styles.chargedValue,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  ₦
                  {order.chargedAmount.toLocaleString(
                    "en-NG",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}
                </Text>
              </View>
            )}
        </View>
      </View>

      {/* Delivery Information */}

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionLabel,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          DELIVERY INFORMATION
        </Text>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor:
                colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.customerName,
              {
                color: colors.text,
              },
            ]}
          >
            {order.customerName}
          </Text>

          <Text
            style={[
              styles.deliveryText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {order.phone}
          </Text>

          <Text
            style={[
              styles.deliveryText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {order.address}
          </Text>

          <Text
            style={[
              styles.deliveryText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {order.city},{" "}
            {order.state}
          </Text>

          <Text
            style={[
              styles.deliveryText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {order.country}
          </Text>
        </View>
      </View>

      {/* Payment */}

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionLabel,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          PAYMENT
        </Text>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor:
                colors.surface,
            },
          ]}
        >
          <InfoRow
            label="Status"
            value={getStatusLabel(
              order.status,
            )}
            colors={colors}
          />

          {order.paymentReference && (
            <InfoRow
              label="Reference"
              value={
                order.paymentReference
              }
              colors={colors}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

type ThemeColors = ReturnType<
  typeof useTheme
>["colors"];

type InfoRowProps = {
  label: string;
  value: string;
  colors: ThemeColors;
};

function InfoRow({
  label,
  value,
  colors,
}: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text
        style={[
          styles.infoLabel,
          {
            color:
              colors.secondaryText,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.infoValue,
          {
            color: colors.text,
          },
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },

  backButton: {
    marginTop: 22,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  topBar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    fontSize: 22,
  },

  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  topBarSpacer: {
    width: 40,
  },

  headerCard: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  orderLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  orderId: {
    marginTop: 4,
    maxWidth: 210,
    fontSize: 13,
    fontWeight: "600",
  },

  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  section: {
    marginTop: 26,
    paddingHorizontal: 20,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 10,
  },

  infoCard: {
    padding: 16,
    borderRadius: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
  },

  infoLabel: {
    fontSize: 13,
    flex: 1,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },

  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },

  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  productName: {
    fontSize: 14,
    fontWeight: "600",
  },

  quantity: {
    fontSize: 12,
    marginTop: 5,
  },

  productPrice: {
    fontSize: 12,
    marginTop: 3,
  },

  itemTotal: {
    fontSize: 14,
    fontWeight: "700",
  },

  summaryCard: {
    padding: 16,
    borderRadius: 12,
  },

  summaryDivider: {
    height: 1,
    marginVertical: 10,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "800",
  },

  chargedAmount: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chargedLabel: {
    fontSize: 12,
  },

  chargedValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  customerName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 7,
  },

  deliveryText: {
    fontSize: 14,
    lineHeight: 21,
  },
});