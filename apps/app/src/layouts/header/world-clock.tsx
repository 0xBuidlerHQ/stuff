"use client";

import { useEffect, useMemo, useState } from "react";
import { Box } from "@/primitives/box";

type ClockCity = {
	label: string;
	timeZone: string;
};

type ClockState = {
	label: string;
	timeZone: string;
	targetSeconds: number;
	displaySeconds: number;
};

const CITIES: ClockCity[] = [
	{ label: "Lisbon", timeZone: "Europe/Lisbon" },
	{ label: "Montpellier", timeZone: "Europe/Paris" },
	{ label: "Santa Barbara", timeZone: "America/Los_Angeles" },
	{ label: "Melbourne", timeZone: "Australia/Melbourne" },
	{ label: "Shanghai", timeZone: "Asia/Shanghai" },
];

const formatTime = (totalSeconds: number) => {
	const normalizedSeconds = Math.max(0, Math.floor(totalSeconds));
	const hours = Math.floor(normalizedSeconds / 3600) % 24;
	const minutes = Math.floor((normalizedSeconds % 3600) / 60);
	const seconds = normalizedSeconds % 60;

	return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
};

const getCurrentSeconds = (timeZone: string) => {
	const parts = new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
		timeZone,
	}).formatToParts(new Date());

	const hours = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
	const minutes = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
	const seconds = Number(parts.find((part) => part.type === "second")?.value ?? "0");

	return hours * 3600 + minutes * 60 + seconds;
};

const createInitialClocks = () => {
	return CITIES.map((city) => ({
		...city,
		targetSeconds: getCurrentSeconds(city.timeZone),
		displaySeconds: 0,
	}));
};

const WorldClock = () => {
	const [clocks, setClocks] = useState<ClockState[]>(() => createInitialClocks());
	const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

	useEffect(() => {
		const start = performance.now();
		const duration = 1000;
		let frame = 0;
		let interval = 0;

		const updateTargets = () => {
			setClocks((currentClocks) =>
				currentClocks.map((clock) => ({
					...clock,
					targetSeconds: getCurrentSeconds(clock.timeZone),
				})),
			);
		};

		const animate = (timestamp: number) => {
			const progress = Math.min(1, (timestamp - start) / duration);
			const eased = 1 - (1 - progress) * (1 - progress);

			setClocks((currentClocks) =>
				currentClocks.map((clock) => ({
					...clock,
					displaySeconds: Math.round(clock.targetSeconds * eased),
				})),
			);

			if (progress < 1) {
				frame = window.requestAnimationFrame(animate);
				return;
			}

			setHasAnimatedIn(true);
			updateTargets();
			interval = window.setInterval(updateTargets, 1000);
		};

		frame = window.requestAnimationFrame(animate);

		return () => {
			window.cancelAnimationFrame(frame);
			window.clearInterval(interval);
		};
	}, []);

	const displayClocks = useMemo(() => {
		return clocks.map((clock) => ({
			label: clock.label,
			time: hasAnimatedIn ? formatTime(clock.targetSeconds) : formatTime(clock.displaySeconds),
		}));
	}, [clocks, hasAnimatedIn]);

	return (
		<Box className="flex flex-wrap items-center gap-x-2 text-xs leading-none text-muted-foreground">
			{displayClocks.map((clock) => (
				<Box key={clock.label} className="flex items-center gap-1.5">
					<Box>{clock.label}:</Box>
					<Box className="tabular-nums text-foreground transition-[transform,opacity] duration-200">
						{clock.time}
					</Box>
				</Box>
			))}
		</Box>
	);
};

export { WorldClock };
