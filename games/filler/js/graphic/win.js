/** @class Filler.Graphic.Win */
atom.declare('Filler.Graphic.Win', {

    banners: [
        [ '       ',
          '   #   ',
          '  ##   ',
          ' # #   ',
          '   #   ',
          '   #   ',
          '   #   ',
          ' ##### ',
          '       '],

        [ '       ',
          '  ###  ',
          ' #   # ',
          ' #   # ',
          '   ##  ',
          '  #    ',
          ' #     ',
          ' ##### ',
          '       '],
        
        [ '       ',
          '  ###  ',
          ' #   # ',
          ' #   # ',
          '   ##  ',
          '     # ',
          ' #   # ',
          '  ###  ',
          '       '],

        [ '       ',
          ' #   # ',
          ' #   # ',
          ' #   # ',
          '  #### ',
          '     # ',
          '     # ',
          '     # ',
          '       ']
    ],

    initialize: function(game){

        var animator = new atom.Animatable(this),
            engine = game.matrix.engine,
            banner = this.banners[game.player.number],
            xb = Math.floor(engine.width / 2 - 4),
            yb = Math.floor(engine.height / 2 - 5),
            points = [],
            fill = game.matrix.values.random,
            animate = function(){
                var p = points.pop(),
                    cell = engine.getCellByIndex(new Point(p[1], p[2]));
                cell.point.player = game.player;
                cell.value = p[0];

                if (points.length){
                    animator.animate({
                        props: {},
                        time: 50,
                        onComplete: animate
                    });
                }
            },
            char, cell;

        banner.forEach(function(line, y){
            var x = 0;
            for (; x < line.length; x++) {
                char = banner[y][x];
                points.push([
                    char == '#' ? fill : game.player.value,
                    xb + x,
                    yb + y
                ]);
            }
        });

        animate();
        
    }
    
});
