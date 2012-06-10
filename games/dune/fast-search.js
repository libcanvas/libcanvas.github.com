/** @class Dune.FastSearch */
atom.declare( 'Dune.FastSearch', App.ElementsMouseSearch, {
	initialize: function () {
	},

	add: function (item) {

		return this;
	},

	remove: function (item) {

		return this;
	},

	findByPoint: function (point) {
		var item;
		return item ? [ item ] : [];
	}
});