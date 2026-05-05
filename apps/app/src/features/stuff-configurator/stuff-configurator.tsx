"use client";

import type { Stuff, StuffConfiguration } from "@/features/stuff/types";
import { Box } from "@/primitives/box";
import { ButtonPrimary } from "@/primitives/button";
import { Grid } from "./grid";
import { StuffConfiguratorProvider, useStuffConfigurator } from "./provider";

type StuffConfiguratorProps = {
	stuff: Stuff;
};

const StuffConfiguratorContent = () => {
	const { configuration, isConfigurationComplete, updateConfiguration, addToCart } =
		useStuffConfigurator();
	const { options, palette } = configuration.stuff.blueprint;

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
					{options.map((option) => {
						const [name, ...values] = option;
						const selectedValue = configuration.selectedOptions[name];

						return (
							<div key={name} className="grid gap-2">
								<div className="capitalize text-xs font-unbounded text-muted-foreground">
									{`///// ${name} /////`}
								</div>
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
													} satisfies Partial<StuffConfiguration>)
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

const StuffConfigurator = ({ stuff }: StuffConfiguratorProps) => {
	return (
		<StuffConfiguratorProvider stuff={stuff}>
			<StuffConfiguratorContent />
		</StuffConfiguratorProvider>
	);
};

export { StuffConfigurator };
