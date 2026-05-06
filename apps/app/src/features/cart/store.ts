"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StuffItemCart } from "@/config/types";

type CartStoreState = {
	items: StuffItemCart[];
	//
	addItem: (item: StuffItemCart) => void;
	removeItem: (item: StuffItemCart) => void;
	clearItems: () => void;
};

const useCartStore = create<CartStoreState>()(
	persist(
		(set) => ({
			items: [],
			//
			addItem: (item) => set((state) => ({ items: [...state.items, item] })),
			removeItem: (itemToRemove) =>
				set((state) => ({ items: state.items.filter((item) => item !== itemToRemove) })),
			clearItems: () => set({ items: [] }),
		}),
		{
			name: "cart-store",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);

export { useCartStore };
