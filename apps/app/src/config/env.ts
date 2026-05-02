const getString = (name: string, fallback?: string) => {
	const value = process.env[name] ?? fallback;

	if (value === undefined || value === "") {
		throw new Error(`Missing environment variable: ${name}`);
	}

	return value;
};

const getOptionalString = (name: string) => {
	const value = process.env[name];

	return value && value.length > 0 ? value : undefined;
};

const getNumber = (name: string, fallback?: number) => {
	const rawValue = process.env[name];

	if ((rawValue === undefined || rawValue === "") && fallback !== undefined) {
		return fallback;
	}

	const value = Number(getString(name));

	if (Number.isNaN(value)) {
		throw new Error(`Invalid number environment variable: ${name}`);
	}

	return value;
};

const env = {
	CHAIN_ID: getNumber("CHAIN_ID"),
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: getString("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
	RELAYER_PRIVATE_KEY: getString("RELAYER_PRIVATE_KEY"),
	RPC_URL: getString("RPC_URL", "http://127.0.0.1:8545"),
	BASE_RPC_URL: getOptionalString("BASE_RPC_URL"),
	BASE_SEPOLIA_RPC_URL: getOptionalString("BASE_SEPOLIA_RPC_URL"),
	STRIPE_SECRET_KEY: getOptionalString("STRIPE_SECRET_KEY"),
} as const;

export { env };
