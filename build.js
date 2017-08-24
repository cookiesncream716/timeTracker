var build = require('build-modules')
// var emitter = build(__dirname+'/rootDirectory/moduleName', {output:{path: __dirname+'/generatedFile/'}})
var emiiter = build(__dirname + '/Users/heather/tixit/timeTracker/timeTracker.html', {output: {path: __dirname + '/timeTracker.js/'}})
emitter.on('done', function() {
   console.log("Done!")
})
emitter.on('error', function(e) {
   console.log(e)
})
emitter.on('warning', function(w) {
   console.log(w)
})