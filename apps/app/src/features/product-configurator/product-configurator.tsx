"use client";

import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import { useEffect, useMemo } from "react";
import { useProductCheckoutStore } from "@/features/product-checkout";
import { Box } from "@/primitives/box";
import { ButtonPrimary } from "@/primitives/button";
import { Grid, getDefaultPixels } from "./grid";
import { type ProductConfiguration, useProductConfiguratorStore } from "./store";

type ProductConfiguratorProps = {
	collection: StuffERC721.StuffCollection;
};

const GRID_SIZE = 42;

const ProductConfigurator = ({ collection }: ProductConfiguratorProps) => {
	const { options, palette, sku } = collection;
	const openCheckoutDrawer = useProductCheckoutStore((state) => state.openCheckoutDrawer);
	const storedConfiguration = useProductConfiguratorStore(
		(state) => state.configurationsBySku[sku],
	);
	const ensureConfiguration = useProductConfiguratorStore((state) => state.ensureConfiguration);
	const updateConfigurationInStore = useProductConfiguratorStore(
		(state) => state.updateConfiguration,
	);

	const defaultConfiguration = useMemo(
		() => ({
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
			collection,
			sku,
			title: "",
		}),
		[collection, palette, sku],
	);
	const configuration = storedConfiguration ?? defaultConfiguration;
	const requiredOptionNames = useMemo(() => options.map(([name]) => name), [options]);
	const isConfigurationComplete =
		configuration.author.trim().length > 0 &&
		configuration.title.trim().length > 0 &&
		configuration.description.trim().length > 0 &&
		requiredOptionNames.every((name) => Boolean(configuration.selectedOptions[name]));

	useEffect(() => {
		ensureConfiguration(sku, defaultConfiguration);
	}, [defaultConfiguration, ensureConfiguration, sku]);

	const updateConfiguration = (patch: Partial<ProductConfiguration>) => {
		ensureConfiguration(sku, defaultConfiguration);
		updateConfigurationInStore(sku, patch);
	};

	const openCheckout = () => {
		if (!isConfigurationComplete) return;

		ensureConfiguration(sku, defaultConfiguration);
		openCheckoutDrawer(sku);
	};

	return (
		<Box className="grid gap-6">
			<Box className="grid gap-3 border border-border bg-background p-4">
				<div className="flex items-baseline justify-between gap-4">
					<div>
						<div className="text-sm">Canvas</div>
						<div className="text-xs text-muted-foreground">
							Use the palette and brush controls below.
						</div>
					</div>
				</div>

				<Grid
					size={configuration.design.size}
					palettes={palette}
					pixels={configuration.design.pixels}
					onPixelsChange={(pixels) =>
						updateConfiguration({
							design: {
								...configuration.design,
								pixels,
							},
						})
					}
				/>
			</Box>

			<Box className="grid gap-4 border border-border bg-background p-4">
				<div className="grid gap-2">
					<div className="text-sm">Author</div>
					<input
						value={configuration.author}
						onChange={(event) => updateConfiguration({ author: event.target.value })}
						placeholder="Tell me who you are."
						className="h-10 w-full  border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
					/>
				</div>

				<div className="grid gap-2">
					<div className="text-sm">Title</div>
					<input
						value={configuration.title}
						onChange={(event) => updateConfiguration({ title: event.target.value })}
						placeholder="Title your piece."
						className="h-10 w-full  border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
					/>
				</div>

				<div className="grid gap-2">
					<div className="text-sm">Description</div>
					<textarea
						value={configuration.description}
						onChange={(event) => updateConfiguration({ description: event.target.value })}
						placeholder="Describe your piece."
						className="min-h-28 w-full  border border-border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
					/>
				</div>
			</Box>

			<Box className="grid gap-3 border border-border bg-background p-4">
				<div className="text-sm text-muted-foreground">Options</div>
				<div className="grid gap-4">
					{options.map((option) => {
						const [name, ...values] = option;
						const selectedValue = configuration.selectedOptions[name];

						return (
							<div key={name} className="grid gap-2">
								<div className="text-sm capitalize">{name}</div>
								<div className="flex flex-wrap gap-2">
									{values.map((value) => {
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
													})
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
				onClick={openCheckout}
				disabled={!isConfigurationComplete}
				className="w-full justify-center"
			>
				Review
			</ButtonPrimary>
		</Box>
	);
};

export { ProductConfigurator };
