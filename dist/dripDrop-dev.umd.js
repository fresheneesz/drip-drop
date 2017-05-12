(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["dripDrop"] = factory();
	else
		root["dripDrop"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!********************************!*\
  !*** ./drip-drop/drip-drop.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	exports.drop = __webpack_require__(/*! ./drop */ 1)
	exports.drag = __webpack_require__(/*! ./drag */ 2)
	
	exports.dontPreventDefault = function() {
	    document.removeEventListener('dragenter', docEnterHandler)
	    document.removeEventListener('dragover', docOverHandler)
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
	})
	document.addEventListener('dragover',docOverHandler=function(e){
	    e.preventDefault()
	})
	//document.addEventListener('dragstart',docOverHandler=function(e){
	//    e.preventDefault()
	//})
	
	


/***/ },
/* 1 */
/*!***************************!*\
  !*** ./drip-drop/drop.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	
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
	    // in(types, e) - A function called when the dragging pointer crosses in over a child-boundary of a descendant node that is also a drop zone 
	    // out(types, e) - A function called when the dragging pointer crosses out over a child-boundary of a descendant node that is also a drop zone
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
	        } else if(dragCounter === 2 && options.in) {
	            options.in(curTypes, e)
	        }
	    })
	    if(options.move) {
	        var recentMousePos, dropEffect = 'copy', stopPropCalled;
	        node.addEventListener('dragover', dropInfo.over = function(e) {
	            var originalStopProp = e.stopPropagation
	            e.stopPropagation = function() {
	                stopPropCalled = true
	            }
	            
	            if(recentMousePos === undefined || e.pageX !== recentMousePos.x || e.pageY !== recentMousePos.y) {
	                recentMousePos = {x:e.pageX,  y:e.pageY}
	                if(isAllowed(curTypes)) {
	                    stopPropCalled = false
	                    dropEffect = options.move(curTypes, e)
	                }
	            }
	
	            if(dropEffect) e.dataTransfer.dropEffect=dropEffect
	            if(stopPropCalled) originalStopProp.call(e)
	        })
	    }
	
	    node.addEventListener('dragleave', dropInfo.leave = function(e) {
	        dragCounter--
	        if(dragCounter === 0) { // browsers stupidly emits dragleave whenever crossing over a child boundary..
	            if(options.leave && isAllowed(curTypes))
	                options.leave(curTypes,e)
	        }  else if(dragCounter === 1 && options.out) {
	            options.out(curTypes, e)
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

/***/ },
/* 2 */
/*!***************************!*\
  !*** ./drip-drop/drag.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	
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
	                })
	
	                node.addEventListener('dragend', function dragendHandler() {
	                    document.removeEventListener('dragover', dragInfo.docOver)
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
	        if(dragInfo.docOver) document.removeEventListener('dragover', dragInfo.docOver)
	    }
	}
	
	function mapFromCamelCase(string) {
	    return string.replace(/([A-Z])/g, function(match, submatch) {          // this is from jss
	        return '-' + submatch.toLowerCase()
	    })
	}

/***/ }
/******/ ])
});

//# sourceMappingURL=dripDrop-dev.umd.js.map