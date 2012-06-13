/** @class Filler.Game */
atom.declare('Filler.Game', {

    settings: {
        timeout: 21000,
        bots: {
            // 0: 'GreedStrategy',
            1: 'GreedStrategy',
            2: 'RandomStrategy',
            3: 'RandomStrategy'
        },
        players: 2
    },

    moves: 0,

    current: 0,
    
	initialize: function (settings) {

		this.settings = new atom.Settings(this.settings).set(settings);

        this.events = new atom.Events(this);

        var app = Filler.App(this),
            matrix = this.matrix = new Filler.Matrix(app);

        this.matrix.events.add('click', function(value){ this.player.move(value); }.bind(this));

        // Init players
        this.players = [];
        this.initPlayers(app);
        this.matrix.place(this.players);

        this.players.forEach(function(player){ player.events.add('done', this.move.bind(this)); }.bind(this));

        this.bots = Object.map(this.settings.get('bots'), function(strategy){
            return Filler[strategy]();
        });

    },

    initPlayers: function (app) {
        var n = 0, player, players=this.settings.get('players');
        for (; n < players; n++){
            this.players.push(new Filler.Player(app, n));
        }
    },

    get player() {
        return this.players[this.current];
    },

    set player (value) {
        this.current = value.number;
    },

    move: function() {

        this.events.fire('done', arguments);

        if (this.matrix.win()){
            new Filler.Graphic.Win(this);
            this.events.fire('end', [ this.player, this.moves ]);
            return false;
        }

        this.current = (this.current + 1) % this.players.length;
        this.start();
    },

    start: function(){
        this.events.fire('start', [ ++this.moves, this.matrix.values ]);
        this.player.events.fire('start');
        if (this.bots[this.player.number]){
            setTimeout(function(){
                this.timeout(
                    this.bots[this.player.number]
                );
            }.bind(this), 300);
        }
    },

    timeout: function(strategy){

        var brain = strategy || this.player.strategy,
            value = brain.move(this.player, this.matrix);

        this.player.move(value);
    }

});
