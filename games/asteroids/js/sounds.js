/** @class Ast.Sounds */
declare( 'Ast.Sounds', {

	ext: null,
	map: null,
	sounds: null,
	prefix: '',

	initialize: function (prefix, map) {
		var elem = document.createElement('audio'), cpt = elem.canPlayType;
		// some bugs with audio in firefox
		if (cpt && navigator.userAgent.toLowerCase().indexOf("firefox") == -1) {
			if (cpt.call(elem, 'audio/ogg; codecs="vorbis"')) this.ext = 'ogg';
			else if (cpt.call(elem, 'audio/mpeg;'))           this.ext = 'mp3';
		}

		this.prefix = prefix;
		this.map = map || {};
		this.sounds = {};
	},

	getFileName: function (name) {
		return this.prefix + (this.map[name] || name) + '.' + this.ext;
	},

	play: function (name) {
		if (!this.ext) return;

		var audio, sounds = this.sounds, i, max = null;

		if (!sounds[name]) sounds[name] = [];

		for (i = sounds[name].length; i--;) {
			audio = sounds[name][i];
			if (audio.ended) break;
			audio = null;
		}

		if (!audio) {
			audio = document.createElement('audio');
			audio.src = this.getFileName(name);
			sounds[name].push(audio);
		}

		audio.volume = 1;
		audio.play();
	}
});