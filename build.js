var fs = require('fs')
var path = require("path")
var buildModule = require("build-modules")

var buildDirectory = path.join(__dirname,'dist')
if(!fs.existsSync(buildDirectory)) {
    fs.mkdirSync(buildDirectory)
}

var copywrite = '/* Copyright (c) 2013 Billy Tetrud - Free to use for any purpose: MIT License*/'

console.log('building and minifying...')
build('drip-drop', false, {output: {path:buildDirectory}, header: copywrite, name:"dripDrop", minify:true})
build('drip-drop', false, {output: {path:buildDirectory, name:'dripDrop-dev.umd.js'}, header: copywrite, name:"dripDrop", minify:false})


function build(relativeModulePath, watch, options) {
    var emitter = buildModule(path.join(__dirname, '..', relativeModulePath), {
        watch: watch/*, header: copyright*/, name: options.name, minify: options.minify,
        output: options.output
    })
    emitter.on('done', function() {
       console.log((new Date())+" - Done building "+relativeModulePath+"!")
    })
    emitter.on('error', function(e) {
       console.log(e)
    })
    emitter.on('warning', function(w) {
       console.log(w)
    })
}
