import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

import { useAuth } from "@/components/providers/auth-provider";
import { useCurrency } from "@/components/providers/currency-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { API_BASE_URL } from "@/lib/api";

type WishlistItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
  isActive: boolean;
};

export default function WishlistScreen() {
  const router = useRouter();

  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const { colors } = useTheme();

  const [items, setItems] = useState<
    WishlistItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [removingId, setRemovingId] =
    useState<string | null>(null);

  const loadWishlist = useCallback(
    async (showLoader = true) => {
      if (!token) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/mobile/wishlist`,
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
          "WISHLIST STATUS:",
          response.status,
        );

        console.log(
          "WISHLIST RESPONSE:",
          responseText,
        );

        let data;

        try {
          data = JSON.parse(
            responseText,
          );
        } catch {
          throw new Error(
            "Wishlist returned an invalid response.",
          );
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load wishlist.",
          );
        }

        setItems(
          Array.isArray(data.items)
            ? data.items
            : [],
        );
      } catch (error) {
        console.error(
          "Wishlist loading error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load wishlist.",
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [loadWishlist]),
  );

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await loadWishlist(false);
    } finally {
      setRefreshing(false);
    }
  }

  async function removeFromWishlist(
    productId: string,
  ) {
    if (!token || removingId) {
      return;
    }

    try {
      setRemovingId(productId);

      const response = await fetch(
        `${API_BASE_URL}/api/mobile/wishlist`,
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
          }),
        },
      );

      const responseText =
        await response.text();

      console.log(
        "WISHLIST REMOVE STATUS:",
        response.status,
      );

      console.log(
        "WISHLIST REMOVE RESPONSE:",
        responseText,
      );

      let data;

      try {
        data = JSON.parse(
          responseText,
        );
      } catch {
        throw new Error(
          "Wishlist removal returned an invalid response.",
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to remove product.",
        );
      }

      setItems((currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== productId,
        ),
      );
    } catch (error) {
      console.error(
        "Wishlist removal error:",
        error,
      );

      Alert.alert(
        "Unable to remove",
        error instanceof Error
          ? error.message
          : "Please try again.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  function confirmRemove(
    item: WishlistItem,
  ) {
    Alert.alert(
      "Remove from Wishlist",
      `Remove ${item.name} from your wishlist?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            removeFromWishlist(
              item.id,
            ),
        },
      ],
    );
  }

  /*
   * User is not signed in.
   */
  if (!token) {
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
        <View
          style={[
            styles.emptyIcon,
            {
              backgroundColor:
                colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.emptyIconText,
              {
                color: colors.text,
              },
            ]}
          >
            ♡
          </Text>
        </View>

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
            styles.emptyMessage,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Sign in to save products to your
          wishlist.
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
            router.push("/login")
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
            Sign In
          </Text>
        </Pressable>
      </View>
    );
  }

  /*
   * Wishlist loading state.
   */
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
          Loading wishlist...
        </Text>
      </View>
    );
  }

  /*
   * Wishlist error state.
   */
  if (
    error &&
    items.length === 0
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
            styles.errorTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Unable to load wishlist
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
            styles.primaryButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() =>
            loadWishlist()
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
            Try Again
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
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor:
              colors.border,
          },
        ]}
      >
        <Pressable
          style={[
            styles.backButton,
            {
              backgroundColor:
                colors.surface,
            },
          ]}
          onPress={() => router.back()}
        >
          <Text
            style={[
              styles.backText,
              {
                color: colors.text,
              },
            ]}
          >
            ←
          </Text>
        </Pressable>

        <View style={styles.headerContent}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Wishlist
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
            {items.length}{" "}
            {items.length === 1
              ? "item"
              : "items"}
          </Text>
        </View>

        <View
          style={styles.headerSpacer}
        />
      </View>

      {/* Empty wishlist */}
      {items.length === 0 ? (
        <ScrollView
          contentContainerStyle={[
            styles.emptyContent,
            {
              paddingBottom: 40,
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.text}
            />
          }
        >
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.emptyIconText,
                {
                  color: colors.text,
                },
              ]}
            >
              ♡
            </Text>
          </View>

          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Your wishlist is empty
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
            Save products you love and
            come back to them later.
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
              router.push(
                "/(tabs)/shop",
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
              Start Shopping
            </Text>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: 40,
            },
          ]}
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.text}
            />
          }
        >
          {items.map((item) => (
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
              <Pressable
                style={styles.productPressable}
                onPress={() =>
                  router.push({
                    pathname:
                      "/(tabs)/product/[id]",
                    params: {
                      id: item.id,
                    },
                  })
                }
              >
                <Image
                  source={{
                    uri: item.image,
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
                  style={
                    styles.productInfo
                  }
                >
                  <Text
                    style={[
                      styles.category,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    {item.category}
                  </Text>

                  <Text
                    style={[
                      styles.productName,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={[
                      styles.productPrice,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {formatPrice(
                      item.price,
                    )}
                  </Text>

                  {item.stock <= 0 && (
                    <Text
                      style={[
                        styles.outOfStock,
                        {
                          color:
                            colors.danger,
                        },
                      ]}
                    >
                      Out of stock
                    </Text>
                  )}

                  {!item.isActive && (
                    <Text
                      style={[
                        styles.unavailable,
                        {
                          color:
                            colors.danger,
                        },
                      ]}
                    >
                      Currently unavailable
                    </Text>
                  )}
                </View>
              </Pressable>

              <Pressable
                style={[
                  styles.removeButton,
                  {
                    backgroundColor:
                      colors.surface,
                  },
                ]}
                disabled={
                  removingId === item.id
                }
                onPress={() =>
                  confirmRemove(item)
                }
              >
                {removingId === item.id ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.text}
                  />
                ) : (
                  <Text
                    style={[
                      styles.removeText,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    ♡
                  </Text>
                )}
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
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
    height: 68,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 22,
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },

  headerSpacer: {
    width: 40,
  },

  listContent: {
    padding: 20,
  },

  productCard: {
    minHeight: 120,
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
    flexDirection: "row",
  },

  productPressable: {
    flex: 1,
    padding: 12,
    flexDirection: "row",
  },

  productImage: {
    width: 96,
    height: 96,
    borderRadius: 10,
  },

  productInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 6,
  },

  category: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  productName: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
  },

  productPrice: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "800",
  },

  outOfStock: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "600",
  },

  unavailable: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "600",
  },

  removeButton: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  removeText: {
    fontSize: 25,
  },

  emptyContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIconText: {
    fontSize: 38,
  },

  emptyTitle: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyMessage: {
    marginTop: 8,
    maxWidth: 300,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  primaryButton: {
    marginTop: 24,
    height: 50,
    paddingHorizontal: 26,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  errorTitle: {
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },

  errorMessage: {
    marginTop: 8,
    maxWidth: 300,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});