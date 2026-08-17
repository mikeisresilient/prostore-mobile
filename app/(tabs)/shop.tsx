import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useCurrency } from "@/components/providers/currency-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  stock: number;
  featured: boolean;
  isActive: boolean;
  rating: number;
  reviews: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export default function ShopScreen() {
  const insets = useSafeAreaInsets();

  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const { colors } = useTheme();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [wishlistIds, setWishlistIds] =
    useState<Set<string>>(new Set());

  const [wishlistLoadingId, setWishlistLoadingId] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/products`,
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products",
          );
        }

        const data: Product[] =
          await response.json();

        setProducts(data);
      } catch (error) {
        console.error(
          "Products error:",
          error,
        );

        setError(
          "Unable to load products.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  /*
   * Load the user's wishlist so the hearts
   * immediately show the correct state.
   */
  useEffect(() => {
    async function fetchWishlist() {
      if (!token) {
        setWishlistIds(new Set());
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/mobile/wishlist`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (Array.isArray(data.items)) {
          const ids = new Set<string>(
            data.items.map(
              (item: { id: string }) =>
                item.id,
            ),
          );

          setWishlistIds(ids);
        }
      } catch (error) {
        console.error(
          "Shop wishlist error:",
          error,
        );
      }
    }

    fetchWishlist();
  }, [token]);

  async function toggleWishlist(
    productId: string,
  ) {
    if (!token) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to add products to your wishlist.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign In",
            onPress: () =>
              router.push("/login"),
          },
        ],
      );

      return;
    }

    if (wishlistLoadingId) {
      return;
    }

    const currentlyWishlisted =
      wishlistIds.has(productId);

    try {
      setWishlistLoadingId(productId);

      const response = await fetch(
        `${API_BASE_URL}/api/mobile/wishlist`,
        {
          method: currentlyWishlisted
            ? "DELETE"
            : "POST",

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
        "SHOP WISHLIST STATUS:",
        response.status,
      );

      console.log(
        "SHOP WISHLIST RESPONSE:",
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
            "Unable to update wishlist.",
        );
      }

      setWishlistIds((current) => {
        const next = new Set(current);

        if (currentlyWishlisted) {
          next.delete(productId);
        } else {
          next.add(productId);
        }

        return next;
      });
    } catch (error) {
      console.error(
        "Shop wishlist toggle error:",
        error,
      );

      Alert.alert(
        "Wishlist",
        error instanceof Error
          ? error.message
          : "Unable to update wishlist.",
      );
    } finally {
      setWishlistLoadingId(null);
    }
  }

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
            styles.message,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Loading products...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
            paddingTop: insets.top,
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
          {error}
        </Text>
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
          paddingTop: insets.top,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        Shop
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
        {products.length} products available
      </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              insets.bottom + 30,
          },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isWishlisted =
            wishlistIds.has(item.id);

          const isWishlistLoading =
            wishlistLoadingId === item.id;

          return (
            <View style={styles.card}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname:
                      "/product/[id]",
                    params: {
                      id: item.id,
                    },
                  })
                }
              >
                <View
                  style={
                    styles.imageContainer
                  }
                >
                  <Image
                    source={{
                      uri: item.image,
                    }}
                    style={[
                      styles.image,
                      {
                        backgroundColor:
                          colors.surface,
                      },
                    ]}
                  />

                  <Pressable
                    style={[
                      styles.wishlistButton,
                      {
                        backgroundColor:
                          colors.surface,
                        borderColor:
                          colors.border,
                      },
                    ]}
                    onPress={() =>
                      toggleWishlist(
                        item.id,
                      )
                    }
                    disabled={
                      isWishlistLoading
                    }
                  >
                    {isWishlistLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.text}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.heart,
                          {
                            color: colors.text,
                          },
                          isWishlisted &&
                            styles.heartActive,
                        ]}
                      >
                        {isWishlisted
                          ? "♥"
                          : "♡"}
                      </Text>
                    )}
                  </Pressable>
                </View>

                <Text
                  style={[
                    styles.category,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  {item.category.name}
                </Text>

                <Text
                  style={[
                    styles.name,
                    {
                      color: colors.text,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>

                <Text
                  style={[
                    styles.price,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {formatPrice(
                    Number(item.price),
                  )}
                </Text>

                <Text
                  style={[
                    styles.rating,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  ⭐ {item.rating} (
                  {item.reviews})
                </Text>
              </Pressable>
            </View>
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

  title: {
    fontSize: 28,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  subtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
  },

  list: {
    padding: 20,
  },

  row: {
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    marginBottom: 20,
  },

  imageContainer: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 170,
    borderRadius: 12,
  },

  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  heart: {
    fontSize: 23,
    lineHeight: 27,
  },

  heartActive: {
    color: "#D00000",
  },

  category: {
    fontSize: 12,
    marginTop: 8,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },

  rating: {
    fontSize: 12,
    marginTop: 4,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  message: {
    marginTop: 10,
  },

  error: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});