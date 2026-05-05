"use client";

import { PonderProvider as PonderProviderPrimitive } from "@ponder/react";
import type { PropsWithChildren } from "react";
import { ponderClient } from "@/providers/ponder.config";

const PonderProvider = (props: PropsWithChildren) => {
	return <PonderProviderPrimitive client={ponderClient}>{props.children}</PonderProviderPrimitive>;
};

export { PonderProvider };
