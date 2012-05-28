/** @class Ast.Manipulator */
declare( 'Ast.Manipulator', {
	keys: {
		forward : '',
		backward: '',
		left    : '',
		right   : '',
		shoot   : ''
	},

	states: {},

	owner: null,

	initialize: function (keys) {
		this.keyboard = new atom.Keyboard();
		if (Array.isArray(keys)) {
			keys = keys.associate('forward backward left right shoot'.split(' '));
		}
		this.keys = keys;
	},

	setOwner: function (owner) {
		this.owner = owner;
		return this;
	},

	/** @private */
	stateChange: function (state, callback, status, e) {
		if (this.states[state] == null) this.states[state] = false;
		if (this.states[state] == status) return;

		this.states[state] = status;

		callback.call(this.owner);
		e.preventDefault();
	},

	setStates: function (states) {
		var state;

		for (state in states) if (states.hasOwnProperty(state)) {
			this.keyboard.events
				.add( this.keys[state],
					this.stateChange.bind(this, state, states[state][0], true)
				)
				.add( this.keys[state] + ':up',
					this.stateChange.bind(this, state, states[state][1], false)
				);
		}
		return this;
	}

});

Ast.Manipulator.defaultSets = [
	'aup adown aleft aright ctrl'.split(' '),
	'w s a d shift'.split(' ')
];