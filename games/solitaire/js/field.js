(function (cfg) {

Solitaire.Field = atom.Class({

	Implements: [ Drawable ],

	zIndex: 2,

	initialize: function (index) {
		this.index = index;
		this.cards = [];
	},

	addCard: function (card) {
		this.cards.include( card );
	},

	removeCard: function (card) {
		this.cards.erase( card );
	},

	rectangle: function (i) {
		return new Rectangle({
			from: [
				cfg.padding + (cfg.card.width + cfg.padding) * this.index,
				cfg.card.height + cfg.padding * (i + 3)
			],
			size: cfg.card
		});
	},

	draw: function () {
		var cards = this.cards, l = cards.length, i = 0;
		for( ; i < l; i++ ) {
			cards[i].drawTo( this.libcanvas.ctx, this.rectangle(i), cards[i] != cards.last );
		}
	}
});

})(Solitaire.config);