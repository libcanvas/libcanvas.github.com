(function (cfg) {

Solitaire.Deck = atom.Class({
	Implements: [ DrawableSprite, Clickable ],

	Generators : {
		sprites: function () {
			var image = this.libcanvas.getImage( 'cover' );
			return Object.map({ closed: 3, plain: 1, hover: 0 }, function (i) {
				return image.sprite({ from: [cfg.card.width * i, 0], size: cfg.card });
			});
		}
	},
	
	zIndex: 2,

	initialize: function (cards) {
		this.shape = new Rectangle({ from: [cfg.padding, cfg.padding], size: cfg.card });
		this.cards = cards;
		cards.forEach(function (card) {
			card.shape = this.shape.clone();
		}.bind(this));

		this
			.listenMouse()
			.addEvent('click', this.click)
			.clickable(function () {
				if (!this.cards.length) this.draw();
			});

		this.addEvent('libcanvasSet', function () {
			this.libcanvas.addElement( this.opened = new Solitaire.Opened() );
		});
	},

	click: function () {
		if (this.cards.length) {
			this.cards.pop()
				.openTo(this.opened.shape, function (card) {
					this.opened.addCard( card );
					this.opened.draw();
				}.bind(this));
		} else {
			this.cards = this.opened.cards
				.reverse()
				.map(function (card) {
					card.shape.moveTo( this.shape );
					return card;
				}.bind(this));
			this.opened.cards = [];
			this.opened.draw();
			this.libcanvas.layer('action').update();
		}
		this.draw();
	},

	get sprite () {
		if (this.cards.length) return this.sprites.closed;

		return this.sprites[this.hover ? 'hover' : 'plain'];
	}
});

})(Solitaire.config);