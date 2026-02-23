import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, Address, PaymentMethod, User } from '../types/navigation';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  setAuthenticated: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      setAuthenticated: (user, token) => set({ isAuthenticated: true, user, token }),
      logout: () => set({ isAuthenticated: false, user: null, token: null }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface CartState {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

const initialCart: Cart = {
  items: [],
  restaurantId: null,
  subtotal: 0,
  serviceFee: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
};

export const useCartStore = create<CartState>()((set, get) => ({
  cart: initialCart,
  addItem: (item) => {
    set((state) => {
      const existingItem = state.cart.items.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          cart: {
            ...state.cart,
            items: state.cart.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          },
        };
      }
      return {
        cart: {
          ...state.cart,
          items: [...state.cart.items, item],
          restaurantId: item.menuItem.restaurantId,
        },
      };
    });
    get().calculateTotals();
  },
  removeItem: (itemId) => {
    set((state) => ({
      cart: {
        ...state.cart,
        items: state.cart.items.filter((i) => i.id !== itemId),
      },
    }));
    get().calculateTotals();
  },
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      cart: {
        ...state.cart,
        items: state.cart.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      },
    }));
    get().calculateTotals();
  },
  clearCart: () => set({ cart: initialCart }),
  calculateTotals: () => {
    set((state) => {
      const subtotal = state.cart.items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );
      const serviceFee = subtotal * 0.15; // 15% service fee
      const deliveryFee = 2.99;
      const tax = subtotal * 0.0875; // 8.75% tax
      const total = subtotal + serviceFee + deliveryFee + tax;
      return {
        cart: {
          ...state.cart,
          subtotal,
          serviceFee,
          deliveryFee,
          tax,
          total,
        },
      };
    });
  },
}));

interface LocationState {
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  selectedAddress: Address | null;
  setCurrentLocation: (location: { latitude: number; longitude: number }) => void;
  setSelectedAddress: (address: Address) => void;
}

export const useLocationStore = create<LocationState>()((set) => ({
  currentLocation: null,
  selectedAddress: null,
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setSelectedAddress: (address) => set({ selectedAddress: address }),
}));