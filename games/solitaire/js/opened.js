(function (cfg) {

// Место, куда открываются карты из колоды
Solitaire.Opened = atom.Class({
	Extends: DrawableSprite,

	Implements: [ MouseListener ],

	zIndex: 2,

	initialize: function () {
		this.cards = [];
		this.shape = new Rectangle({ from: [cfg.padding * 2 + cfg.card.width, cfg.padding], size: cfg.card });

		this.addEvent('click', this.click).listenMouse();
	},

	addCard: function (card) {
		this.cards.push( card );
		return this;
	},

	click: function () {
		console.log('Opened.Click');
	},

	get sprite () {
		return this.cards.length ? this.cards.last.sprite : null;
	},

	draw: function () {
		if (this.sprite) {
			this.parent();
		} else {
			this.libcanvas.ctx.clearRect( this.shape );
		}
	}
});

})(Solitaire.config);