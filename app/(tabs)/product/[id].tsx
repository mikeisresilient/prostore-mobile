import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useCurrency } from "@/components/providers/currency-provider";
import { useTheme } from "@/components/providers/theme-provider";

import { API_BASE_URL } from "@/lib/api";

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

export default function ProductDetailsScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const { dispatch } = useCart();
  const { formatPrice } = useCurrency();
  const { token } = useAuth();
  const { colors } = useTheme();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/products/${id}`,
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch product",
          );
        }

        const data: Product =
          await response.json();

        setProduct(data);
      } catch (error) {
        console.error(
          "Product error:",
          error,
        );

        setError(
          "Unable to load product.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  /*
   * Check whether this product is already
   * in the user's wishlist.
   */
  useEffect(() => {
    async function checkWishlist() {
      if (!token || !id) {
        setIsWishlisted(false);
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

        const exists =
          Array.isArray(data.items) &&
          data.items.some(
            (item: { id: string }) =>
              item.id === id,
          );

        setIsWishlisted(exists);
      } catch (error) {
        console.error(
          "Wishlist check error:",
          error,
        );
      }
    }

    checkWishlist();
  }, [id, token]);

  async function toggleWishlist() {
    if (!token) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to add products to your wishlist.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );

      return;
    }

    if (!id || wishlistLoading) {
      return;
    }

    try {
      setWishlistLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/mobile/wishlist`,
        {
          method: isWishlisted
            ? "DELETE"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            productId: id,
          }),
        },
      );

      const responseText =
        await response.text();

      console.log(
        "WISHLIST TOGGLE STATUS:",
        response.status,
      );

      console.log(
        "WISHLIST TOGGLE RESPONSE:",
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

      setIsWishlisted(
        !isWishlisted,
      );
    } catch (error) {
      console.error(
        "Wishlist toggle error:",
        error,
      );

      Alert.alert(
        "Wishlist",
        error instanceof Error
          ? error.message
          : "Unable to update wishlist.",
      );
    } finally {
      setWishlistLoading(false);
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
          Loading product...
        </Text>
      </View>
    );
  }

  if (error || !product) {
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
          {error ||
            "Product not found."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: product.image,
          }}
          style={[
            styles.image,
            {
              backgroundColor:
                colors.surfaceSecondary,
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
          onPress={toggleWishlist}
          disabled={wishlistLoading}
        >
          {wishlistLoading ? (
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

      <View style={styles.content}>
        <Text
          style={[
            styles.category,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          {product.category.name}
        </Text>

        <Text
          style={[
            styles.name,
            {
              color: colors.text,
            },
          ]}
        >
          {product.name}
        </Text>

        <View style={styles.ratingRow}>
          <Text
            style={[
              styles.rating,
              {
                color: colors.text,
              },
            ]}
          >
            ⭐ {product.rating}
          </Text>

          <Text
            style={[
              styles.reviews,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            ({product.reviews} reviews)
          </Text>
        </View>

        <Text
          style={[
            styles.price,
            {
              color: colors.text,
            },
          ]}
        >
          {formatPrice(
            Number(product.price),
          )}
        </Text>

        <Text
          style={[
            styles.description,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          {product.description}
        </Text>

        <Text
          style={[
            styles.stock,
            {
              color:
                product.stock > 0
                  ? colors.text
                  : colors.danger,
            },
          ]}
        >
          {product.stock > 0
            ? `${product.stock} in stock`
            : "Out of stock"}
        </Text>

        <Pressable
          style={[
            styles.cartButton,
            {
              backgroundColor:
                colors.primary,
            },
            product.stock <= 0 &&
              styles.disabledButton,
          ]}
          disabled={
            product.stock <= 0
          }
          onPress={() => {
            dispatch({
              type: "ADD_ITEM",
              payload: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image,
                stock: product.stock,
                rating: product.rating,
                reviews: product.reviews,
                category:
                  product.category.name,
              },
            });
          }}
        >
          <Text
            style={[
              styles.cartButtonText,
              {
                color:
                  colors.primaryText,
              },
            ]}
          >
            {product.stock > 0
              ? "Add to Cart"
              : "Out of Stock"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  imageContainer: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 350,
  },

  wishlistButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",

    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  heart: {
    fontSize: 28,
    lineHeight: 31,
  },

  heartActive: {
    color: "#d00",
  },

  content: {
    padding: 20,
  },

  category: {
    fontSize: 14,
    marginBottom: 8,
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  rating: {
    fontSize: 16,
    fontWeight: "600",
  },

  reviews: {
    fontSize: 14,
    marginLeft: 8,
  },

  price: {
    fontSize: 30,
    fontWeight: "700",
    marginTop: 20,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 20,
  },

  stock: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 20,
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
  },

  cartButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.5,
  },

  cartButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});