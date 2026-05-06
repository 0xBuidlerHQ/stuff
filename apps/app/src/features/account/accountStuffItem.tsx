import type { StuffItem } from "@/config/types";
import { Box } from "@/primitives/box";

type AccountStuffItemProps = {
	stuffItem: StuffItem;
};

const AccountStuffItem = (props: AccountStuffItemProps) => {
	return <Box>{props.stuffItem.title}</Box>;
};

export { AccountStuffItem };
