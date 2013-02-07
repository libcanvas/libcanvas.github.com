/** @class Mines.Action */
atom.declare( 'Mines.Action', {
	actions: [ 'open', 'all', 'close' ],

	initialize: function (controller) {
		this.controller = controller;
		this.bindMouse();

		this.startTime = null;

		this.minesLeft = controller.mines;
		this.minesTrace = atom.trace(0);
		this.changeMines(0);

		this.emptyCells = controller.size.width * controller.size.height - this.minesLeft;
	},

	changeMines: function (delta) {
		this.minesLeft += delta;
		this.minesTrace.value = "Mines: " + this.minesLeft;
	},

	bindMouse: function () {
		var view, mouse;

		view = this.controller.view;
		mouse = new Mouse(view.app.container.bounds);

		new App.MouseHandler({ mouse: mouse, app: view.app })
			.subscribe( view.element );

		mouse.events.add( 'contextmenu', Mouse.prevent );

		new TileEngine.Mouse( view.element, mouse ).events
			.add( 'down', function (cell, e) {
				this.activate(cell, e.button);
			}.bind(this));
	},

	activate: function (cell, actionCode) {
		if (typeof actionCode == 'number') {
			actionCode = this.actions[actionCode];
		}

		if (actionCode == 'open' && parseInt(cell.value)){
			this.all(cell);
		} else {
			this[actionCode](cell);
		}
	},

	open: function (cell) {
		if (this.lost || cell.value != 'closed') return;

		var value, gen = this.controller.generator;

		if (!gen.isReady()) {
			gen.generate(cell.point);
			this.startTime = Date.now();
		}

		if (gen.isMine(cell.point)) {
			this.lose(cell);
		} else {
			value = gen.getValue(cell.point);

			if (value) {
				cell.value = value;
			} else {
				this.openEmpty(cell);
			}

			if (--this.emptyCells == 0) {
				this.win();
			}
		}
	},

	win: function () {
		var time = Math.round((Date.now()-this.startTime)/1000);
		alert.delay(100, window, ['Congratulations! Mines has been neutralized in '+time+' sec!']);
	},

	lost: false,

	lose: function (cell) {
		this.lost = true;

		cell.value = 'explode';

		this.controller.view.engine.cells
			.forEach(this.checkCell.bind(this));
	},

	checkCell: function (cell) {
		if (cell.value == 'closed' || cell.value == 'flag') {
			var isMine = this.controller.generator.isMine(cell.point);

			if (isMine && cell.value == 'closed') {
				cell.value = 'mine';
				this.emptyCells--;
			}
			if (!isMine && cell.value == 'flag') {
				cell.value = 'wrong';
			}
		}
	},

	eachNeighbour: function (cell, callback) {
		this.controller.generator
			.getNeighbours(cell.point)
			.forEach(function (point) {
				callback.call( this, this.getCell(point) );
			}.bind(this));
	},

	openNeighbours: function (cell) {
		this.eachNeighbour(cell, function (cell) {
			this.open( cell );
		});
	},

	openEmpty: function (cell) {
		cell.value = 'empty';

		this.openNeighbours(cell);
	},

	getCell: function (point) {
		return this.controller.view.engine.getCellByIndex(point);
	},

	close: function (cell) {
		if (this.lost) return;

		if (cell.value == 'closed') {
			cell.value = 'flag';
			this.changeMines(-1);
		} else if (cell.value == 'flag') {
			cell.value = 'closed';
			this.changeMines(+1);
		}
	},

	all: function (cell) {
		if (!parseInt(cell.value)) return;

		var flags = 0;

		this.eachNeighbour(cell, function (cell) {
			if ( cell.value == 'flag' ) {
				flags++;
			}
		});

		if (flags == cell.value) {
			this.openNeighbours(cell);
		}
	}

});
