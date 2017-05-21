var EmitterB = require("emitter-b")
var proto = require("proto")

// node - The dom node to set as a drag handle
// options
    // image - Can take on one of the following possible values:
        // false - (Default) No image
        // true - The default generated drag image
        // string - The path to an image
        // imageObject - If this is an Image object, that will be used
// Events:
    // start(setData, e) - Emitted when dragging starts. Use setData to set the data for each type.
        // setData(type, data) - Sets data for a particular type.
            // NOTE: In an attempt mitigate type lowercasing weirdness, capitals will be converted to dash-lowercase *and* lowercase without dashes
            // IE NOTE: IE is a piece of shit and doesn't allow any 'type' other than "text" and "url" - https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/329509/
    // move(pointerPosition, e)
    // end(e)
var drag = module.exports = proto(EmitterB, function(superclass) {
    this.init = function(node, options) {
        var that = this
        superclass.init.call(this)

        if(!options) options = {}
        node.setAttribute("draggable", "true")

        var dragInfo = {node:node}, moveHandlerExists = false

        this.ifon('start', function() {
            node.addEventListener('dragstart', dragInfo.start = function(e) {
                if(options.image !== undefined) {
                    if(options.image !== true) { // if its true, leave the default drag image
                        if(typeof(options.image) === 'string') {
                            var image = new Image(options.image)
                        } else {
                            var image = options.image
                        }

                        e.dataTransfer.setDragImage(image, image.width,image.height)
                    }
                } else {
                    e.dataTransfer.setDragImage(new Image, 0,0) // no image
                }

                var dataTransfer = e.dataTransfer
                that.emit('start', function(type, string) {
                    dataTransfer.setData(type, string)
                    var mappedType = mapFromCamelCase(type)
                    if(mappedType !== type) {
                        dataTransfer.setData(mappedType, string)
                    }
                }, e)

                if(moveHandlerExists) {
                    var recentMousePos
                    document.addEventListener('dragover', dragInfo.docOver = function(e) {
                        if(recentMousePos === undefined || e.pageX !== recentMousePos.x || e.pageY !== recentMousePos.y) {
                            recentMousePos = {x:e.pageX,  y:e.pageY}
                            that.emit('move', e)
                        }
                    }, true)

                    node.addEventListener('dragend', function dragendHandler() {
                        document.removeEventListener('dragover', dragInfo.docOver, true)
                        dragInfo.node.removeEventListener('dragend', dragendHandler)
                    })
                }
            })
        })

        this.ifon('move', function() {
            moveHandlerExists = true
        })

        this.ifon('end', function() {
            node.addEventListener('dragend', dragInfo.end = function(e) {
                that.emit('end', e)
            })
        })

        this.ifoff('start', function() {
            dragInfo.node.removeEventListener('dragstart', dragInfo.start)
        })
        this.ifoff('end', function() {
            dragInfo.node.removeEventListener('dragend', dragInfo.end)
        })
        this.ifoff('move', function() {
            moveHandlerExists = false
            if(dragInfo.docOver) document.removeEventListener('dragover', dragInfo.docOver, true)
        })

        // deprecated
        if(options.start) this.on('start', options.start)
        if(options.move) this.on('move', options.move)
        if(options.end) this.on('end', options.end)
    }
})

function mapFromCamelCase(string) {
    return string.replace(/([A-Z])/g, function(match, submatch) {          // this is from jss
        return '-' + submatch.toLowerCase()
    })
}