import type { PropsWithChildren } from "react";
import { Box } from "@/primitives/box";

const Layout = (props: PropsWithChildren) => <Box className="py-10">{props.children}</Box>;

export default Layout;
