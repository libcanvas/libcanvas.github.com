window.bindEvents = function (mouse, engine) {
	var generation = 0, generationTrace = new LibCanvas.Utils.Trace(generation);
	var timeout = 0;
	var cells = engine.matrix;

	mouse.addEvent('click', function (e) {
		var cell = engine.getCell(e.offset);
		cells[cell.y][cell.x] = cell.t == 1 ? 0 : 1;
		engine.update();
	});

	atom.dom('button.start').bind('click', function () {
		if (timeout) return;

		timeout = function () {
			nextGeneration(cells);
			engine.update();
			generationTrace.value = 'Generation: ' + ++generation;
		}.periodical(config.updateTime);
	});

	atom.dom('button.stop').bind('click', function () {
		if (timeout) {
			timeout.stop();
			timeout = 0;
		}
	});

	atom.dom('button.clear').bind('click', function () {
		if (confirm('Clear field?')) {
			for (var y = cells.length; y--;) for (var x = cells[y].length; x--;) {
				cells[y][x] = 0;
			}
		}
	});
}