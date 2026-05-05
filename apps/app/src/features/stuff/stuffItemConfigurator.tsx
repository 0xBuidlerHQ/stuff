"use client";

import {
	createContext,
	type PropsWithChildren,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { StuffCollection } from "@/config/types";
import { useStuffCartStore } from "@/features/stuff-cart/store";
import { Box } from "@/primitives/box";
import { ButtonPrimary } from "@/primitives/button";
import { Grid, getDefaultPixels } from "../grid";
import type { StuffItemParams } from "./types";

type StuffItemConfiguratorProps = {
	stuffCollection: StuffCollection;
};

type StuffItemConfiguratorContextValue = {
	configuration: StuffItemParams;
	isConfigurationComplete: boolean;
	updateConfiguration: (patch: Partial<StuffItemParams>) => void;
	addToCart: () => void;
};

const GRID_SIZE = 42;
const MAX_PALETTE_COLORS = 256;

const StuffItemConfiguratorContext = createContext<StuffItemConfiguratorContextValue | null>(null);

const getPalette = (stuffCollection: StuffCollection) => {
	if (!Array.isArray(stuffCollection.palette)) {
		return [];
	}

	return stuffCollection.palette
		.slice(0, MAX_PALETTE_COLORS)
		.filter((color): color is string => typeof color === "string");
};

const getOptions = (stuffCollection: StuffCollection) => {
	if (!Array.isArray(stuffCollection.options)) {
		return [];
	}

	return stuffCollection.options
		.filter((option): option is string[] => Array.isArray(option))
		.map((option) => option.filter((value): value is string => typeof value === "string"));
};

const createDefaultConfiguration = (stuffCollection: StuffCollection): StuffItemParams => {
	const palette = getPalette(stuffCollection);

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
		stuffCollection,
		title: "",
	};
};

const StuffItemConfiguratorProvider = ({
	children,
	stuffCollection,
}: PropsWithChildren<{ stuffCollection: StuffCollection }>) => {
	const addItem = useStuffCartStore((state) => state.addItem);
	const [configuration, setConfiguration] = useState<StuffItemParams>(() =>
		createDefaultConfiguration(stuffCollection),
	);

	useEffect(() => {
		setConfiguration((currentConfiguration) => {
			if (currentConfiguration.stuffCollection.id === stuffCollection.id) {
				return currentConfiguration;
			}

			return createDefaultConfiguration(stuffCollection);
		});
	}, [stuffCollection]);

	const requiredOptionNames = useMemo(
		() =>
			getOptions(configuration.stuffCollection)
				.map((option: string[]) => option[0])
				.filter((name: string | undefined): name is string => typeof name === "string"),
		[configuration.stuffCollection],
	);
	const isConfigurationComplete =
		configuration.author.trim().length > 0 &&
		configuration.title.trim().length > 0 &&
		configuration.description.trim().length > 0 &&
		requiredOptionNames.every((name: string) => Boolean(configuration.selectedOptions[name]));

	const value = useMemo<StuffItemConfiguratorContextValue>(
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
				window.scrollTo({ top: 0, behavior: "smooth" });

				addItem(configuration);
			},
		}),
		[addItem, configuration, isConfigurationComplete],
	);

	return (
		<StuffItemConfiguratorContext.Provider value={value}>
			{children}
		</StuffItemConfiguratorContext.Provider>
	);
};

const useStuffItemConfigurator = () => {
	const context = useContext(StuffItemConfiguratorContext);

	if (context === null) {
		throw new Error("useStuffItemConfigurator must be used within StuffItemConfiguratorProvider.");
	}

	return context;
};

const StuffItemConfiguratorContent = () => {
	const { configuration, isConfigurationComplete, updateConfiguration, addToCart } =
		useStuffItemConfigurator();
	const options = getOptions(configuration.stuffCollection);
	const palette = getPalette(configuration.stuffCollection);

	return (
		<Box className="grid gap-6">
			<Box className="grid gap-3 border border-border bg-background p-4">
				<div className="flex items-baseline justify-between gap-4">
					<div className="flex flex-col gap-1">
						<div className="text-xs font-unbounded">Canvas</div>

						<div className="text-xs text-muted-foreground">
							/ Use the palette and brush controls below.
						</div>
					</div>
				</div>

				<Grid
					size={configuration.design.size}
					palettes={palette}
					pixels={configuration.design.pixels}
					onPixelsChange={(pixels) =>
						updateConfiguration({ design: { ...configuration.design, pixels } })
					}
				/>
			</Box>

			<Box className="grid gap-4 border border-border bg-background p-4">
				<div className="grid gap-2">
					<div className="flex flex-col gap-1">
						<div className="text-xs font-unbounded">Author</div>
						<div className="text-xs text-muted-foreground">/ Tell me who you are.</div>
					</div>
					<input
						value={configuration.author}
						onChange={(event) => updateConfiguration({ author: event.target.value })}
						placeholder="-"
						className="h-10 w-full border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
					/>
				</div>

				<div className="grid gap-2">
					<div className="flex flex-col gap-1">
						<div className="text-xs font-unbounded">Title</div>
						<div className="text-xs text-muted-foreground">/ Title your piece.</div>
					</div>
					<input
						value={configuration.title}
						onChange={(event) => updateConfiguration({ title: event.target.value })}
						placeholder="-"
						className="h-10 w-full border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
					/>
				</div>

				<div className="grid gap-2">
					<div className="flex flex-col gap-1">
						<div className="text-xs font-unbounded">Description</div>
						<div className="text-xs text-muted-foreground">/ Describe your piece.</div>
					</div>
					<textarea
						value={configuration.description}
						onChange={(event) => updateConfiguration({ description: event.target.value })}
						placeholder="-"
						className="min-h-28 w-full border border-border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
					/>
				</div>
			</Box>

			<Box className="grid gap-8 border border-border bg-background p-4">
				<div className="flex flex-col gap-1">
					<div className="text-xs font-unbounded">Options</div>
					<div className="text-xs text-muted-foreground">/ Choose your options.</div>
				</div>

				<div className="grid gap-4">
					{options.map((option: string[]) => {
						const [name, ...values] = option;
						const selectedValue = configuration.selectedOptions[name];

						return (
							<div key={name} className="grid gap-2">
								<div className="capitalize text-xs font-unbounded text-muted-foreground">
									{`///// ${name} /////`}
								</div>
								<div className="flex flex-wrap gap-2">
									{values.map((value: string) => {
										const isSelected = selectedValue === value;

										return (
											<button
												key={value}
												type="button"
												className={[
													"border px-3 py-2 text-sm transition",
													isSelected
														? "border-foreground bg-foreground text-background"
														: "border-border hover:bg-muted",
												].join(" ")}
												onClick={() =>
													updateConfiguration({
														selectedOptions: {
															...configuration.selectedOptions,
															[name]: value,
														},
													} satisfies Partial<StuffItemParams>)
												}
											>
												{value}
											</button>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</Box>

			<ButtonPrimary
				onClick={addToCart}
				disabled={!isConfigurationComplete}
				className="w-full justify-center"
			>
				Add To Cart
			</ButtonPrimary>
		</Box>
	);
};

const StuffItemConfigurator = ({ stuffCollection }: StuffItemConfiguratorProps) => {
	return (
		<StuffItemConfiguratorProvider stuffCollection={stuffCollection}>
			<StuffItemConfiguratorContent />
		</StuffItemConfiguratorProvider>
	);
};

export { StuffItemConfigurator };
