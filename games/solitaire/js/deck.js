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
		this.cards = cards;
		this.shape = new Rectangle({ from: [cfg.padding, cfg.padding], size: cfg.card });

		this
			.addEvent('statusChanged', function () {
				if (!this.cards.length) this.draw();
			})
			.addEvent('click', this.click)
			.clickable();

		this.addEvent('libcanvasSet', function () {
			this.libcanvas.addElement( this.opened = new Solitaire.Opened() );
		});
	},

	click: function () {
		if (this.cards.length) {
			this.opened.addCard( this.cards.pop() );
		} else {
			this.cards = this.opened.cards;
			this.opened.cards = [];
		}
		this.opened.draw();
		this.draw();
	},

	get sprite () {
		if (this.cards.length) return this.sprites.closed;

		return this.sprites[this.hover ? 'hover' : 'plain'];
	}
});

})(Solitaire.config);