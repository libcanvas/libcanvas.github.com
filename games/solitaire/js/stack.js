(function (cfg) {

Solitaire.Stack = atom.Class({
	Implements: [ DrawableSprite ],

	Generators: {
		sprite: function () {
			return this.libcanvas.getImage('cover').sprite({
				from: [cfg.card.width * 2, 0], size: cfg.card
			});
		}
	},

	zIndex: 2,

	initialize: function (index) {
		this.shape = new Rectangle({
			from: [cfg.padding + (cfg.card.width + cfg.padding) * (3 + index), cfg.padding],
			size: cfg.card
		});
	}
});

})(Solitaire.config);