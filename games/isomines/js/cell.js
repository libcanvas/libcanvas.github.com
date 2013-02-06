/** @class IsoMines.Cell */
atom.declare( 'IsoMines.Cell', App.Element, {

	imageSize: new Size(180, 104),

	value: 0,

	configure: function () {

		this.value = Number.random(0, 8);

		this.imageIndex = Number.random(0, 5);

		this.animatable = new atom.Animatable(this);

		this.clickable = new App.Clickable(this, this.redraw).start();

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
		ctx.drawImage({ image : image, center: this.shape.center });
	},

	clearPrevious: function () {},

	renderTo: function (ctx, resources) {
		this.drawImage(ctx, this.getImage(8, 0));
		this.drawImage(ctx, this.getImage(11, 1, 'gates'));
		this.drawImage(ctx, this.getImage(this.imageIndex, 0));

		if (this.hover) {
			this.drawImage(ctx, this.getImage(6, 0));
		} else {
			this.drawImage(ctx, this.getImage(7, 0));
		}

		if (this.value) {
			this.drawImage(ctx, this.getImage(this.value-1, 1));
		}

	}


});