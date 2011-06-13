(function (cfg) {

Solitaire.Card = atom.Class({

	Implements: [ DrawableSprite ],

	Generators: {
		sprite: function () {
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

	Static: {
		ranks: ['king','queen','jack',10,9,8,7,6,5,4,3,2,'ace'],
		suits: ['spades','clubs','hearts','diamonds']
	},

	rank: null,
	suit: null,

	initialize: function (rank, suit) {
		this.rank = rank;
		this.suit = suit;
	},

	drawTo: function (ctx, rectangle, closed) {
		ctx.drawImage( closed ? this.closed : this.sprite, rectangle );
	}

});

})(Solitaire.config);