"use client";

import { useEffect, useMemo, useState } from "react";
import { Box } from "@/primitives/box";

type ClockCity = {
	label: string;
	timeZone: string;
};

const CITIES: ClockCity[] = [
	{ label: "Lisbon", timeZone: "Europe/Lisbon" },
	{ label: "Paris", timeZone: "Europe/Paris" },
	{ label: "Santa Barbara", timeZone: "America/Los_Angeles" },
	{ label: "Melbourne", timeZone: "Australia/Melbourne" },
	{ label: "Shanghai", timeZone: "Asia/Shanghai" },
];

const formatTime = (date: Date, timeZone: string) => {
	return new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
		timeZone,
	}).format(date);
};

const WorldClock = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	const clocks = useMemo(
		() =>
			CITIES.map((city) => ({
				...city,
				time: formatTime(now, city.timeZone),
			})),
		[now],
	);

	return (
		<Box className="flex flex-wrap items-center gap-x-2 text-xs leading-none text-muted-foreground">
			{clocks.map((clock) => (
				<Box key={clock.label} className="flex items-center gap-1.5">
					<Box className="">{clock.label}:</Box>
					<Box className="tabular-nums text-foreground">{clock.time}</Box>
				</Box>
			))}
		</Box>
	);
};

export { WorldClock };
