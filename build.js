var build = require('build-modules')
// var emitter = build(__dirname+'/rootDirectory/moduleName', {output:{path: __dirname+'/generatedFile/'}})
var emitter = build(__dirname + '/tTracker.js', {output: {path: __dirname}, minify:false, sourceMap: false})
emitter.on('done', function() {
   console.log("Done!")
})
emitter.on('error', function(e) {
	console.log('error')
   console.log(e)
})
emitter.on('warning', function(w) {
	console.log('warning')
   console.log(w)
})