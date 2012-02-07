
var CSS = atom.Class({

	Implements: atom.Class.Options,

	options: {
		prefix   : '[libcanvas] ',
		whiteList: [ 'fill', 'stroke' ],
		alias    : { color : 'fill' }
	},

	initialize: function () {
		var
			i, k, rule, cssRules,
			styleSheets = document.styleSheets, rules = [];

		for (i = styleSheets.length; i--;) {
			cssRules = styleSheets[i].cssRules;
			for (k = cssRules.length; k--;) {
				rule = this.makeRule(cssRules[k]);
				if (rule != null) rules.push(rule);
			}
		}

		this.rules = rules;
	},

	makeRule: function (cssRule) {
		var selector = this.parseSelector(cssRule.selectorText);
		return selector == null ? null :
			new CSS.Rule( this, selector, cssRule.style );
	},

	parseSelector: function (selector) {
		var prefix = this.options.prefix;
		return selector.begins(prefix) ? selector.substr( prefix.length ) : null;
	}

});

CSS.Rule = atom.Class({

	initialize: function (css, selector, rules) {
		this.selector = selector;
		this.sourceRules = rules;

		this.rules = this.parseRules(css.options, rules);
	},

	parseRules: function (options, rules) {
		var result = {}, i = rules.length, rule;
		while (i--) {
			rule = options.alias[ rules[i] ] || rules[i];
			if (options.whiteList.contains(rule)) {
				result[rule] = rules[rules[i]];
			}
		}
		return result;
	}

});