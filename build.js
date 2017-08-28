var build = require('build-modules')
// var emitter = build(__dirname+'/rootDirectory/moduleName', {output:{path: __dirname+'/generatedFile/'}})
var emiiter = build(__dirname + '/Users/heather/tixit/timeTracker/tTracker.js', {output: {path: __dirname + '/timeTracker.js/'}})
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