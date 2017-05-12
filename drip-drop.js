exports.drop = require('./drop')
exports.drag = require('./drag')

exports.dontPreventDefault = function() {
    document.removeEventListener('dragenter', docEnterHandler, true)
    document.removeEventListener('dragover', docOverHandler, true)
}


// returns an opaque clone of the passed dom node ready to be moved with moveToMouse
exports.ghostItem = function(domNode, zIndex) {
    if(zIndex === undefined) zIndex = 1000

    var aClone = domNode.cloneNode(true)
    aClone.style.position = 'absolute'
    aClone.style.top = '-100px'
    aClone.style.width = domNode.clientWidth+'px'
    aClone.style.opacity = '.6'
    aClone.style.pointerEvents = 'none' // makes this 'invisible' to mouse events so it doesn't block mouse events while you're dragging it around
    aClone.style['z-index'] = zIndex

    return aClone
}
// moves an absolutely positioned element to the position by x and y
exports.moveAbsoluteNode = function(node, x, y) {
    node.style.left = x+'px'
    node.style.top = y+'px'
}

// get rid of the need to do this for other drag events
var docEnterHandler, docOverHandler;
document.addEventListener('dragenter',docEnterHandler=function(e){
    e.preventDefault()
}, true)
document.addEventListener('dragover',docOverHandler=function(e){
    e.preventDefault()
}, true)
//document.addEventListener('dragstart',docOverHandler=function(e){
//    e.preventDefault()
//})


