import React from "react";

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(({ className, children, ...props }, ref) => (
	<div ref={ref} className={className} {...props}>
		{children}
	</div>
));

export { Box };
