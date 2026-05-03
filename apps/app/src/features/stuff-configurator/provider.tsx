"use client";

import { useRouter } from "next/navigation";
import {
	createContext,
	type PropsWithChildren,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { links } from "@/config/links";
import { useStuffCartStore } from "@/features/stuff-cart/store";
import type { Stuff } from "@/features/stuff/type";
import { getDefaultPixels } from "./grid";

type StuffConfiguration = {
	sku: string;
	stuffAddress: Stuff["address"];
	blueprint: Stuff["blueprint"];
	author: string;
	title: string;
	description: string;
	design: {
		size: number;
		pixels: string[];
	};
	selectedOptions: Record<string, string>;
};

type StuffConfiguratorContextValue = {
	configuration: StuffConfiguration;
	isConfigurationComplete: boolean;
	updateConfiguration: (patch: Partial<StuffConfiguration>) => void;
	addToCart: () => void;
};

const GRID_SIZE = 42;

const StuffConfiguratorContext = createContext<StuffConfiguratorContextValue | null>(null);

const createDefaultConfiguration = (stuff: Stuff): StuffConfiguration => {
	const { blueprint, address } = stuff;
	const { palette, sku } = blueprint;

	return {
		author: "",
		description: "",
		design: {
			pixels: getDefaultPixels(
				GRID_SIZE,
				palette[0] ?? "transparent",
				palette[1] ?? palette[0] ?? "transparent",
			),
			size: GRID_SIZE,
		},
		selectedOptions: {},
		blueprint,
		sku,
		stuffAddress: address,
		title: "",
	};
};

const StuffConfiguratorProvider = ({
	children,
	stuff,
}: PropsWithChildren<{ stuff: Stuff }>) => {
	const router = useRouter();
	const addItem = useStuffCartStore((state) => state.addItem);
	const [configuration, setConfiguration] = useState<StuffConfiguration>(() =>
		createDefaultConfiguration(stuff),
	);

	useEffect(() => {
		setConfiguration(createDefaultConfiguration(stuff));
	}, [stuff]);

	const requiredOptionNames = useMemo(
		() => configuration.blueprint.options.map(([name]) => name),
		[configuration.blueprint.options],
	);
	const isConfigurationComplete =
		configuration.author.trim().length > 0 &&
		configuration.title.trim().length > 0 &&
		configuration.description.trim().length > 0 &&
		requiredOptionNames.every((name) => Boolean(configuration.selectedOptions[name]));

	const value = useMemo<StuffConfiguratorContextValue>(
		() => ({
			configuration,
			isConfigurationComplete,
			updateConfiguration: (patch) => {
				setConfiguration((currentConfiguration) => ({
					...currentConfiguration,
					...patch,
				}));
			},
			addToCart: () => {
				if (!isConfigurationComplete) return;

				addItem({
					id: crypto.randomUUID(),
					stuff,
					configuration,
				});
				router.push(links.cart.url);
			},
		}),
		[addItem, configuration, isConfigurationComplete, router, stuff],
	);

	return (
		<StuffConfiguratorContext.Provider value={value}>
			{children}
		</StuffConfiguratorContext.Provider>
	);
};

const useStuffConfigurator = () => {
	const context = useContext(StuffConfiguratorContext);

	if (context === null) {
		throw new Error("useStuffConfigurator must be used within StuffConfiguratorProvider.");
	}

	return context;
};

export type { StuffConfiguration };
export { StuffConfiguratorProvider, useStuffConfigurator };
