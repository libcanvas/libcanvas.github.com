/** @class Filler.Graphic.Button */
atom.declare('Filler.Graphic.Button', App.Element, {

    configure: function(){
        var game = this.settings.get('game');

        this.value = this.settings.get('value');
        this.color = this.settings.get('color');
        this.disabled = false;
        this.stroke = this.shape.clone().snapToPixel();

	    new App.Clickable( this, this.redraw ).start();

        game.events.add('start', this.update.bind(this));
        this.events.add('mousedown', function(){
            game.player.move(this.value);
        });
        
    },

    update: function(moves, values){
        this.disabled = values.indexOf(this.value) < 0;
        this.redraw();
    },

    renderTo: function(ctx){
        if (this.hover && !this.disabled){
            ctx.fill(this.shape, this.color[0]);
            this.layer.dom.element.css({ cursor: 'pointer' });
        } else {
            ctx.fill(this.shape, this.disabled ? '#000' : ctx.createGradient(this.shape, this.color));
            this.layer.dom.element.css({ cursor: 'inherit' });
        }
        ctx.stroke(this.stroke, this.color[1]);
    }

});
