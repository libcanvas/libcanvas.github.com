new function () {
	var hMax = config.field.width  - 1;
	var vMax = config.field.height - 1;

	var horCoord = function (x) {
		if (x < 0) return hMax;
		if (x > hMax) return 0;
		return x;
	};

	var verCoord = function (y) {
		if (y < 0) return vMax;
		if (y > vMax) return 0;
		return y;
	};

	var count = function (old, x, y) {
		var left  = verCoord(x - 1);
		var right = verCoord(x + 1);
		var top   = horCoord(y - 1);
		var bot   = horCoord(y + 1);

		return old[top][left] + old[top][x] + old[top][right] +
			   old[ y ][left] +             + old[ y ][right] +
			   old[bot][left] + old[bot][x] + old[bot][right];
	};

	window.nextGeneration = function (cells) {
		var old   = cells.clone();
		var width = cells[0].length;

		for (var y = cells.length; y--;) for (var x = width; x--;) {
			var c = count(old, x, y), v = cells[y][x];
			if (v == 0) {
				if (c == 3) cells[y][x] = 1;
			} else {
				if (c != 2 && c != 3) cells[y][x] = 0;
			}
		}
	};
};