/**
 * The combo plugin for http concat module
 */
;define('seajs/plugin-combo', [], function(require) {

  var pluginSDK = seajs.pluginSDK
  var gutil = pluginSDK.util
  var config = pluginSDK.config



  // Hacks load function to inject combo support
  // -----------------------------------------------

  var Module = pluginSDK.Module
  var cachedModules = seajs.cache

  /*
  //获取真实地址 - 为plugin-storage提供支持
  function getRealPath(url, manifest) {
    
    var entry = manifest[url]
    var version

    //如果manifest中不存在该条目，或者它并不存在版本信息，或者版本信息中首字母为‘#’
    //那么就认为它不需要版本服务，则直接返回url
    if (!entry || !(version = entry['version']) || version.indexOf('#') == 0) return url

    var m = url.match(/^(.*)\/([^\/]+)$/)
    if (!m) return url

    var dirname = m[1]
    var name = m[2]
    return dirname + '/' + version + '/' + name
  }
  */
  
  function hackLoad() {
    var MP = Module.prototype

    var _load = MP._load

    MP._load = function(uris, callback) {
      console.log('combo',uris)
      alert('load')
      setComboMap(uris)
      _load.call(this, uris, callback)
    }
  }

  function setComboMap(uris) {

    var comboExcludes = config.comboExcludes

    // Removes fetched or fetching uri
    var unFetchingUris = gutil.filter(uris, function(uri) {
      var module = cachedModules[uri]

      return (!module || module.status < Module.STATUS.FETCHING) &&
          (!comboExcludes || !comboExcludes.test(uri))
    })

    if (unFetchingUris.length > 1) {
      seajs.config({ map: paths2map(uris2paths(unFetchingUris)) })
    }
  }


  // No combo in debug mode
  if (seajs.debug) {
    seajs.log('Combo is turned off in debug mode')
  } else {
    hackLoad()
  }


  // Uses map to implement combo support
  // -----------------------------------------------

  function uris2paths(uris) {
    return meta2paths(uris2meta(uris))
  }

  // [
  //   'http://example.com/p/a.js',
  //   'https://example2.com/b.js',
  //   'http://example.com/p/c/d.js',
  //   'http://example.com/p/c/e.js'
  // ]
  // ==>
  // {
  //   'http__example.com': {
  //                          'p': {
  //                                 'a.js': { __KEYS: [] },
  //                                 'c': {
  //                                        'd.js': { __KEYS: [] },
  //                                        'e.js': { __KEYS: [] },
  //                                        __KEYS: ['d.js', 'e.js']
  //                                 },
  //                                 __KEYS: ['a.js', 'c']
  //                               },
  //                          __KEYS: ['p']
  //                        },
  //   'https__example2.com': {
  //                            'b.js': { __KEYS: [] },
  //                            _KEYS: ['b.js']
  //                          },
  //   __KEYS: ['http__example.com', 'https__example2.com']
  // }
  function uris2meta(uris) {
    var meta = { __KEYS: [] }

    gutil.forEach(uris, function(uri) {
      var parts = uri.replace('://', '__').split('/')
      var m = meta

      gutil.forEach(parts, function(part) {
        if (!m[part]) {
          m[part] = { __KEYS: [] }
          m.__KEYS.push(part)
        }
        m = m[part]
      })

    })
    //console.log('meta',meta)
    return meta
  }


  // {
  //   'http__example.com': {
  //                          'p': {
  //                                 'a.js': { __KEYS: [] },
  //                                 'c': {
  //                                        'd.js': { __KEYS: [] },
  //                                        'e.js': { __KEYS: [] },
  //                                        __KEYS: ['d.js', 'e.js']
  //                                 },
  //                                 __KEYS: ['a.js', 'c']
  //                               },
  //                          __KEYS: ['p']
  //                        },
  //   'https__example2.com': {
  //                            'b.js': { __KEYS: [] },
  //                            _KEYS: ['b.js']
  //                          },
  //   __KEYS: ['http__example.com', 'https__example2.com']
  // }
  // ==>
  // [
  //   ['http://example.com/p', ['a.js', 'c/d.js', 'c/e.js']]
  // ]
  function meta2paths(meta) {
    var paths = []

    gutil.forEach(meta.__KEYS, function(part) {
      var root = part
      var m = meta[part]
      var KEYS = m.__KEYS

      while(KEYS.length === 1) {
        root += '/' + KEYS[0]
        m = m[KEYS[0]]
        KEYS = m.__KEYS
      }

      if (KEYS.length) {
        paths.push([root.replace('__', '://'), meta2arr(m)])
      }
    })
    //console.log('paths',paths)
    return paths
  }


  // {
  //   'a.js': { __KEYS: [] },
  //   'c': {
  //          'd.js': { __KEYS: [] },
  //          'e.js': { __KEYS: [] },
  //          __KEYS: ['d.js', 'e.js']
  //        },
  //   __KEYS: ['a.js', 'c']
  // }
  // ==>
  // [
  //   'a.js', 'c/d.js', 'c/e.js'
  // ]
  function meta2arr(meta) {
    var arr = []

    gutil.forEach(meta.__KEYS, function(key) {
      var r = meta2arr(meta[key])

      // key = 'c'
      // r = ['d.js', 'e.js']
      if (r.length) {
        gutil.forEach(r, function(part) {
          arr.push(key + '/' + part)
        })
      }
      else {
        arr.push(key)
      }
    })
    //console.log('arr',arr)
    return arr
  }


  // [
  //   [ 'http://example.com/p', ['a.js', 'c/d.js', 'c/e.js', 'a.css', 'b.css'] ]
  // ]
  // ==>
  //
  // a map function to map
  //
  // 'http://example.com/p/a.js'  ==> 'http://example.com/p/??a.js,c/d.js,c/e.js'
  // 'http://example.com/p/c/d.js'  ==> 'http://example.com/p/??a.js,c/d.js,c/e.js'
  // 'http://example.com/p/c/e.js'  ==> 'http://example.com/p/??a.js,c/d.js,c/e.js'
  // 'http://example.com/p/a.css'  ==> 'http://example.com/p/??a.css,b.css'
  // 'http://example.com/p/b.css'  ==> 'http://example.com/p/??a.css,b.css'
  //
  function paths2map(paths) {
    var comboSyntax = config.comboSyntax || ['??', ',']
    var map = []

    gutil.forEach(paths, function(path) {
      var root = path[0] + '/'
      var group = files2group(path[1])

      gutil.forEach(group, function(files) {

        var hash = {}
        var comboPath = root + comboSyntax[0] + files.join(comboSyntax[1])

        // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url
        if (comboPath.length > 2000) {
          throw new Error('The combo url is too long: ' + comboPath)
        }

        gutil.forEach(files, function(part) {
          hash[root + part] = comboPath
        })

        map.push(function(url) {
          return hash[url] || url
        })

      })

    })
    //console.log('map',map)
    return map
  }


  //
  //  ['a.js', 'c/d.js', 'c/e.js', 'a.css', 'b.css', 'z']
  // ==>
  //  [ ['a.js', 'c/d.js', 'c/e.js'], ['a.css', 'b.css'] ]
  //
  function files2group(files) {
    var group = []
    var hash = {}

    gutil.forEach(files, function(file) {
      var ext = getExt(file)
      if (ext) {
        (hash[ext] || (hash[ext] = [])).push(file)
      }
    })

    for (var ext in hash) {
      if (hash.hasOwnProperty(ext)) {
        group.push(hash[ext])
      }
    }
    //console.log('group',group)
    return group
  }


  function getExt(file) {
    var p = file.lastIndexOf('.')
    return p >= 0 ? file.substring(p) : ''
  }


  // For test
  gutil.toComboPaths = uris2paths
  gutil.toComboMap = paths2map

})

// Runs it immediately
seajs.use('seajs/plugin-combo');

