import { Container } from "@/primitives/container";
import { cn } from "@/utils";

interface FooterProps extends React.HTMLAttributes<HTMLElement> {}

const FooterPrimitive = ({ children, className }: FooterProps) => (
	<Container
		className={cn(
			"mx-auto max-w-(--footer-w) px-(--footer-px) box-content w-[calc(100vw-2*var(--footer-px))]",
			className,
		)}
	>
		{children}
	</Container>
);

export { FooterPrimitive };
