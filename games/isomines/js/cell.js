/** @class IsoMines.Cell */
atom.declare( 'IsoMines.Cell', App.Element, {

	actions: [ 'open', 'all', 'lock' ],

	preStates: {
		reclosed: 'closing',
		opened  : 'opening',
		closed  : 'unlocking',
		locked  : 'locking'
	},

	imageSize : new Size(180, 104),
	controller: null,

	sheets: null,
	point : null,
	value : 0,
	lost  : false,
	state : 'closed',

	configure: function () {
		this.settings.properties(this, 'point sheets controller');

		this.value = 0;
		this.imageIndex = Number.random(0, 5);
		this.animation  = null;

		this.events.add('mousedown', function (e) {
			if (!e.shiftKey) this.activate(e.button);
		});
	},

	isLocked: function () {
		return this.state == 'locked' || this.state == 'locking';
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

	close: function () {
		if (this.state == 'opened')  {
			this.changeState('reclosed', function () {
				this.state = 'closed';
			});
		}
	},

	open: function (auto) {
		if (this.lost && !auto) return;

		if (this.state == 'closed') {
			if (!this.lost && this.value == 'mine') {
				this.lose();
			}

			this.changeState('opened', function () {
				this.controller.view.opened(this);
				if (!this.value) {
					this.all();
				}
			});
		} else if (!auto && this.correctLockesCount()) {
			if (this.countLockes() == this.value) {
				this.all();
			}
		}
	},

	correctLockesCount: function () {
		return this.state == 'opened' && this.countLockes() == this.value;
	},

	lock: function () {
		if (this.lost) return;

		if (this.state == 'closed' || this.state == 'locked') {
			this.changeState( this.state == 'closed' ? 'locked' : 'closed' );
		}
	},

	all: function () {
		this.eachNeighbour(function (cell) {
			cell.open(true);
		});
	},

	countLockes: function () {
		var lockes = 0;

		this.eachNeighbour(function (cell) {
			if (cell.isLocked()) {
				lockes++
			}
		});

		return lockes;
	},

	eachNeighbour: function (callback) {
		this.controller.generator
			.getNeighbours(this.point)
			.forEach(function (point) {
				callback.call( this, this.controller.view.getCell(point) );
			}.bind(this));
	},

	changeState: function (state, callback) {
		this.state = this.preStates[state];

		this.animation = new Animation({
		    sheet   : this.sheets[this.state],
		    onUpdate: this.redraw,
		    onStop  : function () {
			    this.state = state;
			    this.animation = null;
			    this.redraw();
			    callback && callback.call(this);
		    }.bind(this)
		});
	},

	clearPrevious: function () {},

	renderTo: function (ctx) {
		this.drawImage(ctx, 'static-background');
		if (this.valueIsVisible()) {
			this.drawImage(ctx, this.getValueImage());
		}
		this.drawImage(ctx, this.getGatesImage());
		this.drawImage(ctx, 'static-carcass-' + this.imageIndex);
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

	getGatesImage: function () {
		return (this.animation && this.animation.get()) || 'gates-' + this.state;
	},

	valueIsVisible: function () {
		return this.value && ['opened','opening','closing'].contains(this.state);
	},

	getValueImage: function () {
		return this.value == 'mine' ?
			'static-mine' :
			'static-number-' + this.value;
	}

});