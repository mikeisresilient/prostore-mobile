import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
  stock: number;
  rating: number;
  reviews: number;
  category: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

type CartAction =
  | {
      type: 'ADD_ITEM';
      payload: CartProduct;
    }
  | {
      type: 'REMOVE_ITEM';
      payload: string;
    }
  | {
      type: 'INCREASE_QUANTITY';
      payload: string;
    }
  | {
      type: 'DECREASE_QUANTITY';
      payload: string;
    }
  | {
      type: 'CLEAR_CART';
    }
  | {
      type: 'HYDRATE_CART';
      payload: CartState;
    };

type CartContextValue = {
  state: CartState;
  dispatch: Dispatch<CartAction>;
};

const initialState: CartState = {
  items: [],
};

const CART_STORAGE_KEY = 'prostore-mobile-cart';

function cartReducer(
  state: CartState,
  action: CartAction
): CartState {
  switch (action.type) {
    case 'HYDRATE_CART':
      return action.payload;

    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      const currentStock = action.payload.stock;

      if (!Number.isInteger(currentStock) || currentStock <= 0) {
        return state;
      }

      if (existingItem) {
        const nextQuantity =
          existingItem.quantity < currentStock
            ? existingItem.quantity + 1
            : existingItem.quantity;

        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? {
                  ...item,
                  stock: currentStock,
                  quantity: nextQuantity,
                }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            quantity: 1,
          },
        ],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          (item) => item.id !== action.payload
        ),
      };

    case 'INCREASE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? {
                ...item,
                quantity:
                  item.quantity < item.stock
                    ? item.quantity + 1
                    : item.quantity,
              }
            : item
        ),
      };

    case 'DECREASE_QUANTITY':
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload
              ? {
                  ...item,
                  quantity: item.quantity - 1,
                }
              : item
          )
          .filter((item) => item.quantity > 0),
      };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

const CartContext = createContext<
  CartContextValue | undefined
>(undefined);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({
  children,
}: CartProviderProps) {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState
  );

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    async function loadCart() {
      try {
        const storedCart =
          await AsyncStorage.getItem(
            CART_STORAGE_KEY
          );

        if (storedCart) {
          const parsedCart =
            JSON.parse(storedCart) as CartState;

          dispatch({
            type: 'HYDRATE_CART',
            payload: parsedCart,
          });
        }
      } catch (error) {
        console.error(
          'Failed to load cart:',
          error
        );
      } finally {
        setHasHydrated(true);
      }
    }

    loadCart();
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    async function saveCart() {
      try {
        await AsyncStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify(state)
        );
      } catch (error) {
        console.error(
          'Failed to save cart:',
          error
        );
      }
    }

    saveCart();
  }, [state, hasHydrated]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within a CartProvider'
    );
  }

  return context;
}