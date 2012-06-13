/** @class Filler.Matrix */
atom.declare('Filler.Matrix', {

    corners: [
        Function.lambda(new Point(0,0)),
        function() { return new Point(this.size.width-1,this.size.height-1); },
        function() { return new Point(0,this.size.height-1); },
        function() { return new Point(this.size.width-1,0); }
    ],

    ended: false,

    initialize: function(app){

        this.events = new atom.Events(this);

        this.size = new Size(app.engineSize);

        var matrix = this,
            offset = new Point(app.zoneSize.x, 0),
            engine = this.engine = new Filler.Graphic.Tile.Engine(this, {
                cellSize: new Size(app.cellSize),
                cellMargin: new Size(app.cellMargin),
                size: this.size,
                methods: app.colors,
                offset: offset
            }),
            element = new TileEngine.Element(app.layer, {
                engine: engine,
                from: offset
            }),
            tmouse = new TileEngine.Mouse(element, app.mouse),
            canMove = function(cell){
                return !cell.point.player && !matrix.ended && matrix.values.indexOf(cell.value) >= 0;
            };

        app.handler.subscribe(element);

        this.points = engine.points;
        this.mix();

        this.players = [];

        tmouse.events.add({
            over: function (cell) { if (canMove(cell)){
                cell.active = true;
                app.layer.dom.element.css({ cursor: 'pointer' });

            }},
            out: function (cell){ if (cell.active){
                cell.active = false;
                app.layer.dom.element.css({ cursor: 'inherit' });
            } },
            click: function (cell) { if (canMove(cell)){ matrix.events.fire('click', [cell.value]); }}
        });

    },

    mix: function(){
		var point, x, y, weight, model,
            width = this.size.width,
            height = this.size.height,
            colors = [1,2,3,4,5,6],
            getPointByIndex = this.getPointByIndex.bind(this),
			value = function(){ return Number.random(1, 6); };
        
        this.points.forEach(function(point){
                point.value = value();
                point.number = point.y * width + point.x;
        });

        this.points.forEach(function(point){
            point._neighbours = point.getNeighbours().map(getPointByIndex).filter(function(point){ return point; });
        });

        this.corners.forEach(function(fn){
            point = this.getPointByIndex(fn.call(this));
            point.value = colors.popRandom();

            point._neighbours.forEach(function(point){
                point.value = colors.random;
            });
        }.bind(this));

        this.events.fire('update');
    },

	isIndex: function (point) {
		return point.x >= 0 && point.y >= 0 && point.x < this.size.width && point.y < this.size.height;
	},

    getPointByIndex: function(point){
		return this.isIndex(point) ? this.points[this.size.width * point.y + point.x] : null;
    },

    place: function(players){
        var point,
            size = this.size;

        this.players = players;

        players.forEach(function(player){
            point = this.corners[player.number].call(this);
            point = this.getPointByIndex(point);
            player.value = point.value;
            player.addPoint(point);
            player.events.add('done', this.move.bind(this));
        }.bind(this));
    },

    get values (){
        var all = [1,2,3,4,5,6],
            vs = this.players.map(function(p){ return p.value; });

        return all.filter(function(v){
            return vs.indexOf(v) < 0;
        });
    },

    getPointColorNeighbors: function(point){
        var result=[],
            p = this.getPointByIndex(point),
            value = p.value,
            cache=[],
            search = function(p){
                if (p.number in cache){ return false; }
                result.push(p);
                cache[p.number] = true;
                p._neighbours.map(function(n){ if (n.value == value) { search(n); } });
            }.bind(this);

        search(p);
        return result;
    },

    getPlayerNeighbors: function(player, value){
        var cache = [], result = [];

        player.points.forEach(function(point){
            point._neighbours.map(function(point){
                if (!point.player && !cache[point.number] && point.value && (!value || point.value == value)) {
                    cache[point.number] = true;
                    result.push(point);
                }
            });
        });
        return result;
    },

    getPlayerColorNeighbors: function(player){
        var getPointColorNeighbors = this.getPointColorNeighbors.bind(this),
            cache = {};

        this.getPlayerNeighbors(player).forEach(function(point){
            getPointColorNeighbors(point).forEach(function(colorpoint){
                cache[colorpoint.number] = colorpoint;
            });
        });

        return Object.values(cache);
    },

    move: function(player, value) {
        var changed = true,
            neighbours=this.getPlayerNeighbors(player, value),
            addPoint=player.addPoint.bind(player),
            memory = [];

        if (this.ended) { return false; };

        while(neighbours.length){
            neighbours.forEach(addPoint);
            neighbours = this.getPlayerNeighbors(player, value);
        }

        this.events.fire('update', [ player.points ]);
    },

    get free() {
        var value = this.size.width * this.size.height;
        this.players.forEach(function(player){
            value -= player.power;
        });
        return value;
    },

    win: function(){
        var free = this.free,
            powers = [];

        if (this.players.length == 1){
            if(!free){
                return this.ended = true;
            }
        } else {
            this.players.forEach(function(player){
                powers.push([player.power, player.number]);
            });

            powers = powers.sort(function(a, b){ return b[0] - a[0]; });

            if (!free || (powers[0][0] - powers[1][0]) > free){
                return this.ended = true;
            }
                
        }
    }

});

