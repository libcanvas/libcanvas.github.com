window.bindEvents = function (mouse, engine) {
	var generation = 0, generationTrace = new LibCanvas.Utils.Trace(generation);
	var timeout = 0;
	var cells = engine.matrix;
	var timeTrace = new LibCanvas.Utils.Trace();

	mouse.addEvent('click', function (e) {
		var cell = engine.getCell(e.offset);
		cells[cell.y][cell.x] = cell.t == 1 ? 0 : 1;
		engine.update();
	});

	var start = function () {
		if (timeout) return;

		var update = function () {
			var time = Date.now();
			nextGeneration(cells);
			engine.update();
			timeTrace.value = 'Time: ' + (Date.now() - time);
			generationTrace.value = 'Generation: ' + ++generation;
			timeout = update.delay(config.updateTime);
		};
		update();
	};

	var stop = function () {
		if (timeout) {
			timeout.stop();
			timeout = 0;
		}
	};

	atom.dom('button.start').bind('click', start);

	atom.dom('button.stop').bind('click', stop);

	atom.dom('button.clear').bind('click', function () {
		if (confirm('Clear field?')) {
			for (var y = cells.length; y--;) for (var x = cells[y].length; x--;) {
				cells[y][x] = 0;
			}
		}
	});

	atom.dom('button.random').bind('click', function () {
		stop();
		for (var y = cells.length; y--;) for (var x = cells[y].length; x--;) {
			cells[y][x] = Number.random(0, 1);
		}
		start();
	});
};