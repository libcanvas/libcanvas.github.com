/** @class IsoMines.Cell */
atom.declare( 'IsoMines.Cell', App.Element, {

	actions: [ 'open', 'all', 'lock' ],

	preStates: {
		opened: 'opening',
		closed: 'unlocking',
		locked: 'locking'
	},

	imageSize: new Size(180, 104),

	value: 0,

	configure: function () {
		this.value = Math.random() > 0.5 ? Number.random(0,8) : 0;
		this.imageIndex = Number.random(0, 5);
		this.animation  = null;

		this.events.add('mousedown', function (e) {
			this.activate(e.button);
		});
	},

	activate: function (button) {
		if (button == 0) this.open();
		if (button == 2) this.lock();
	},

	open: function () {
		if (this.state == 'closed') {
			this.goTo('opened', function () {

			});
		} else if (this.state == 'opened') {
			this.all();
		}
	},

	lock: function () {
		if (this.state == 'closed' || this.state == 'locked') {
			this.goTo(this.state == 'closed' ? 'locked' : 'closed', function () {

			});
		}
	},

	all: function () {

	},

	state: 'closed',

	goTo: function (state, callback) {
		var preState = this.preStates[state];
		if (preState) {
			this.state = preState;

			this.animation = new Animation({
			    sheet   : this.settings.get('sheets')[preState],
			    onUpdate: this.redraw,
			    onStop  : function () {
				    this.state = state;
				    this.animation = null;
				    this.redraw();
				    callback.call(this);
			    }.bind(this)
			})
		}
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
		if (this.value && this.state.begins('open')) {
			this.drawImage(ctx, 'static-number-' + this.value);
		}
		this.drawGates(ctx);
		this.drawImage(ctx, 'static-carcass-' + this.imageIndex);

	}


});