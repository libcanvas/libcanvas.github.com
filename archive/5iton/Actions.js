Grafiti.Actions = new Class({
	index : 0,
	dumps : [],
	dump  : function (image) {
		this.dumps = this.dumps.slice(0, this.index + 1);
		this.dumps.push(image.ctx.getClone());
		if (this.dumps.length > 128) this.dumps.shift();
		this.index = this.dumps.length - 1;
		return this;
	},
	canSave : function () {
		return this.dumps.length > 1;
	},
	canClear : function () {
		return this.dumps.length > 1;
	},
	clear : function () {
		this.dumps = [];
		this.index = 0;
		return this;
	},
	canUndo : function () {
		return this.index > 0;
	},
	undo : function () {
		if (!this.canUndo()) {
			throw 'cant undo';
		}
		return this.dumps[--this.index];
	},
	canRedo : function () {
		return this.dumps.length && this.index < this.dumps.length - 1;
	},
	redo : function () {
		if (!this.canRedo()) {
			throw 'cant redo';
		}
		return this.dumps[++this.index];
	}
});