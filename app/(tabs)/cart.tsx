import { useRouter } from "expo-router";
import { useCurrency } from "@/components/providers/currency-provider";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCart,
  type CartItem,
} from "@/components/providers/cart-provider";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useTheme,
  type ThemeColors,
} from "@/components/providers/theme-provider";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const { state, dispatch } = useCart();
  const { colors } = useTheme();

  const { items } = state;

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.price) * item.quantity,
    0,
  );

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

        <Text
          style={[
            styles.emptyMessage,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Add some products to your cart
          to see them here.
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
            router.push("/(tabs)/shop")
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
        Your Cart
      </Text>

      <Text
        style={[
          styles.itemCount,
          {
            color:
              colors.secondaryText,
          },
        ]}
      >
        {items.length}{" "}
        {items.length === 1
          ? "product"
          : "products"}
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              220 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            colors={colors}
            onIncrease={() =>
              dispatch({
                type: "INCREASE_QUANTITY",
                payload: item.id,
              })
            }
            onDecrease={() =>
              dispatch({
                type: "DECREASE_QUANTITY",
                payload: item.id,
              })
            }
            onRemove={() =>
              dispatch({
                type: "REMOVE_ITEM",
                payload: item.id,
              })
            }
          />
        )}
      />

      <View
        style={[
          styles.summary,
          {
            backgroundColor:
              colors.background,
            borderTopColor:
              colors.border,
            paddingBottom:
              insets.bottom + 16,
          },
        ]}
      >
        <View style={styles.subtotalRow}>
          <Text
            style={[
              styles.subtotalLabel,
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
              styles.subtotal,
              {
                color: colors.text,
              },
            ]}
          >
            {formatPrice(subtotal)}
          </Text>
        </View>

        <Pressable
          style={[
            styles.checkoutButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() =>
            router.push("/checkout")
          }
        >
          <Text
            style={[
              styles.checkoutButtonText,
              {
                color:
                  colors.primaryText,
              },
            ]}
          >
            Proceed to Checkout
          </Text>
        </Pressable>

        <Pressable
          style={styles.clearButton}
          onPress={() =>
            dispatch({
              type: "CLEAR_CART",
            })
          }
        >
          <Text
            style={[
              styles.clearButtonText,
              {
                color: colors.danger,
              },
            ]}
          >
            Clear Cart
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type CartItemRowProps = {
  item: CartItem;
  colors: ThemeColors;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

function CartItemRow({
  item,
  colors,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemRowProps) {
  const itemTotal =
    Number(item.price) * item.quantity;

  const { formatPrice } = useCurrency();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            colors.surface,
        },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={[
          styles.productImage,
          {
            backgroundColor:
              colors.surfaceSecondary,
          },
        ]}
      />

      <View style={styles.productInfo}>
        <Text
          style={[
            styles.productName,
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
            styles.productPrice,
            {
              color: colors.text,
            },
          ]}
        >
          {formatPrice(Number(item.price))}
        </Text>

        <Text
          style={[
            styles.itemTotal,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          Total: {formatPrice(itemTotal)}
        </Text>

        <View style={styles.controls}>
          <Pressable
            style={[
              styles.quantityButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
            onPress={onDecrease}
          >
            <Text
              style={[
                styles.quantityButtonText,
                {
                  color:
                    colors.primaryText,
                },
              ]}
            >
              −
            </Text>
          </Pressable>

          <Text
            style={[
              styles.quantity,
              {
                color: colors.text,
              },
            ]}
          >
            {item.quantity}
          </Text>

          <Pressable
            style={[
              styles.quantityButton,
              {
                backgroundColor:
                  colors.primary,
              },
              item.quantity >=
                item.stock &&
                styles.disabledButton,
            ]}
            disabled={
              item.quantity >= item.stock
            }
            onPress={onIncrease}
          >
            <Text
              style={[
                styles.quantityButtonText,
                {
                  color:
                    colors.primaryText,
                },
              ]}
            >
              +
            </Text>
          </Pressable>

          <Pressable
            style={styles.removeButton}
            onPress={onRemove}
          >
            <Text
              style={[
                styles.removeButtonText,
                {
                  color: colors.danger,
                },
              ]}
            >
              Remove
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  itemCount: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginTop: 4,
  },

  list: {
    padding: 20,
  },

  card: {
    flexDirection: "row",
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
  },

  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },

  productInfo: {
    flex: 1,
    marginLeft: 12,
  },

  productName: {
    fontSize: 16,
    fontWeight: "600",
  },

  productPrice: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 6,
  },

  itemTotal: {
    fontSize: 13,
    marginTop: 4,
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonText: {
    fontSize: 20,
    lineHeight: 22,
  },

  disabledButton: {
    opacity: 0.3,
  },

  quantity: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },

  removeButton: {
    marginLeft: 12,
  },

  removeButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },

  summary: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },

  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subtotalLabel: {
    fontSize: 16,
  },

  subtotal: {
    fontSize: 24,
    fontWeight: "700",
  },

  checkoutButton: {
    height: 52,
    marginTop: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },

  clearButton: {
    alignItems: "center",
    marginTop: 12,
  },

  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
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
  },

  emptyMessage: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
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