
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
		var libcanvas = this.libcanvas,
			stacks = 4,
			fields = 7,
			layer  = libcanvas.createLayer('cards'),
			deck   = this.createCards( libcanvas.createLayer( 'action' ) ).shuffle();

		while (stacks--) {
			layer.addElement( new Solitaire.Stack(stacks) );
		}
		var fieldsArray = [];
		while (fields--) {
			var field = new Solitaire.Field(fields, fieldsArray);
			for (var c = fields; c-- >= 0;) field.addCard(deck.pop());
			field.cards.last.isClosed = false;
			layer.addElement( field );
			fieldsArray.push( field );
			field.cards.invoke( 'draw' );
		}

		layer.addElement( new Solitaire.Deck(deck) );

		libcanvas.addElement( new Solitaire.Table() );

		deck.invoke( 'draw' );
	},

	createCards: function (libcanvas) {
		var Card  = Solitaire.Card,
			cards = [],
			card  = null;
		Card.suits.forEach(function(suit) {
			Card.ranks.forEach(function (rank) {
				card = new Card(rank, suit);
				libcanvas.addElement( card );
				cards.push( card.stopDrawing() );
			});
		});
		return cards;
	}
});