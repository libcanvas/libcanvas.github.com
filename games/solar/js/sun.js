/** @class Solar.Sun */
atom.declare('Solar.Sun', App.Element, {

	renderTo: function (ctx, resources) {
		ctx.drawImage({
			image : resources.get('images').get('sun'),
			center: this.shape.center
		});
	}

});