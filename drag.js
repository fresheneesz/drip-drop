
// node - The dom node to set as a drag handle
// options
    // image - Can take on one of the following possible values:
        // false - (Default) No image
        // true - The default generated drag image
        // string - The path to an image
        // imageObject - If this is an Image object, that will be used
    // start(setData, e) - Called when dragging starts. Use setData to set the data for each type.
        // setData(type, data) - Sets data for a particular type.
            // NOTE: In an attempt mitigate type lowercasing weirdness, capitals will be converted to dash-lowercase *and* lowercase without dashes
            // IE NOTE: IE is a piece of shit and doesn't allow any 'type' other than "text" and "url" - https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/329509/
    // move(pointerPosition, e)
    // end(e)
var drag = module.exports = function(node, options) {
    if(!options) options = {}
    node.setAttribute("draggable", "true")

    var dragInfo = {node:node}
    if(options.start) {
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
            var effectAllowed = options.start(function(type, string) {
                dataTransfer.setData(type, string)
                var mappedType = mapFromCamelCase(type)
                if(mappedType !== type) {
                    dataTransfer.setData(mappedType, string)
                }
            }, e)

            if(effectAllowed) e.dataTransfer.effectAllowed = effectAllowed

            if(options.move) {
                var recentMousePos
                document.addEventListener('dragover', dragInfo.docOver = function(e) {
                    if(recentMousePos === undefined || e.pageX !== recentMousePos.x || e.pageY !== recentMousePos.y) {
                        recentMousePos = {x:e.pageX,  y:e.pageY}
                        options.move(e)
                    }
                }, true)

                node.addEventListener('dragend', function dragendHandler() {
                    document.removeEventListener('dragover', dragInfo.docOver, true)
                    dragInfo.node.removeEventListener('dragend', dragendHandler)
                })
            }
        })
    }

    if(options.end) {
        node.addEventListener('dragend', dragInfo.end = options.end)
    }

    return function off() {
        if(dragInfo.start) dragInfo.node.removeEventListener('dragstart', dragInfo.start)
        if(dragInfo.end) dragInfo.node.removeEventListener('dragend', dragInfo.end)
        if(dragInfo.docOver) document.removeEventListener('dragover', dragInfo.docOver, true)
    }
}

function mapFromCamelCase(string) {
    return string.replace(/([A-Z])/g, function(match, submatch) {          // this is from jss
        return '-' + submatch.toLowerCase()
    })
}