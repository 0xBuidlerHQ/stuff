import { create } from "zustand";

type ProductCheckoutStoreState = {
	checkoutDrawerOpen: boolean;
	checkoutSku: string | null;
	openCheckoutDrawer: (sku: string) => void;
	closeCheckoutDrawer: () => void;
};

const useProductCheckoutStore = create<ProductCheckoutStoreState>()((set) => ({
	checkoutDrawerOpen: false,
	checkoutSku: null,
	openCheckoutDrawer: (sku) => set({ checkoutDrawerOpen: true, checkoutSku: sku }),
	closeCheckoutDrawer: () => set({ checkoutDrawerOpen: false }),
}));

export { useProductCheckoutStore };
