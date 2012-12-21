/** @class Filler.RandomStrategy */
atom.declare('Filler.RandomStrategy', {
    
    move: function(player, matrix){
        var neighbours = matrix.getPlayerNeighbors(player),
            values = matrix.values;

        neighbours = neighbours.filter(function(p){
            return values.indexOf(p.value) >= 0;
        });

        if (!neighbours.length) {
            return values.random;
        }

        return Number(neighbours.random.value);
    }

});

/** @class Filler.GreedStrategy */
atom.declare('Filler.GreedStrategy', {
    
    move: function(player, matrix){
        var neighbours = matrix.getPlayerColorNeighbors(player),
            values = matrix.values,
            model = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };

        neighbours = neighbours.filter(function(p){
            return values.indexOf(p.value) >= 0;
        });

        if (!neighbours.length) {
            return values.random;
        }

        neighbours.forEach(function(point){
            model[point.value] += 1;
        });

        return Number(Object.max(model));
    }

});
