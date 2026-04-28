"use client";

import type { StuffERC721 } from "@0xhq/stuff.contracts/types.user";
import { useState } from "react";
import { Grid } from "@/features/grid";
import { Box } from "@/primitives/box";
import { ButtonPrimary } from "@/primitives/button";

type ProductCustomizationPanelProps = {
	sku: string;
	palette: readonly string[];
	options: StuffERC721.StuffCollection["options"];
};

const GRID_SIZE = 42;
const CELL_SIZE = 10;

const getDefaultOptionValues = (options: StuffERC721.StuffCollection["options"]) => {
	return options.reduce<Record<string, string>>((acc, option) => {
		if (option.length >= 2) {
			acc[option[0]] = option[1];
		}

		return acc;
	}, {});
};

const ProductCustomizationPanel = ({ sku, palette, options }: ProductCustomizationPanelProps) => {
	const [author, setAuthor] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() =>
		getDefaultOptionValues(options),
	);

	return (
		<Box className="grid gap-6">
			<Box className="grid gap-4 border border-border bg-background p-4">
				<div className="grid gap-2">
					<div className="text-sm text-muted-foreground">Author</div>
					<input
						value={author}
						onChange={(event) => setAuthor(event.target.value)}
						placeholder="Tell me who you are."
						className="h-10 w-full  border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
					/>
				</div>

				<div className="grid gap-2">
					<div className="text-sm text-muted-foreground">Title</div>
					<input
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder="Title your piece."
						className="h-10 w-full  border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
					/>
				</div>

				<div className="grid gap-2">
					<div className="text-sm text-muted-foreground">Description</div>
					<textarea
						value={description}
						onChange={(event) => setDescription(event.target.value)}
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
						const selectedValue = selectedOptions[name] ?? values[0];

						return (
							<div key={name} className="grid gap-2">
								<div className="text-sm">{name}</div>
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
													setSelectedOptions((current) => ({
														...current,
														[name]: value,
													}))
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

			<Box className="grid gap-3 border border-border bg-background p-4">
				<div className="flex items-baseline justify-between gap-4">
					<div>
						<div className="text-sm text-muted-foreground">Canvas</div>
						<div className="text-xs text-muted-foreground">
							Use the palette and brush controls below.
						</div>
					</div>
				</div>
				<Grid size={GRID_SIZE} cellSize={CELL_SIZE} palettes={palette} />
			</Box>

			<ButtonPrimary disabled className="w-full justify-center">
				Review
			</ButtonPrimary>
		</Box>
	);
};

export { ProductCustomizationPanel };
