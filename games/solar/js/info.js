/** @class Solar.Info */
atom.declare('Solar.Info', App.Element, {

	settings: { hidden: true },

	get planet () {
		return this.settings.get('planet');
	},

	configure: function () {
		this.bindMethods(['show', 'hide']);
		this.shape = new Rectangle(0,0,100,30);
	},

	updateShape: function (from) {
		this.shape.moveTo(from).move([20,10])
	},

	show: function () {
		this.settings.set({ hidden: false });
		this.redraw();
	},

	hide: function () {
		this.settings.set({ hidden: true });
		this.redraw();
	},

	renderTo: function (ctx) {
		ctx.fill(this.shape, '#002244');
		ctx.text({
			to   : this.shape,
			text : this.planet.settings.get('name'),
			color: '#0ff',
			align: 'center',
			optimize: false,
			padding: 3
		})
	}

});