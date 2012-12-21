/** @class Filler.Player */
atom.declare('Filler.Player', {

    initialize: function(app, number){

        this.events = new atom.Events(this);
        this.number = number;
        this.moves = 0;
        this.points = [];
        this.strategy = new Filler.RandomStrategy(); 

        this.counter = new Filler.Graphic.Counter(app.layer, {
            app: app,
            shape: new Rectangle(new Point(0, 0), app.cellSize.clone().mul(new Point(2, 1))),
            colors: app.colors,
            player: this
        });
    },

    get value () {
        return this._value;
    },

    set value(value) {
        var v = Number(value);

        this.points.forEach(function(point){
            point.value = v;
        });
        this._value = v;
    },

    get power() {
        return this.points.length;
    },

    set power(value) {},

    addPoint: function(point){
        if (point.player && point.player.number == this.number) {
            return false;
        }
        point.player = this;
        this.points.push(point);
    },

    move: function (value){
        this.value = value;
        this.moves++;
        this.events.fire('done', [ this, this.value ]);
    },

    toString: function(){
        return "[Player " + this.number + "]";
    }
    
});
