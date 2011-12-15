Dune.buildingsList = function (rows, cells, buildings) {
	var full = [], x, y;

	for (y = rows; y--;) for (x = cells; x--;) {
		buildings.forEach(function (b) {
			full.push([
				b[0],
				b[1] + x*10,
				b[2] + y*10
			]);
		});
	}

	return full;
}(5, 8, [
	[ 'silo'   ,   1,   1 ],
	[ 'plate'  ,   3,   1 ],
	[ 'plate'  ,   4,   1 ],
	[ 'plate'  ,   5,   1 ],
	[ 'plate'  ,   6,   1 ],
	[ 'plate'  ,   7,   1 ],
	[ 'plate'  ,   8,   1 ],
	[ 'plate'  ,   9,   1 ],
	[ 'plate'  ,   3,   2 ],
	[ 'plate'  ,   1,   3 ],
	[ 'plate'  ,   2,   3 ],
	[ 'plate'  ,   3,   3 ],
	[ 'factory',   4,   2 ],
	[ 'plate'  ,   3,   4 ],
	[ 'plate'  ,   3,   5 ],
	[ 'radar'  ,   1,   4 ],
	[ 'plate'  ,   4,   4 ],
	[ 'plate'  ,   5,   4 ],
	[ 'plate'  ,   6,   4 ],
	[ 'plate'  ,   7,   4 ],
	[ 'plate'  ,   8,   4 ],
	[ 'plate'  ,   9,   4 ],
	[ 'power'  ,   4,   5 ],
	[ 'power'  ,   6,   5 ],
	[ 'power'  ,   8,   5 ],
	[ 'harvest',   7,   2 ],
	[ 'silo'   ,   1,   6 ],
	[ 'silo'   ,   1,   8 ],
	[ 'plate'  ,   3,   6 ],
	[ 'plate'  ,   3,   7 ],
	[ 'plate'  ,   4,   7 ],
	[ 'plate'  ,   5,   7 ],
	[ 'plate'  ,   6,   7 ],
	[ 'plate'  ,   7,   7 ],
	[ 'plate'  ,   8,   7 ],
	[ 'plate'  ,   9,   7 ],
	[ 'plate'  ,   3,   8 ],
	[ 'plate'  ,   3,   9 ],
	[ 'plate'  ,   7,   8 ],
	[ 'harvest',   4,   8 ]
]);