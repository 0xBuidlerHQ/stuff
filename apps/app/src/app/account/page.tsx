"use client";

import type { PropsWithChildren } from "react";
import { AccountStuffItem } from "@/features/account/accountStuffItem";
import { useAccount } from "@/features/account/useAccount";
import { Box } from "@/primitives/box";
import { Container } from "@/primitives/container";

type Props = {
	label: string;
} & PropsWithChildren;

const Account = (props: Props) => {
	return (
		<Box className="flex flex-col gap-4">
			<Box className="text-muted-foreground text-sm">{props.label}</Box>
			<Box>{props.children}</Box>
		</Box>
	);
};

const Page = () => {
	const { stuffItemsByOwner } = useAccount();

	return (
		<Container>
			<Box className="text-8xl">ACCOUNT</Box>

			<Account label="Your Stuff(s)">
				{stuffItemsByOwner.map((item) => (
					<AccountStuffItem key={item.id} stuffItem={item} />
				))}
			</Account>
		</Container>
	);
};

export default Page;
