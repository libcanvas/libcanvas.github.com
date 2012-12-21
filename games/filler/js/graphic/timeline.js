/** @class Filler.Graphic.Win */
atom.declare('Filler.Graphic.Timeline', App.Element, {

    moves: 0,

    configure: function () {
        var game = this.settings.get('game');

        this.animator = new atom.Animatable(this);
        this.stroke = this.shape.clone().snapToPixel();
        this.width = this.shape.width;

        game.events.add('start', this.start.bind(this));
        game.events.add('done', this.stop.bind(this));
    },

    renderTo: function (ctx) {
        var size = this.shape.height * 0.75;
        ctx
            .fill(this.shape, ctx.createGradient(this.shape, {0: "#900", 1: "#c00"}))
            .stroke( this.stroke, "#c00" )
            .text({
                text: this.moves,
                color: '#fff',
                weight: 'bold',
                size: size,
                lineHeight: size,
                padding: [0, 10],
                shadow: "1 1 2 #000",
                to: this.shape
            });
    },

    start: function(moves){
        var timeout = this.settings.get('timeout'),
            game = this.settings.get('game');

        this.moves = moves;

        this.animator.animate({
            props: {},
            time: timeout,
            onTick: function(animation){
                this.shape.width = animation.timeLeft / timeout * this.width;
                this.redraw();
            }.bind(this),
            onComplete: function(){
                game.timeout();
            }
        });
    },

    stop: function(){
        this.animator.stop();
        this.shape.width = this.width;
        this.redraw();
    }
});
