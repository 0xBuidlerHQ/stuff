import { create } from "zustand";

type PreviewStoreState = {
	previewDrawer: boolean;
	openPreviewDrawer: () => void;
	closePreviewDrawer: () => void;
};

const usePreviewStore = create<PreviewStoreState>()((set) => ({
	previewDrawer: false,
	openPreviewDrawer: () => set({ previewDrawer: true }),
	closePreviewDrawer: () => set({ previewDrawer: false }),
}));

export { usePreviewStore };
