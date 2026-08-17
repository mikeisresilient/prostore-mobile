import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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

type Order = {
  id: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  chargedCurrency: string;
  chargedAmount: number | null;
  createdAt: string;
  paidAt: string | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image: string;
    };
  }[];
};

function getStatusLabel(status: OrderStatus) {
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

function getStatusColors(
  status: OrderStatus,
  colors: ReturnType<
    typeof useTheme
  >["colors"],
) {
  switch (status) {
    case "PAID":
    case "PROCESSING":
    case "SHIPPED":
    case "DELIVERED":
      return {
        backgroundColor:
          colors.successBackground,
        textColor:
          colors.success,
      };

    case "CANCELLED":
      return {
        backgroundColor:
          colors.errorBackground,
        textColor:
          colors.danger,
      };

    default:
      return {
        backgroundColor:
          colors.warningBackground,
        textColor:
          colors.warning,
      };
  }
}

export default function OrdersScreen() {
  const router = useRouter();

  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const { colors } = useTheme();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchOrders =
    useCallback(async () => {
      if (!token) {
        setLoading(false);
        setError(
          "Please sign in to view your orders.",
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/mobile/orders`,
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
          "ORDERS STATUS:",
          response.status,
        );

        console.log(
          "ORDERS RESPONSE:",
          responseText,
        );

        let data;

        try {
          data = JSON.parse(
            responseText,
          );
        } catch {
          throw new Error(
            "Orders request returned an invalid response.",
          );
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load your orders.",
          );
        }

        setOrders(
          Array.isArray(data.orders)
            ? data.orders
            : [],
        );
      } catch (error) {
        console.error(
          "Orders error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your orders.",
        );
      } finally {
        setLoading(false);
      }
    }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
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
          Loading your orders...
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
            styles.errorTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Unable to load orders
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
          {error}
        </Text>

        <Pressable
          style={[
            styles.retryButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={fetchOrders}
        >
          <Text
            style={[
              styles.retryButtonText,
              {
                color:
                  colors.primaryText,
              },
            ]}
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  if (orders.length === 0) {
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
        <Text style={styles.emptyIcon}>
          🛍️
        </Text>

        <Text
          style={[
            styles.emptyTitle,
            {
              color: colors.text,
            },
          ]}
        >
          No orders yet
        </Text>

        <Text
          style={[
            styles.emptyMessage,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Your completed purchases will
          appear here.
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
            router.push(
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
            Start Shopping
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
      <View style={styles.header}>
        <View>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            My Orders
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
            {orders.length}{" "}
            {orders.length === 1
              ? "order"
              : "orders"}
          </Text>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) =>
          item.id
        }
        contentContainerStyle={
          styles.list
        }
        showsVerticalScrollIndicator={
          false
        }
        renderItem={({ item }) => {
          const itemCount =
            item.items.reduce(
              (
                total,
                orderItem,
              ) =>
                total +
                orderItem.quantity,
              0,
            );

          const date =
            new Date(
              item.createdAt,
            ).toLocaleDateString(
              "en-NG",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            );

          const statusColors =
            getStatusColors(
              item.status,
              colors,
            );

          return (
            <Pressable
              style={[
                styles.orderCard,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname:
                    "/order/[id]",
                  params: {
                    id: item.id,
                  },
                })
              }
            >
              <View
                style={
                  styles.orderHeader
                }
              >
                <View
                  style={
                    styles.orderIdContainer
                  }
                >
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
                        color:
                          colors.text,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    #{item.id}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        statusColors.backgroundColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          statusColors.textColor,
                      },
                    ]}
                  >
                    {getStatusLabel(
                      item.status,
                    )}
                  </Text>
                </View>
              </View>

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
                style={
                  styles.orderInfoRow
                }
              >
                <View>
                  <Text
                    style={[
                      styles.infoLabel,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    Date
                  </Text>

                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {date}
                  </Text>
                </View>

                <View>
                  <Text
                    style={[
                      styles.infoLabel,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    Items
                  </Text>

                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {itemCount}{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}
                  </Text>
                </View>

                <View
                  style={
                    styles.totalContainer
                  }
                >
                  <Text
                    style={[
                      styles.infoLabel,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    Total
                  </Text>

                  <Text
                    style={[
                      styles.total,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {formatPrice(
                      item.total,
                    )}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.viewOrderRow,
                  {
                    borderTopColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.viewOrderText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  View Order
                </Text>

                <Text
                  style={[
                    styles.arrow,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  →
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  list: {
    padding: 20,
    paddingBottom: 40,
  },

  orderCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },

  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  orderIdContainer: {
    flex: 1,
    marginRight: 12,
  },

  orderLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  orderId: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    marginVertical: 14,
  },

  orderInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  infoLabel: {
    fontSize: 11,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
  },

  totalContainer: {
    alignItems: "flex-end",
  },

  total: {
    fontSize: 16,
    fontWeight: "800",
  },

  viewOrderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },

  viewOrderText: {
    fontSize: 13,
    fontWeight: "700",
  },

  arrow: {
    fontSize: 18,
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 25,
    fontWeight: "800",
  },

  emptyMessage: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
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

  retryButton: {
    marginTop: 22,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});