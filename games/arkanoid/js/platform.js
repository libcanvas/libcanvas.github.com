atom.declare( 'Arkanoid.Platform', Arkanoid.Item, {
	configure: function () {
		this.animation = this.createAnimation();
	},

	createAnimation: function () {
		var images, sheet;

		images = this.settings.get('images');

		sheet = new Animation.Sheet({
			frames  : new Animation.Frames( images.get('platform'), 100, 8 ),
			delay   : 30
		});

		return new Animation({
			sheet   : sheet,
			onUpdate: this.redraw,
			onStop  : function () {
				this.run.delay( Number.random(1000, 5000), this );
			}
		});
	},


	move: function (shift) {
		var field = this.settings.get('controller').fieldSize;

		// block if is near left wall
		if (shift < 0 && shift + this.shape.from.x < 0) {
			shift = -this.shape.from.x;
		// block if is near right wall
		} else if (shift > 0 && shift + this.shape.to.x > field.width) {
			shift = field.width - this.shape.to.x;
		}

		if (shift !== 0) {
			this.collisionRectangle = null;
			this.shape.move(new Point( shift, 0 ));
			this.redraw();
		}
		return this;
	},

	isAction: function (action) {
		var keyboard = this.settings.get('controller').keyboard;
		switch (action) {
			case 'moveLeft' : return keyboard.key( 'aleft' );
			case 'moveRight': return keyboard.key( 'aright' );
		}
		return false;
	},

	hit: function () {
		this.redraw();
		if (--this.lives < 1) this.lives = 3;
		return this;
	},

	onUpdate: function (time) {
		var moveSpeed = (this.settings.get('speed') * time / 1000).round();
		if (this.isAction('moveLeft')) {
			this.move( -moveSpeed );
		} else if (this.isAction('moveRight')) {
			this.move(  moveSpeed );
		}
	},

	renderTo: function (ctx) {
		ctx
			.fill( this.shape, ctx.createRectangleGradient( this.shape, this.colors[this.lives] ))
			.stroke( this.strokeRectangle, 'rgba(0,0,0,0.2)' );

		if (this.animation.get()) {
			ctx.drawImage( this.animation.get(), this.shape );
		}

	}
});