"use client";

import { useState } from "react";
import type { GridTemplate, GridTemplatePickerProps } from "@/features/grid/types";
import { Box } from "@/primitives/box";
import { Button } from "@/primitives/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shadcn/dialog";
import { cn } from "@/utils";

const getTemplatePreviewPixels = (pixels: GridTemplate["pixels"]) => {
	const preview: string[] = [];
	const previewSize = 7;
	const stride = 6;

	for (let row = 0; row < previewSize; row++) {
		for (let column = 0; column < previewSize; column++) {
			preview.push(pixels[(row * stride + 3) * 42 + (column * stride + 3)]);
		}
	}

	return preview;
};

const GridTemplatePicker = ({
	templates,
	activeTemplateId,
	onApplyTemplate,
}: GridTemplatePickerProps) => {
	const [open, setOpen] = useState(false);
	const activeTemplate = templates.find((template) => template.id === activeTemplateId);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Box className="flex justify-between items-center gap-3 rounded-2xl border border-border/80 bg-background px-3 py-2">
				<div className="grid gap-0.5">
					<div className="text-[10px] font-unbounded uppercase text-muted-foreground">
						Templates
					</div>
					<div className="text-xs text-foreground/75">
						{activeTemplate ? activeTemplate.name : "Apply a starter design to the canvas"}
					</div>
				</div>

				<DialogTrigger asChild>
					<Button className="rounded-full border border-border/80 bg-muted/30 px-4 py-2 text-xs font-medium text-foreground transition hover:bg-muted/50">
						Templates
					</Button>
				</DialogTrigger>
			</Box>

			<DialogContent className="max-w-4xl bg-background p-0 sm:max-w-4xl">
				<DialogHeader className="border-b border-border/70 px-5 py-4">
					<DialogTitle className="font-unbounded uppercase">Templates</DialogTitle>
					<DialogDescription>
						Choose a prebuilt design and apply it to the canvas. The current canvas can still be
						undone from history after applying one.
					</DialogDescription>
				</DialogHeader>

				<div className="grid max-h-[70vh] gap-3 overflow-y-auto px-5 py-5 md:grid-cols-2 xl:grid-cols-3">
					{templates.map((template) => {
						const previewPixels = getTemplatePreviewPixels(template.pixels);
						const isActive = template.id === activeTemplateId;

						return (
							<Button
								key={template.id}
								className={cn(
									"grid gap-3 rounded-3xl border border-border/80 bg-muted/25 p-4 text-left transition hover:bg-muted/45",
									isActive &&
										"border-foreground bg-background shadow-[0_0_0_1px_var(--foreground)]",
								)}
								onClick={() => {
									onApplyTemplate(template);
									setOpen(false);
								}}
							>
								<div className="grid grid-cols-7 gap-1 rounded-2xl border border-border/70 bg-background p-2">
									{previewPixels.map((color, index) => (
										<div
											key={`${template.id}-${index}`}
											className="aspect-square rounded-[4px]"
											style={{ backgroundColor: color }}
										/>
									))}
								</div>

								<div className="grid gap-1">
									<div className="flex items-center justify-between gap-3">
										<div className="text-sm font-medium text-foreground">{template.name}</div>
										{isActive ? (
											<div className="rounded-full border border-border bg-background px-2 py-1 text-[11px] text-foreground/70">
												Active
											</div>
										) : null}
									</div>
									<div className="text-xs leading-5 text-foreground/70">{template.description}</div>
								</div>
							</Button>
						);
					})}
				</div>

				<DialogFooter showCloseButton className="border-t border-border/70 bg-background/95" />
			</DialogContent>
		</Dialog>
	);
};

export { GridTemplatePicker };
