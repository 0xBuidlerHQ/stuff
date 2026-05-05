"use client";

import { create } from "zustand";
import type { StuffCartItem } from "@/features/stuff/types";

type StuffCartStoreState = {
	items: StuffCartItem[];
	addItem: (item: StuffCartItem) => void;
	removeItem: (item: StuffCartItem) => void;
	clearItems: () => void;
};

const useStuffCartStore = create<StuffCartStoreState>()((set) => ({
	items: [],
	addItem: (item) =>
		set((state) => ({
			items: [...state.items, item],
		})),
	removeItem: (itemToRemove) =>
		set((state) => ({
			items: state.items.filter((item) => item !== itemToRemove),
		})),
	clearItems: () => set({ items: [] }),
}));

export type { StuffCartItem };
export { useStuffCartStore };
