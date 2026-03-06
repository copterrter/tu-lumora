import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  style: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void; // เพิ่มอันนี้เข้ามา
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  clearCart: () => set({ items: [], isOpen: false }), // เพิ่มอันนี้เข้ามา
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(
      (item) => item.style === newItem.style && item.size === newItem.size
    );
    if (existingItem) {
      return {
        items: state.items.map((item) =>
          item.id === existingItem.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
        isOpen: true,
      };
    }
    return { items: [...state.items, newItem], isOpen: true };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),
}));