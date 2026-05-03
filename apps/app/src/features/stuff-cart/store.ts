"use client";

import { create } from "zustand";
import type { StuffConfiguration } from "@/features/stuff-configurator/provider";
import type { Stuff } from "@/features/stuff/type";

type StuffCartItem = {
	id: string;
	stuff: Stuff;
	configuration: StuffConfiguration;
};

type StuffCartStoreState = {
	items: StuffCartItem[];
	addItem: (item: StuffCartItem) => void;
	removeItem: (id: string) => void;
	clearItems: () => void;
};

const useStuffCartStore = create<StuffCartStoreState>()((set) => ({
	items: [],
	addItem: (item) =>
		set((state) => ({
			items: [...state.items, item],
		})),
	removeItem: (id) =>
		set((state) => ({
			items: state.items.filter((item) => item.id !== id),
		})),
	clearItems: () => set({ items: [] }),
}));

export type { StuffCartItem };
export { useStuffCartStore };
