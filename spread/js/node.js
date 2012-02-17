Spread.Node = atom.declare({
	name  : 'Spread.Node',
	parent: App.Element,
	prototype: {
		configure: function () {
			this.id = this.settings.get('data').id;
			this.shape = new Circle( this.createCenter(), 12 );
		},

		emphasize: function (value) {
			this.emphasized = value;
			this.face[ value ? 'show' : 'hide' ]();
			this.redraw();
			if (this.edge) this.edge.redraw();
			if (this.parent) this.parent.emphasize(value);
			return this;
		},

		createCenter: function () {
			var s = this.settings;
			return new Point( s.get('data') ).invoke('round').move( s.get('shift') );
		},

		createEdge: function (scene) {
			return this.edge = this.parent && new Spread.Edge(scene, {
				source: this,
				target: this.parent
			});
		},

		createFace: function (scene) {
			return this.face = new Spread.Face(scene, { node: this });
		},

		get parent () {
			var parent = this.settings.get('parent') || null;
			return parent == this ? null : parent;
		},

		get currentBoundingShape () {
			return this.shape;
		},

		clearPrevious: function (ctx) {
			if (this.previousBoundingShape) ctx.clear(this.previousBoundingShape);
		},

		saveCurrentBoundingShape: function () {
			this.previousBoundingShape = this.currentBoundingShape.clone().grow(2);
			return this;
		},

		renderTo: function (ctx) {
			var style = this.settings.get('first') ? 1 : this.emphasized ? 0 : 2;

			ctx.fill  ( this.shape, ['#d99','#9d9','#ccc'][style]);
			ctx.stroke( this.shape, ['#633','#363','#999'][style]);
		}
	}
});