/** @class Mines.Controller */
atom.declare( 'Mines.Controller', {
	initialize: function () {
		atom.ImagePreloader.run({
			flag: 'flag-mine.png [48:48]{0:0}',
			mine: 'flag-mine.png [48:48]{1:0}'
		}, this.start.bind(this) );
	},

	start: function (images) {
		this.size  = new Size(30, 16);
		this.mines = 99;

		this.images = images;
		this.view = new Mines.View( this, this.size );
		this.generator = new Mines.Generator( this.size, this.mines );
		this.action = new Mines.Action(this);
	}

});