
// node - The node to set up as a drop zone
// options - An object with the optional members:
    // allow - A list of types to allow the event handlers be called for.
            // If this is passed and the current drag operation doesn't have an allowed type, the handlers will not be called.
            // If this isn't passed, all types are allowed.
    // enter(types, e) - A function called when a drag action enters the node
        // types - The data types available on drop
    // move(types, e) - A function called with the dragging pointer moves over the node
        // IMPORTANT: 'data' will contain the correct keys, but will *not* actually contain any data. Blame the stupid html5 drag and drop api.
    // leave(types, e) - A function called with the dragging pointer moves out of the node
    // drop(data, e) - A function called when the dragging pointer releases above the node
        // data - An object where each key is a data type, where if that type contains dashes, the type will be available as is *and* with dash-lowercase converted to camel case
            // The value is either:
             // For the 'Files' type, the value is a list of files, each with a set of properties described here: https://developer.mozilla.org/en-US/docs/Web/API/File .
              // In addition, the files have the methods:
                // getText(errback) - Returns the text of the file in a call to the the errback
                // getBuffer(errback) - Returns a Buffer of the file contents in a call to the the errback
             // For any other type, the value is a string of data in a format depending on the type
var drop = module.exports = function(node, options) {
    if(options.allow) {
        var allowed = options.allow
        var isAllowed = function(types) {
            for(var n=0; n<allowed.length; n++) {
                if(types.indexOf(allowed[n]) !== -1) {
                    return true
                }
            }
            return false
        }
    } else {
        var isAllowed = function() {
            return true
        }
    }

    var dropInfo = {node:node}, curTypes, dragCounter = 0
    node.addEventListener('dragenter', dropInfo.enter = function(e) {
        dragCounter++
        if(dragCounter === 1) { // browsers stupidly emits dragenter whenever crossing over a child boundary..
            var data = buildDataObject(e.dataTransfer)
            curTypes = Object.keys(data)
            if(options.enter !== undefined && isAllowed(curTypes)) {
                options.enter(curTypes,e)
            }
        }
    })
    if(options.move) {
        var recentMousePos, dropEffect = 'copy';
        node.addEventListener('dragover', dropInfo.over = function(e) {
            if(recentMousePos === undefined || e.pageX !== recentMousePos.x || e.pageY !== recentMousePos.y) {
                recentMousePos = {x:e.pageX,  y:e.pageY}
                if(isAllowed(curTypes))
                    dropEffect = options.move(curTypes, e)
            }

            if(dropEffect) e.dataTransfer.dropEffect=dropEffect
        })
    }

    node.addEventListener('dragleave', dropInfo.leave = function(e) {
        dragCounter--
        if(dragCounter === 0) { // browsers stupidly emits dragleave whenever crossing over a child boundary..
            if(options.leave && isAllowed(curTypes))
                options.leave(curTypes,e)
        }
    })
    if(options.drop) {
        node.addEventListener('drop', dropInfo.drop = function(e) {
            e.preventDefault()
            if(isAllowed(curTypes)) {
                var data = buildDataObject(e.dataTransfer)
                options.drop(data, e)
            }

            dragCounter=0 // reset
        })
    }

    return function(dropInfo) {
        if(dropInfo.enter) dropInfo.node.removeEventListener('dragstart', dropInfo.start)
        if(dropInfo.move) document.removeEventListener('dragover', dropInfo.docover)
        if(dropInfo.leave) dropInfo.node.removeEventListener('dragend', dropInfo.end)
        if(dropInfo.drop) dropInfo.node.removeEventListener('drop', dropInfo.drop)
    }
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