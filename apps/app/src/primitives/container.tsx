import { Box } from "@/primitives/box";
import { cn } from "@/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {}

const Container = ({ children, className, ...props }: ContainerProps) => {
	return (
		<Box
			className={cn(
				"mx-auto max-w-(--app-w) px-(--app-px) box-content w-[calc(100vw-2*var(--app-px))]",
				className,
			)}
			{...props}
		>
			{children}
		</Box>
	);
};

export { Container };
