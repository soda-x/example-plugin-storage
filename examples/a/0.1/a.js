;define(function(require,exports,module){
	var b = require('../../b/b.js')
	//var css = require('../../test.css')
	var a = function(){
		return 1 + parseInt(b.b());
	}
	exports.a = a;
})