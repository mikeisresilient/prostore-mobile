import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/components/providers/auth-provider";
import { useCurrency } from "@/components/providers/currency-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { API_BASE_URL } from "@/lib/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
  stock: number;
  featured: boolean;
  rating: number;
  reviews: number;
  category: {
    name: string;
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user, logout } = useAuth();

  const {
    currency,
    setCurrency,
    formatPrice,
    loading: currencyLoading,
  } = useCurrency();

  const {
    isDark,
    colors,
    setThemeMode,
  } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

        setProducts(
          data
            .filter(
              (product) =>
                product.featured,
            )
            .slice(0, 4),
        );
      } catch (error) {
        console.error(
          "Featured products error:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  async function toggleTheme() {
    await setThemeMode(
      isDark ? "light" : "dark",
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
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 40,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <Text
            style={[
              styles.brand,
              {
                color: colors.text,
              },
            ]}
          >
            ProStore
          </Text>

          <Text
            style={[
              styles.tagline,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            Shop smarter. Live better.
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Theme Toggle */}
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.themeButton,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            <Ionicons
              name={
                isDark
                  ? "sunny-outline"
                  : "moon-outline"
              }
              size={21}
              color={colors.text}
            />
          </Pressable>

          {user ? (
            <View style={styles.accountActions}>
              <Text
                style={[
                  styles.accountName,
                  {
                    color: colors.text,
                  },
                ]}
                numberOfLines={1}
              >
                {user.name || "Account"}
              </Text>

              <Pressable
                onPress={logout}
                style={styles.signOutButton}
              >
                <Text
                  style={[
                    styles.signOutText,
                    {
                      color: colors.danger,
                    },
                  ]}
                >
                  Sign Out
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() =>
                router.push("/login")
              }
              style={[
                styles.signInButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.signInText,
                  {
                    color:
                      colors.primaryText,
                  },
                ]}
              >
                Sign In
              </Text>
            </Pressable>
          )}

          {/* Cart */}
          <Pressable
            style={[
              styles.cartButton,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
            onPress={() =>
              router.push("/(tabs)/cart")
            }
          >
            <Ionicons
              name="cart-outline"
              size={22}
              color={colors.text}
            />
          </Pressable>
        </View>
      </View>

      {/* Hero */}
      <View
        style={[
          styles.hero,
          {
            backgroundColor:
              colors.primary,
          },
        ]}
      >
        <Text style={styles.heroEyebrow}>
          WELCOME TO PROSTORE
        </Text>

        <Text
          style={[
            styles.heroTitle,
            {
              color:
                colors.primaryText,
            },
          ]}
        >
          Quality products.
          {"\n"}
          Simple shopping.
        </Text>

        <Text style={styles.heroText}>
          Discover carefully selected
          products for everyday life.
        </Text>

        <Pressable
          style={[
            styles.shopButton,
            {
              backgroundColor:
                colors.primaryText,
            },
          ]}
          onPress={() =>
            router.push("/(tabs)/shop")
          }
        >
          <Text
            style={[
              styles.shopButtonText,
              {
                color: colors.primary,
              },
            ]}
          >
            Shop Now
          </Text>
        </Pressable>
      </View>

      {/* Currency */}
      <View style={styles.currencySection}>
        <Text
          style={[
            styles.sectionLabel,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Currency
        </Text>

        <View style={styles.currencyRow}>
          <Pressable
            disabled={currencyLoading}
            onPress={() =>
              setCurrency("USD")
            }
            style={[
              styles.currencyButton,
              {
                backgroundColor:
                  colors.surface,
              },
              currency === "USD" && {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.currencyText,
                {
                  color: colors.text,
                },
                currency === "USD" && {
                  color:
                    colors.primaryText,
                },
              ]}
            >
              USD
            </Text>
          </Pressable>

          <Pressable
            disabled={currencyLoading}
            onPress={() =>
              setCurrency("NGN")
            }
            style={[
              styles.currencyButton,
              {
                backgroundColor:
                  colors.surface,
              },
              currency === "NGN" && {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.currencyText,
                {
                  color: colors.text,
                },
                currency === "NGN" && {
                  color:
                    colors.primaryText,
                },
              ]}
            >
              NGN
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Featured Products */}
      <View style={styles.sectionHeader}>
        <View>
          <Text
            style={[
              styles.sectionLabel,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            FEATURED
          </Text>

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Featured Products
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push("/(tabs)/shop")
          }
        >
          <Text
            style={[
              styles.viewAll,
              {
                color: colors.text,
              },
            ]}
          >
            View all
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={colors.text}
          />
        </View>
      ) : (
        <View style={styles.productGrid}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              style={styles.productCard}
              onPress={() =>
                router.push({
                  pathname:
                    "/product/[id]",
                  params: {
                    id: product.id,
                  },
                })
              }
            >
              <Image
                source={{
                  uri: product.image,
                }}
                style={[
                  styles.productImage,
                  {
                    backgroundColor:
                      colors.surface,
                  },
                ]}
              />

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
                  styles.productName,
                  {
                    color: colors.text,
                  },
                ]}
                numberOfLines={2}
              >
                {product.name}
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
                  Number(product.price),
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
                ⭐ {product.rating} (
                {product.reviews})
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  brandContainer: {
    flex: 1,
  },

  brand: {
    fontSize: 30,
    fontWeight: "800",
  },

  tagline: {
    fontSize: 13,
    marginTop: 2,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  themeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cartButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  accountActions: {
    alignItems: "flex-end",
    marginRight: 2,
  },

  accountName: {
    maxWidth: 90,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },

  signOutButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  signOutText: {
    fontSize: 11,
    fontWeight: "700",
  },

  signInButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
  },

  signInText: {
    fontSize: 12,
    fontWeight: "700",
  },

  hero: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },

  heroEyebrow: {
    color: "#AAAAAA",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginTop: 10,
  },

  heroText: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },

  shopButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9,
    marginTop: 20,
  },

  shopButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  currencySection: {
    marginBottom: 30,
  },

  currencyRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  currencyButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },

  currencyText: {
    fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  sectionTitle: {
    fontSize: 23,
    fontWeight: "800",
    marginTop: 4,
  },

  viewAll: {
    fontSize: 14,
    fontWeight: "600",
  },

  loader: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  productCard: {
    width: "48%",
    marginBottom: 20,
  },

  productImage: {
    width: "100%",
    height: 170,
    borderRadius: 12,
  },

  category: {
    fontSize: 11,
    marginTop: 8,
  },

  productName: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 3,
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },

  rating: {
    fontSize: 11,
    marginTop: 4,
  },
});