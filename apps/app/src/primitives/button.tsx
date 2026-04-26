"use client";

import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/utils";

interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	href?: string;
	onClick?: MouseEventHandler<HTMLButtonElement>;
	external?: boolean;
	disabled?: boolean;
}

const Button = (props: ButtonBaseProps) => {
	const {
		children,
		onClick,
		href,
		className,
		external,
		disabled,
		type = "button",
		...rest
	} = props;

	if (href)
		return (
			<div
				className={cn(
					"group hover:cursor-pointer overflow-hidden",
					className,
					disabled && "pointer-events-none!",
				)}
			>
				<Link target={external ? "_blank" : undefined} href={href ?? "https://google.com"}>
					{children}
				</Link>
			</div>
		);

	const onClickFct = type === "submit" ? () => {} : onClick;
	return (
		<button
			type={type}
			className={cn(
				"group relative hover:cursor-pointer",
				className,
				disabled && "pointer-events-none!",
			)}
			onClick={onClickFct}
			disabled={disabled}
			{...rest}
		>
			{children}
		</button>
	);
};

const ButtonPrimary = (props: ButtonBaseProps) => {
	const { className, children, ...rest } = props;

	return (
		<Button
			className={cn(
				"rounded-2xl bg-foreground px-4 py-3 text-background transition-opacity hover:opacity-90",
				props.disabled && "opacity-50",
				className,
			)}
			{...rest}
		>
			{children}
		</Button>
	);
};

export { Button, ButtonPrimary };
