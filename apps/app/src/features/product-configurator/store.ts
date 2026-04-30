import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import type { Address } from "viem";
import { create } from "zustand";

type ProductConfiguration = {
	sku: string;
	stuffAddress: Address;
	collection: StuffERC721.StuffCollection;
	author: string;
	title: string;
	description: string;
	design: {
		size: number;
		pixels: string[];
	};
	selectedOptions: Record<string, string>;
};

type ProductConfiguratorStoreState = {
	configurationsBySku: Record<string, ProductConfiguration>;
	ensureConfiguration: (sku: string, configuration: ProductConfiguration) => void;
	updateConfiguration: (sku: string, patch: Partial<ProductConfiguration>) => void;
};

const useProductConfiguratorStore = create<ProductConfiguratorStoreState>()((set) => ({
	configurationsBySku: {},
	ensureConfiguration: (sku, configuration) =>
		set((state) => {
			if (state.configurationsBySku[sku]) return state;

			return {
				configurationsBySku: {
					...state.configurationsBySku,
					[sku]: configuration,
				},
			};
		}),
	updateConfiguration: (sku, patch) =>
		set((state) => {
			const currentConfiguration = state.configurationsBySku[sku];
			if (!currentConfiguration) return state;

			return {
				configurationsBySku: {
					...state.configurationsBySku,
					[sku]: {
						...currentConfiguration,
						...patch,
					},
				},
			};
		}),
}));

export type { ProductConfiguration };
export { useProductConfiguratorStore };
