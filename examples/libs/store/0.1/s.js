var store = (function(){
 

  var _util = {}

  /**
  * val - string
  * 返回 boolean
  * 检查val是否为字符串
  */    

  _util.isString = function(val) {
    return toString.call(val) === '[object String]'
  }


  /**
  * arr - array ， fn - function
  * 无返回
  * 对array内所有数组成员统一执行fn方法
  */  
  _util.forEach = Array.prototype.forEach ?
      function(arr, fn) {
        arr.forEach(fn)
      } :
      function(arr, fn) {
        for (var i = 0; i < arr.length; i++) {
          fn(arr[i], i, arr)
        }
      }

  /**
  * arr - array ， fn - function
  * 返回array内所有数组成员统一执行fn方法后的结果集
  */ 
  _util.map = Array.prototype.map ?
    function(arr, fn) {
      return arr.map(fn)
    } :
    function(arr, fn) {
      var ret = []
      _util.forEach(arr, function(item, i, arr) {
        ret.push(fn(item, i, arr))
      })
      return ret
    }

  /**
  * 返回对象属性名
  */ 
  _util.keys = Object.keys

  if (!_util.keys) {
    util.keys = function(o) {
      var ret = []

      for (var p in o) {
        if (o.hasOwnProperty(p)) {
          ret.push(p)
        }
      }

      return ret
    }
  }

  return createStorage = function(name){
  
    var store = {},
        _isSupport,
        storeName = name,
        win = window
        
    _isSupport = function(){
      if(!(storeName == 'localStorage' || storeName == 'sessionStorage')) return false
      return !!(storeName in win && win[storeName])
    } 

  /**
  * isSupport - boolean
  * 返回 boolean
  * 检查客户端是否支持存储
  */
  store.isSupport = _isSupport()

    if(store.isSupport){

      var s = win[storeName]
    
      /**
      * key - string
      * 返回 任何数据类型
      * 获取key对应的key值
      */  
      store.get = function(key){

        if(s.getItem(key) == 'undefined'){
          return undefined
        }else{
          return JSON.parse(s.getItem(key))
        }

      }
    
      /**
      * key - string , val - 任何数据类型
      * 无返回
      * 设置key以及对应的key值
      */ 
      store.set = function(key, val){
        val = JSON.stringify(val)
        s.setItem(key, val)
      }

      /**
      * key - string
      * 无返回
      * 删除对应的键以及键值
      */ 
      store.remove = function(key){
        s.removeItem(key)
      }

      /**
      * prefix  - string 可选 
      * 无返回
      * 在无prefix存在的情况下，调用clear将清除所有localStorage存储
      * 在存在prefix的情况下，调用clear将清除所有含有该前缀的存储信息 
      */ 
      store.clear = function(prefix){
        var prefix = arguments[0]
        if(arguments.length){
          _util.map(_util.keys(s),function(k){
            k.indexOf(prefix) == 0 && store.remove(k)
          })
          return
        }
        s.clear()
      }

      /**
      * prefix - string 可选
      * 返回所有localStorage存储信息，或者含有prefix前缀的存储信息，如果没有任何存储信息，返回null
      * 如上所述
      */     
      store.getAll = function(prefix){

        var ret = {},
            prefix = arguments[0]
        if(arguments.length){
          _util.map(_util.keys(s),function(k){
            k.indexOf(prefix) == 0 && (ret[k] = store.get(k))
          })
        }else{
          _util.map(_util.keys(s),function(k){
            ret[k] = store.get(k)
          })
        }
        if(_util.keys(ret).length == 0){
          return null
        }else{
          return ret
        }     
      }
    }

    return  store

  }
})()