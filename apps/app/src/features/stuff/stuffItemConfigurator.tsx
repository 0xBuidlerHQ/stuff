"use client";

import {
	createContext,
	type PropsWithChildren,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { MainColors, StuffCollection, StuffItemCart } from "@/config/types";
import { useCartStore } from "@/features/cart/store";
import { Grid } from "@/features/grid/grid";
import { gridTemplateLibrary } from "@/features/grid/templates";
import { getDefaultPixels } from "@/features/grid/utils";
import { Box } from "@/primitives/box";
import { ButtonPrimary } from "@/primitives/button";
import { useStuffEcosystem } from "@/providers/stuff-ecosystem";

type StuffItemConfiguration = {
	stuffCollection: StuffCollection;
	author: StuffItemCart["author"];
	title: StuffItemCart["title"];
	description: StuffItemCart["description"];
	design: {
		size: number;
		pixels: string[];
	};
	selectedOptions: Record<string, string>;
};

type StuffItemConfiguratorProps = {
	stuffCollection: StuffCollection;
};

type StuffItemConfiguratorContextValue = {
	configuration: StuffItemConfiguration;
	isConfigurationComplete: boolean;
	updateConfiguration: (patch: Partial<StuffItemConfiguration>) => void;
	addToCart: () => void;
};

const GRID_SIZE = 42;
const StuffItemConfiguratorContext = createContext<StuffItemConfiguratorContextValue | null>(null);

const getDefaultDisplayColors = (displayPalette: string[], mainColors?: MainColors) => {
	const firstColor = mainColors?.black.hexValue ?? displayPalette[0] ?? "transparent";
	const secondColor = mainColors?.white.hexValue ?? displayPalette[1] ?? firstColor;

	return { firstColor, secondColor };
};

const getOptions = (stuffCollection: StuffCollection) => {
	if (!Array.isArray(stuffCollection.options)) {
		return [];
	}

	return stuffCollection.options
		.filter((option): option is string[] => Array.isArray(option))
		.map((option) => option.filter((value): value is string => typeof value === "string"));
};

const getCanvas = (
	configuration: StuffItemConfiguration,
	displayPalette: string[],
	pantonePalette: string[],
): StuffItemCart["canvas"] => {
	const pantoneByDisplayColor = new Map(
		displayPalette.map((color, index) => [color, pantonePalette[index]] as const),
	);
	return configuration.design.pixels.map((color) => {
		const pantone = pantoneByDisplayColor.get(color);

		if (!pantone) {
			throw new Error(`Unknown Pantone color: ${color}`);
		}

		return pantone;
	});
};

const getSelectedOptions = (configuration: StuffItemConfiguration): StuffItemCart["options"] => {
	return getOptions(configuration.stuffCollection).map(([name]) => {
		const value = configuration.selectedOptions[name];

		if (!value) {
			throw new Error(`Missing option value for ${name}`);
		}

		return [name, value];
	});
};

const getCartItem = (
	configuration: StuffItemConfiguration,
	displayPalette: string[],
	pantonePalette: string[],
): StuffItemCart => {
	return {
		author: configuration.author,
		canvas: getCanvas(configuration, displayPalette, pantonePalette),
		description: configuration.description,
		options: getSelectedOptions(configuration),
		stuffCollectionAddress: configuration.stuffCollection.address,
		title: configuration.title,
	};
};

const createDefaultConfiguration = (
	stuffCollection: StuffCollection,
	displayPalette: string[],
	mainColors?: MainColors,
): StuffItemConfiguration => {
	const { firstColor, secondColor } = getDefaultDisplayColors(displayPalette, mainColors);

	return {
		author: "",
		description: "",
		design: {
			pixels: getDefaultPixels(GRID_SIZE, firstColor, secondColor),
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
	const addItem = useCartStore((state) => state.addItem);
	const { getPantoneDisplayColor, pantoneColors, mainColors } = useStuffEcosystem();
	const pantonePalette = useMemo(
		() => pantoneColors.map((pantoneColor) => pantoneColor.pantone),
		[pantoneColors],
	);
	const displayPalette = useMemo(
		() => pantonePalette.map(getPantoneDisplayColor),
		[getPantoneDisplayColor, pantonePalette],
	);

	const [configuration, setConfiguration] = useState<StuffItemConfiguration>(() =>
		createDefaultConfiguration(stuffCollection, displayPalette, mainColors),
	);

	useEffect(() => {
		setConfiguration((currentConfiguration) => {
			if (currentConfiguration.stuffCollection.id === stuffCollection.id) {
				const hasOnlyPlaceholderPixels = currentConfiguration.design.pixels.every(
					(pixel) => pixel === "transparent",
				);

				if (displayPalette.length > 0 && hasOnlyPlaceholderPixels) {
					return createDefaultConfiguration(stuffCollection, displayPalette, mainColors);
				}

				return currentConfiguration;
			}

			return createDefaultConfiguration(stuffCollection, displayPalette, mainColors);
		});
	}, [displayPalette, mainColors, stuffCollection]);

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
				setConfiguration(createDefaultConfiguration(stuffCollection, displayPalette, mainColors));
				addItem(getCartItem(configuration, displayPalette, pantonePalette));

				requestAnimationFrame(() => {
					window.scrollTo({ top: 0, behavior: "smooth" });
				});
			},
		}),
		[
			addItem,
			configuration,
			displayPalette,
			isConfigurationComplete,
			mainColors,
			pantonePalette,
			stuffCollection,
		],
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
	const { getPantoneDisplayColor, pantoneColors, mainColors } = useStuffEcosystem();
	const options = getOptions(configuration.stuffCollection);
	const displayPalette = useMemo(
		() => pantoneColors.map((pantoneColor) => getPantoneDisplayColor(pantoneColor.pantone)),
		[getPantoneDisplayColor, pantoneColors],
	);
	const templates = useMemo(
		() =>
			gridTemplateLibrary.map((template) => ({
				id: template.id,
				name: template.name,
				description: template.description,
				pixels: template.canvas.flat().map((pantone) => getPantoneDisplayColor(pantone)),
			})),
		[getPantoneDisplayColor],
	);

	return (
		<Box className="grid gap-6">
			<Box className="grid gap-3 border border-border bg-background p-4">
				<div className="flex items-baseline justify-between gap-4">
					<div className="flex flex-col gap-1">
						<div className="text-xs font-unbounded">Canvas</div>

						<div className="text-xs text-muted-foreground">{"///"} Customize your design.</div>
					</div>
				</div>

				<Grid
					mainColors={mainColors}
					palettes={displayPalette}
					pixels={configuration.design.pixels}
					templates={templates}
					onPixelsChange={(pixels) =>
						updateConfiguration({ design: { ...configuration.design, pixels } })
					}
				/>
			</Box>

			<Box className="grid gap-4 border border-border bg-background p-4">
				<div className="grid gap-2">
					<div className="flex flex-col gap-1">
						<div className="text-xs font-unbounded">Author</div>
						<div className="text-xs text-muted-foreground">{"///"} Sign your piece.</div>
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
						<div className="text-xs text-muted-foreground">{"///"} Title your piece.</div>
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
						<div className="text-xs text-muted-foreground">{"///"} Describe your piece.</div>
					</div>
					<textarea
						value={configuration.description}
						onChange={(event) => updateConfiguration({ description: event.target.value })}
						placeholder="-"
						className="min-h-28 w-full border border-border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
					/>
				</div>
			</Box>

			<Box className="grid gap-4 border border-border bg-background p-4">
				<div className="flex flex-col gap-1">
					<div className="text-xs font-unbounded">Options</div>
					<div className="text-xs text-muted-foreground">{"///"} Choose your options.</div>
				</div>

				<div className="grid gap-4">
					{options.map((option: string[]) => {
						const [name, ...values] = option;
						const selectedValue = configuration.selectedOptions[name];

						return (
							<div key={name} className="grid gap-2">
								<div className="capitalize text-xs text-muted-foreground">{`${name}`}</div>
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
													} satisfies Partial<StuffItemConfiguration>)
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
