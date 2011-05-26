
Game3d.View = atom.Class({
	Implements: [ atom.Class.Options ],

	options: {
		level: []
	},

	initialize: function (libcanvas, options) {
		this.setOptions( options );
		this.libcanvas = libcanvas;
	},

	action: function (time) {
		return null;
	},

	render: function () {
		return null;
	},



	//////// Controls
	_controls: [],
	controls: function (control) {
		var c = this._controls, i = c.length, fn;
		while (i--) {
			fn = c[i][control];
			if (fn && fn()) return true;
		}
		return false;
	},
	addControls: function (controls) {
		this._controls.push(controls);
		return this;
	}
	//////// End of controls
});