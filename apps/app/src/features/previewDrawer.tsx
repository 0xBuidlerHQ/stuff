"use client";

import { usePreviewStore } from "@/features/store";
import { Box } from "@/primitives/box";
import { ButtonPrimary } from "@/primitives/button";
import { Container } from "@/primitives/container";
import { Drawer, DrawerContent, DrawerTitle } from "@/shadcn/drawer";

const Content = () => {
	return (
		<Box className="px-4 flex flex-col gap-8 mb-8">
			<h1 className="text-8xl font-bold">menu</h1>

			<Box className="h-px bg-muted" />
		</Box>
	);
};

const CTA = () => {
	return (
		<Box className="py-2">
			<ButtonPrimary className="w-full">
				<Box className="text-2xl">PAY</Box>
			</ButtonPrimary>
		</Box>
	);
};

const PreviewDrawer = () => {
	const previewStore = usePreviewStore();

	return (
		<Drawer open={previewStore.previewDrawer} onOpenChange={previewStore.closePreviewDrawer}>
			<DrawerContent className="bg-white text-black">
				<Container>
					<DrawerTitle className="hidden">Preview Drawer</DrawerTitle>

					<Content />
					<CTA />
				</Container>
			</DrawerContent>
		</Drawer>
	);
};

export { PreviewDrawer };
