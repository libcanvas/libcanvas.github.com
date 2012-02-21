Arkanoid.levels = [
	function (x, y) {
		// 4 blocks 5*11
		return x > 1 && x < 13 && y !=  9 && y != 15 && y != 21;
	},
	function (x, y) {
		// 75% random fill of field
		return atom.number.random(0, 3) > 0;
	},
	function (x, y) {
		return ((x-1).sin() * y.cos()).abs() < .5;
	},
	function (x, y) {
		return x - 2 > y || x + 18 < y || x + y < 18 || x + y > 26;
	}
];