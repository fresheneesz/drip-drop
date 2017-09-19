var EmitterB = require("emitter-b")
var proto = require("proto")

// node - The node to set up as a drop zone
// options - An object with the optional members:
    // allow - A list of types to allow the event handlers be called for.
            // If this is passed and the current drag operation doesn't have an allowed type, the handlers will not be called.
            // If this isn't passed, all types are allowed.
// Events:
    // enter(types, e) - Emitted when a drag action enters the node
        // types - The data types available on drop
    // move(types, e) - Emitted when the dragging pointer moves over the node
        // IMPORTANT: 'data' will contain the correct keys, but will *not* actually contain any data. Blame the stupid html5 drag and drop api.
    // leave(types, e) - Emitted when the dragging pointer moves out of the node
    // in(types, e) - Emitted when the dragging pointer crosses in over a child-boundary of a descendant node that is also a drop zone
    // out(types, e) - Emitted when the dragging pointer crosses out over a child-boundary of a descendant node that is also a drop zone
    // drop(data, e) - Emitted when the dragging pointer releases above the node
        // data - An object where each key is a data type, where if that type contains dashes, the type will be available as is *and* with dash-lowercase converted to camel case
            // The value is either:
             // For the 'Files' type, the value is a list of files, each with a set of properties described here: https://developer.mozilla.org/en-US/docs/Web/API/File .
              // In addition, the files have the methods:
                // getText(errback) - Returns the text of the file in a call to the the errback
                // getBuffer(errback) - Returns a Buffer of the file contents in a call to the the errback
             // For any other type, the value is a string of data in a format depending on the type
var drop = module.exports = proto(EmitterB, function(superclass) {

    this.init = function (node, options) {
        var that = this
        superclass.init.call(this)
        if(!options) options = {}

        if (options.allow) {
            var allowed = options.allow
            var isAllowed = function (types) {
                for (var n = 0; n < allowed.length; n++) {
                    if (types.indexOf(allowed[n]) !== -1) {
                        return true
                    }
                }
                return false
            }
        } else {
            var isAllowed = function () {
                return true
            }
        }

        var dropInfo = {node: node}, curTypes, dragCounter = 0

        this.ifon('move',function() {
            var recentMousePos, stopPropCalled;
            node.addEventListener('dragover', dropInfo.over = function (e) {
                var originalStopProp = e.stopPropagation
                e.stopPropagation = function () {
                    stopPropCalled = true
                }

                if (recentMousePos === undefined || e.pageX !== recentMousePos.x || e.pageY !== recentMousePos.y) {
                    recentMousePos = {x: e.pageX, y: e.pageY}
                    if (isAllowed(curTypes)) {
                        stopPropCalled = false
                        that.emit('move', curTypes, e)
                    }
                }

                if (stopPropCalled) {
                    originalStopProp.call(e)
                }
            })
        })


        this.ifon('drop',function() {
            node.addEventListener('drop', dropInfo.drop = function (e) {
                e.preventDefault()
                if (isAllowed(curTypes)) {
                    var data = buildDataObject(e.dataTransfer)
                    that.emit('drop', data, e)
                }
            })
        })

        var activeEvents = {}
        this.ifon(function(event) {
            activeEvents[event] = true
            if(anyEventActive(activeEvents)) {
                node.addEventListener('dragenter', dropInfo.enter = function (e) {
                    dragCounter++
                    if (dragCounter === 1) { // browsers stupidly emits dragenter whenever crossing over a child boundary..
                        var data = buildDataObject(e.dataTransfer)
                        curTypes = Object.keys(data)
                        if (isAllowed(curTypes)) {
                            that.emit('enter', curTypes, e)
                        }
                    } else {
                        that.emit('in',curTypes, e)
                    }
                })

                node.addEventListener('dragleave', dropInfo.leave = function (e) {
                    dragCounter--
                    if (dragCounter === 0) { // browsers stupidly emits dragleave whenever crossing over a child boundary..
                        if(isAllowed(curTypes))
                            that.emit('leave', curTypes, e)
                    } else {
                        that.emit('out', curTypes, e)
                    }
                })

                node.addEventListener('drop', dropInfo.enterLeaveDropHandler = function (e) {
                    dragCounter = 0 // reset
                }, true) // capture event to ensure this happens regardless of stop propogation calls
            }
        })
        this.ifoff(function(event) {
            activeEvents[event] = false
            if(!anyEventActive(activeEvents)) {
                dropInfo.node.removeEventListener('dragenter', dropInfo.start)
                dropInfo.node.removeEventListener('dragleave', dropInfo.end)
                dropInfo.node.removeEventListener('drop', dropInfo.enterLeaveDropHandler)
            }
        })

        this.ifoff('move', function() {
            dropInfo.node.removeEventListener('dragover', dropInfo.over)
        })
        this.ifoff('drop', function() {
            dropInfo.node.removeEventListener('drop', dropInfo.drop)
        })

        // deprecated
        if(options.enter) this.on('enter', options.enter)
        if(options.move) this.on('move', options.move)
        if(options.leave) this.on('leave', options.leave)
        if(options.in) this.on('in', options.in)
        if(options.out) this.on('out', options.out)
        if(options.drop) this.on('drop', options.drop)
    }
})

function anyEventActive(activeEvents) {
    for(var k in activeEvents) {
        if(activeEvents[k]) return true
    }
    // else
    return false
}

function readTextFile(file, type, cb){
    var reader=new FileReader()
    reader.onloadend=function(e) {
        if(e.target.readyState==FileReader.DONE){
            cb(undefined, reader.result)
        }
    }
    reader.onerror = function(e) {
        cb(e)
    }
    reader[type](file)
}

function buildDataObject(dt) {
    var data = {}
    if(dt.files.length > 0) {
        data.Files = dt.files
    }
    for(var j=0; j<dt.types.length; j++) {
        var type = dt.types[j]
        if(type === 'Files') {
            data.Files = dt.files
            for(var n=0;n<data.Files.length;n++) {
                var file = data.Files[n]
                file.getText = function(cb) {
                    readTextFile(file, 'readAsText', cb)
                }
                file.getBuffer = function(cb) {
                    readTextFile(file, 'readAsArrayBuffer', cb)
                }
            }
        } else {
            attachGetter(data, dt, type)
            var mappedType = mapToCamelCase(type)
            if(mappedType !== type) {
                attachGetter(data, dt, mappedType)
            }
        }
    }

    return data
}

function attachGetter(data, dt, type) {
    Object.defineProperty(data, type, {
        enumerable: true,
        get: function() {
            return dt.getData(type)
        }
    })
}

function mapToCamelCase(string) {
    return string.replace(/(-[a-z])/g, function(match, submatch) {
        return submatch[1].toUpperCase()
    })
}

// returns true if the point intersects the element's bounds, false otherwise
function pointerIsOver(x,y, element) {
    var bounds = element.getBoundingClientRect()
    return bounds.top <= y&&y <= bounds.bottom
        && bounds.left <= x&&x <= bounds.right
}