const EMPTY_COLOR = "transparent";
const CANVAS_SIZE = 42;

const COMPANY_LOGO = [
	[0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 1, 0, 1, 0],
	[0, 0, 1, 1, 1, 0, 0],
	[0, 1, 1, 1, 1, 1, 0],
	[0, 0, 1, 1, 1, 0, 0],
	[0, 1, 0, 1, 0, 1, 0],
	[0, 0, 0, 0, 0, 0, 0],
] as const;

const getDefaultPixels = (size: number, firstColor: string, secondColor: string) => {
	const logoCellSize = Math.max(1, Math.floor(size / COMPANY_LOGO.length));
	const pixels = Array(size * size).fill(firstColor);

	for (let logoRow = 0; logoRow < COMPANY_LOGO.length; logoRow++) {
		for (let logoColumn = 0; logoColumn < COMPANY_LOGO[logoRow].length; logoColumn++) {
			const color = COMPANY_LOGO[logoRow][logoColumn] === 1 ? secondColor : firstColor;
			const startRow = logoRow * logoCellSize;
			const startColumn = logoColumn * logoCellSize;

			for (let row = startRow; row < Math.min(size, startRow + logoCellSize); row++) {
				for (
					let column = startColumn;
					column < Math.min(size, startColumn + logoCellSize);
					column++
				) {
					pixels[row * size + column] = color;
				}
			}
		}
	}

	return pixels;
};

const arePixelsEqual = (left: readonly string[], right: readonly string[]) => {
	if (left.length !== right.length) {
		return false;
	}

	return left.every((color, index) => color === right[index]);
};

export { arePixelsEqual, CANVAS_SIZE, EMPTY_COLOR, getDefaultPixels };
