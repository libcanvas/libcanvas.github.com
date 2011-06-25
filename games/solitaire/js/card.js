(function (cfg) {

Solitaire.Card = atom.Class({

	Implements: [ DrawableSprite, Animatable, Draggable, Droppable ],

	Generators: {
		opened: function () {
			return this.libcanvas.getImage('cards').sprite({
				from: [
					(cfg.card.width  + cfg.imagePadding) * this.self.ranks.indexOf( this.rank ),
					(cfg.card.height + cfg.imagePadding) * this.self.suits.indexOf( this.suit )
				],
				size: cfg.card
			});
		},

		closed: function () {
			return this.libcanvas.getImage('cover').sprite({
				from: [ cfg.card.width * 3, 0 ], size: cfg.card
			});
		}
	},

	get sprite () {
		return this.isClosed ? this.closed : this.opened;
	},

	Static: {
		ranks: ['king','queen','jack',10,9,8,7,6,5,4,3,2,'ace'],
		suits: ['spades','clubs','hearts','diamonds']
	},

	rank: null,
	suit: null,

	initialize: function (rank, suit) {
		this.rank = rank;
		this.suit = suit;


		this.addEvent({
			startDrag: function () {
				this.startDrawing();
				this.libcanvas.update();
			},
			moveDrag: function () {
				this.libcanvas.update();
			}
		});
	},

	isClosed: true,

	moveTo: function (rectangle, fn) {
		this
			.startDrawing()
			.animate({
				props: {
					'shape.x': rectangle.from.x,
					'shape.y': rectangle.from.y
				},
				time: 300,
				onProcess: this.libcanvas.update,
				onFinish: function () {
					this.stopDrawing();
					fn && fn(this);
				}
			});
	},

	openTo: function (rectangle, fn) {
		this.isClosed = true;
		rectangle = rectangle || this.shape;
		var diff = this.shape.from.diff( rectangle.from ),
			aim  = rectangle.from.clone();
		
		this
			.startDrawing()
			.animate({
				props: {
					'shape.x': this.shape.x + this.shape.width/2 + diff.x / 2,
					'shape.y': this.shape.y + diff.y / 2,
					'shape.width' : 0
				},
				time: 100,
				onFinish: function (anim, prev) {
					this.isClosed = false;
					this.animate({
						props: {
							'shape.x': aim.x,
							'shape.y': aim.y,
							'shape.width': prev['shape.width']
						},
						onFinish: function () {
							this.stopDrawing();
							fn && fn(this);
						},
						time: 100,
						onProcess: this.libcanvas.update
					});
				},
				onProcess: this.libcanvas.update
			});
	},

	drawTo: function (ctx, rectangle) {
		ctx.drawImage( this.isClosed ? this.closed : this.opened, rectangle );
	}
});

})(Solitaire.config);