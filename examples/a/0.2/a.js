;define(function(require,exports,module){
	var b = require('../../b/b.js')
	//var css = require('../../test.css')
	var a = function(){
		return 2 + parseInt(b.b());
	}
	exports.a = a;
})