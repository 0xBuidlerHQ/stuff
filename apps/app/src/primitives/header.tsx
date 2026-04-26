import { Container } from "@/primitives/container";
import { cn } from "@/utils";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

const HeaderPrimitive = ({ children, className }: HeaderProps) => (
	<Container
		className={cn(
			"mx-auto max-w-(--header-w) px-(--header-px) box-content w-[calc(100vw-2*var(--header-px))]",
			className,
		)}
	>
		{children}
	</Container>
);

export { HeaderPrimitive };
