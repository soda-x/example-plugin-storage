/**
 * The storage plugin
 */
define('seajs/plugin-storage', ['./plugin-base','store','manifest'], function(require, exports) {

  var plugin = require('./plugin-base'),
      manifest = require('manifest'),
      util = plugin.util,
      store = require('store'),
      s = store.createStorage('localStorage'),
      _manifest = s.get('manifest'),
      isNeedUpdate = false,
      updateList = {}

  //判断存储中是否含有旧的版本信息，如果没有则认为需要更新
  if(!_manifest){
    isNeedUpdate = true
  }
  //首次访问和新老版本号不一致的时候才需要更新
  isNeedUpdate || _manifest.version == manifest.version ? isNeedUpdate : isNeedUpdate = true
  
  //确认最终manifest

  if(isNeedUpdate){
    if(!_manifest){
      updateList = manifest
    }else{
      for(var i in manifest){
        if(i != 'version'){
          // 如果原始manifest不存在该i信息 则加入更新列表 ，通常是新增js
          !_manifest[i] && (updateList[i] = manifest[i]) 
          // 如果原始manifest存在该i信息，并且他们的版本号不相等的是否 ，则加入更新列表，通常是修改js版本号
          _manifest[i] && _manifest[i].version != manifest[i].version && (updateList[i] = manifest[i]) 
        }
      
      }
    }
    _manifest = manifest    
    s.set('manifest',manifest)
  } 

  plugin.add({
    name: 'storage',

    ext: ['.js'],

    fetch: function(url, callback) {

      var stCache = s.get(url),
          realPath= util.toRealPath(url,_manifest)

      // 只有当缓存中存在该url的存储信息并且在manifest存储清单中存在该条信息并且无需更新的情况下才从缓存中读取
      if(stCache  && _manifest[url] && !updateList[url]){  
        console.log('来源于缓存',url)
        util.globalEval(stCache)
        callback()
      }else{
        console.log('storage - realPath',realPath)
        util.xhr(realPath, function(code) {
          console.log('来源于异步请求',url)
          parseInt(seajs.pluginSDK.config.debug) == 2 || ( _manifest[url] && s.set(url,code) )        
          util.globalEval(code)
          callback()
        })
      }       
      
    }
  })

});

