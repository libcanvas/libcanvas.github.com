/** @class IsoMines.Cell */
atom.declare( 'IsoMines.Cell', App.Element, {

	actions: [ 'open', 'all', 'lock' ],

	preStates: {
		reclosed: 'closing',
		opened: 'opening',
		closed: 'unlocking',
		locked: 'locking'
	},

	imageSize : new Size(180, 104),
	controller: null,

	sheets: null,
	point : null,
	state : 'closed',
	value : 0,
	lost  : false,

	configure: function () {
		this.settings.properties(this, 'point sheets controller');

		this.value = 0;
		this.imageIndex = Number.random(0, 5);
		this.animation  = null;

		this.events.add('mousedown', function (e) {
			this.activate(e.button);
		});
	},

	activate: function (button) {
		this.controller.checkReady(this.point);

		if (button == 0) this.open();
		if (button == 2) this.lock();
	},

	lose: function () {
		this.controller.view.cells.forEach(function (cell) {
			cell.lost = true;

			if (cell.state == 'closed' && cell.value == 'mine') {
				cell.open.delay(Number.random(0,2000), cell, [ true ]);
			}
		});
	},

	close: function (callback) {
		if (this.state != 'opened') return;

		this.goTo('reclosed', function () {
			this.state = 'closed';
		});
	},

	open: function (auto) {
		if (this.lost && !auto) return;

		if (this.state == 'closed') {
			if (!this.lost && this.value == 'mine') {
				this.lose();
			}

			this.goTo('opened', function () {
				this.controller.view.opened(this);
				if (!this.value) {
					this.all();
				}
			});
		} else if (this.state == 'opened' && !auto) {
			this.all();
		}
	},

	lock: function () {
		if (this.lost) return;

		if (this.state == 'closed' || this.state == 'locked') {
			this.goTo(
				this.state == 'closed' ? 'locked' : 'closed',
				function () {}
			);
		}
	},

	all: function () {
		this.eachNeighbour(function (cell) {
			cell.open(true);
		});
	},

	eachNeighbour: function (callback) {
		this.controller.generator
			.getNeighbours(this.point)
			.forEach(function (point) {
				callback.call( this, this.controller.view.getCell(point) );
			}.bind(this));
	},

	goTo: function (state, callback) {
		var preState = this.preStates[state];

		if (!preState) return;

		this.state = preState;

		this.animation = new Animation({
		    sheet   : this.sheets[preState],
		    onUpdate: this.redraw,
		    onStop  : function () {
			    this.state = state;
			    this.animation = null;
			    this.redraw();
			    callback.call(this);
		    }.bind(this)
		});
	},

	getImage: function (x, y, str) {
		return this.layer.app.resources
			.get('images')
			.get(str || 'static')
			.sprite(new Rectangle(
				new Point(this.imageSize.width * x, this.imageSize.height * y),
				this.imageSize
			));
	},

	drawImage: function (ctx, image) {
		if (typeof image == 'string') {
			image = this.layer.app.resources.get('images').get(image);
		}

		ctx.drawImage({ image : image, center: this.shape.center });
	},

	clearPrevious: function () {},

	drawGates: function (ctx) {
		if (' closed opened locked'.indexOf(this.state) > 0) {
			this.drawImage(ctx, 'gates-' + this.state);
		} else if (this.animation && this.animation.get()) {
			this.drawImage(ctx, this.animation.get());
		}
	},

	renderTo: function (ctx) {
		this.drawImage(ctx, 'static-background');
		if (this.value && (this.state.begins('open') || this.state == 'closing')) {
			if (this.value == 'mine') {
				this.drawImage(ctx, 'static-mine');
			} else {
				this.drawImage(ctx, 'static-number-' + this.value);
			}
		}
		this.drawGates(ctx);
		this.drawImage(ctx, 'static-carcass-' + this.imageIndex);
	}

});