;define(function(require,exports,module){
	var c = require('../../c/c.js');
	var b = function(){
		return 3 + parseInt(c.c());
	}
	exports.b = b;
})