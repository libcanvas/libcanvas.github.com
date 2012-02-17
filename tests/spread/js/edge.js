Spread.Edge = atom.declare({
	name  : 'Spread.Edge',
	parent: App.Element,
	prototype: {
		configure: function () {
			this.shape = new Line(
				this.source.shape.center,
				this.target.shape.center
			);
		},

		get source () {
			return this.settings.get('source');
		},

		get target () {
			return this.settings.get('target');
		},

		get currentBoundingShape () {
			return this.shape;
		},

		clearPrevious: function (ctx) {
			if (this.previousBoundingShape) {
				ctx.clear(this.previousBoundingShape, true);
			}
		},

		saveCurrentBoundingShape: function () {
			this.previousBoundingShape = this.currentBoundingShape.clone();
			return this;
		},

		renderTo: function (ctx) {
			ctx
				.save()
				.set({ opacity: 0.3 })
				.stroke( this.shape, ['#300','#999'][this.source.emphasized ? 0:1] )
				.restore();
		}
	}
});