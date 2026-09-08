import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ShopCartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    isReturnable: boolean;
}

interface ShopCartState {
    items: ShopCartItem[];
}

// NOTE: Do NOT read from localStorage here — this runs on the server during SSR
// and causes a hydration mismatch. `initShopCart` is dispatched once client-side
// after mount instead (see ShopCartInitializer).
const initialState: ShopCartState = {
    items: [],
};

const persist = (items: ShopCartItem[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('shopCart', JSON.stringify(items));
    }
};

export const shopCartSlice = createSlice({
    name: 'shopCart',
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<{ productId: string; name: string; price: number; image: string; isReturnable: boolean; quantity?: number }>) => {
            const { productId, name, price, image, isReturnable, quantity = 1 } = action.payload;
            const existing = state.items.find((item) => item.productId === productId);
            if (existing) {
                existing.quantity += quantity;
            } else {
                state.items.push({ productId, name, price, image, isReturnable, quantity });
            }
            persist(state.items);
        },
        updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
            const item = state.items.find((i) => i.productId === action.payload.productId);
            if (item) {
                item.quantity = Math.max(1, action.payload.quantity);
            }
            persist(state.items);
        },
        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.productId !== action.payload);
            persist(state.items);
        },
        clearCart: (state) => {
            state.items = [];
            persist(state.items);
        },
        // Called once on the client after mount to safely hydrate from localStorage
        initShopCart: (state) => {
            try {
                const stored = localStorage.getItem('shopCart');
                if (stored) {
                    state.items = JSON.parse(stored);
                }
            } catch {
                state.items = [];
            }
        },
    },
});

export const { addItem, updateQuantity, removeItem, clearCart, initShopCart } = shopCartSlice.actions;

export default shopCartSlice.reducer;
