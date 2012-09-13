seajs.config({
  alias: {
    'store' : 'store/0.1/store.js',
    'manifest' : 'http://localhost/test/examples/manifest.js'
  }
});
seajs.config({
          alias: {
            'jquery': 'jquery/1.7.2/jquery-debug.js',
            'manifest2' : 'http://localhost/test/examples/manifest.json'
          },
          preload: [
            //'manifest',
            //'seajs/plugin-version',      
            'seajs/plugin-storage',
            'seajs/plugin-json'    
          ],

		});