const getBrushPixelIndexes = (index: number, size: number, brushSize: number) => {
	const indexes: number[] = [];
	const centerRow = Math.floor(index / size);
	const centerColumn = index % size;
	const offsetStart = -Math.floor((brushSize - 1) / 2);
	const offsetEnd = offsetStart + brushSize - 1;

	for (let rowOffset = offsetStart; rowOffset <= offsetEnd; rowOffset++) {
		for (let columnOffset = offsetStart; columnOffset <= offsetEnd; columnOffset++) {
			const row = centerRow + rowOffset;
			const column = centerColumn + columnOffset;

			if (row < 0 || row >= size || column < 0 || column >= size) {
				continue;
			}

			indexes.push(row * size + column);
		}
	}

	return indexes;
};

export { getBrushPixelIndexes };
