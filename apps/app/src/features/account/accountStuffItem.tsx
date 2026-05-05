import type { StuffItem } from "@/features/stuff/types";
import { Box } from "@/primitives/box";

type AccountStuffItemProps = {
	stuffItem: StuffItem;
};
const AccountStuffItem = (props: AccountStuffItemProps) => {
	return <Box>{props.stuffItem.title}</Box>;
};

export { AccountStuffItem };
