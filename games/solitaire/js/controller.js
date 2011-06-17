
Solitaire.Controller = atom.Class({
	initialize: function (element) {
		this.libcanvas = new LibCanvas( element, {
			preloadImages: {
				cover : 'im/card-cover.png',
				cards : 'im/full-deck.png',
				cloth : 'im/green-cloth.jpg'
			}
		})
		.listenMouse()
		.size( Solitaire.config.canvas, true )
		.addEvent('ready', this.start.bind( this ))
		.start();
	},

	start: function () {
		var stacks = 4,
			fields = 7,
			layer = this.libcanvas.createLayer('cards'),
			cards = this.createCards(),
			deck = cards.slice(0).shuffle();

		while (stacks--) {
			layer.addElement( new Solitaire.Stack(stacks) );
		}
		while (fields--) {
			var field = new Solitaire.Field(fields);
			for (var c = fields; c-- >= 0;) field.addCard(deck.pop());
			layer.addElement( field );
		}

		layer.addElement( new Solitaire.Deck(deck) );

		this.libcanvas.addElement( new Solitaire.Table()  );
	},

	createCards: function () {
		var Card = Solitaire.Card, cards = [], libcanvas = this.libcanvas;
		Card.suits.forEach(function(suit) {
			Card.ranks.forEach(function (rank) {
				var card = new Card(rank, suit);
				libcanvas.addElement( card );
				cards.push( card.stopDrawing() );
			});
		});
		return cards;
	}
});