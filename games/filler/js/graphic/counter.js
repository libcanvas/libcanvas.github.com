/** @class Filler.Graphic.Counter */
atom.declare('Filler.Graphic.Counter', App.Element, {

    offsets: [
        function() { return new Point(this.app.cellSize.x + 2, 0); },
        function() { return new Point(this.app.zoneSize.x + this.app.engineFullSize.x + 2, this.app.engineFullSize.y - this.app.cellSize.y); },
        function() { return new Point(this.app.cellSize.x + 2, this.app.engineFullSize.y - this.app.cellSize.y); },
        function() { return new Point(this.app.zoneSize.x + this.app.engineFullSize.x + 2, 0); }
    ],

    configure: function () {
        var player = this.player = this.settings.get('player'),
            animator = new atom.Animatable(this),
            animate = function(){
                this.hidden = !this.hidden;
                this.redraw();
                animator.animate({
                    props: { },
                    onComplete: animate });
            }.bind(this);

        this.app = this.settings.get('app');
        this.colors = this.settings.get('colors');
        this.hidden = false;
        this.align = player.number % 2 ? 'left' : 'right';

        this.shape.move(this.offsets[player.number].call(this));

        player.events.add('start', animate);
        player.events.add('done', function(player, value){
            animator.stop();
            this.hidden = false;
            this.redraw();
        }.bind(this));
    },

    get value (){
        return this.player.points.length;
    },

    get color (){
        return this.hidden ? '#000' : this.colors[this.player.value]()[0];
    },

    renderTo: function(ctx){
        ctx.text({
                to: this.shape,
                size: this.shape.size.y * 0.75,
                lineHeight: this.shape.size.y * 0.75,
                text: this.value,
                color: this.color,
                padding: [0,2],
                weight: 'bold',
                align: this.align
            });
    }

});
