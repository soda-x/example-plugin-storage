define('seajs/plugin-version', ['./plugin-base'], function(require,exports) {

  var plugin = require('./plugin-base')
  
  var util = plugin.util

  var Module = seajs.pluginSDK.Module

  var resourceList = Module._find('version')

  extendResolve()

  plugin.add({
    name: 'version',

    ext: ['.js'],

    fetch: function(url, callback) {
      if (!resourceList[url] || !resourceList[url]['nocache']) return 
      var realPath = getUrl(url)
      console.log('version实际下载地址',realPath)
      util.xhr(realPath, function(code) {
        util.globalEval(code)
        callback()
      })
    }
  })
  
  function getUrl(refUri){
      
    if(resourceList.length){
      refUri = toRealPath(refUri, resourceList[0])
    }

    return resourceList && (refUri = toRealPath(refUri, resourceList))
  }
  // fix refUri
  function extendResolve() {
    var _resolve = Module._resolve

    Module._resolve = function(id, refUri) {
      console.log('version 经过配置列表解析前 id为',id,'refUri为',refUri)
      refUri = getUrl(refUri)
      console.log('version 经过配置列表解析后 id为',id,'refUri为',refUri)
      return _resolve(id, refUri)
    }
  }

  function toRealPath(url, list) {

    if (!list[url]) return url

    var m = url.match(/^(.*)\/(.*)$/)
    var dirname = m[1]
    var name = m[2]

    var version = list[url]['version']
    if (!version) return url
    var real = dirname + '/' + version + '/' + name

    return real
  }

  exports.toRealPath = toRealPath

});