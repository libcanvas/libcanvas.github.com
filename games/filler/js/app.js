/** @class Filler.App */
atom.declare('Filler.App', {

    settings: {
        engineSize: new Point(38, 20),
        cellSize: new Point(22, 22),
        cellMargin: new Point(1, 1),
        background: "#000",
        defaultValue: 7,
        colors: {
            0: Function.lambda({0: '#000', 1: '#000'}), // black
            1: Function.lambda({0: '#99f', 1: '#66c'}), // blue
            2: Function.lambda({0: '#f90', 1: '#c60'}), // orange
            3: Function.lambda({0: '#f00', 1: '#c00'}), // red
            4: Function.lambda({0: '#0c0', 1: '#090'}), // green
            5: Function.lambda({0: '#ff0', 1: '#990'}), // yellow
            6: Function.lambda({0: '#fff', 1: '#ccc'}), // white
            7: Function.lambda({0: '#ccc', 1: '#999'}), // gray
        }
    },

    initialize: function (game) {

        this.settings = new atom.Settings(this.settings)
                                .set(game.settings.values);
        this.game = game;

        var colors = this.colors = this.settings.get('colors'),
            timeout = this.settings.get('timeout'),
            appendTo = this.settings.get('appendTo'),
            cellSize = this.cellSize = this.settings.get('cellSize'),
            cellMargin = this.cellMargin = this.settings.get('cellMargin'),
            fCell = this.fCell = cellSize.clone().move(cellMargin),
            engineSize = this.engineSize = this.settings.get('engineSize'),
            engineFullSize = this.engineFullSize = fCell.clone().mul(engineSize),
            footerSize = this.footerSize = new Point(engineFullSize.x, fCell.y * 2),
            zoneSize = this.zoneSize = new Point(fCell.x * 3, engineFullSize.y),
            fieldSize = this.fieldSize = new Point(zoneSize.x * 2 + engineFullSize.x,
                                  engineFullSize.y + footerSize.y),

            app = new App({ size: fieldSize, invoke: false, appendTo: appendTo }),
            layer = this.layer = app.createLayer({ name: 'filler', intersection: 'manual' }),
            mouse = this.mouse = new Mouse(app.container.bounds),
            handler = this.handler = new App.MouseHandler({ mouse: mouse, app: app }),

            buttonSize = fCell.clone().scale(new Point(2, 1)),
            buttonFrom = new Point(zoneSize.x, engineFullSize.y + 4),
            buttonOffset = buttonSize.clone().move(fCell).scale(new Point(1, 0)),
            button;

        [1,2,3,4,5,6].forEach(function(value){
            button = new Filler.Graphic.Button(layer, {
                shape: new Rectangle(buttonFrom, new Size(buttonSize)),
                game: game,
                value: value,
                color: colors[value]()
            });
            handler.subscribe(button);
            buttonFrom = buttonFrom.clone().move(buttonOffset);
        });
        var timeline = new Filler.Graphic.Timeline(layer, {
                timeout: timeout,
                game: game,
                shape: new Rectangle(buttonFrom, new Size(
                    engineFullSize.x - buttonOffset.x * 6,
                    fCell.y
                ))
            });
    }

});
