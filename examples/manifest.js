;define({
  //#为不需要版本服务但是需要更新   !为需要版本服务同时需要更新但是无需缓存
  "version" : "12" ,
  "combo" : true,
  "http://localhost/test/examples/a/a.js":"!0.2" ,
  "http://localhost/test/examples/b/b.js":"0.2" ,
  "http://localhost/test/examples/c/c.js":"0.2" ,
  "http://localhost/test/examples/pigcan/pigcan2.js":"#2",
  "http://localhost/test/examples/index.js":"" ,
  "http://localhost/test/examples/libs/jquery/1.7.2/jquery-debug.js":"#123"
})