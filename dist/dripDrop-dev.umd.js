(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
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
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/* unknown exports provided */
/* all exports used */
/*!************************************!*\
  !*** ./drip-drop/~/proto/proto.js ***!
  \************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* Copyright (c) 2013 Billy Tetrud - Free to use for any purpose: MIT License*/

var noop = function() {}

var prototypeName='prototype', undefined, protoUndefined='undefined', init='init', ownProperty=({}).hasOwnProperty; // minifiable variables
function proto() {
    var args = arguments // minifiable variables

    if(args.length == 1) {
        var parent = {init: noop}
        var prototypeBuilder = args[0]

    } else { // length == 2
        var parent = args[0]
        var prototypeBuilder = args[1]
    }

    // special handling for Error objects
    var namePointer = {}    // name used only for Error Objects
    if([Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError].indexOf(parent) !== -1) {
        parent = normalizeErrorObject(parent, namePointer)
    }

    // set up the parent into the prototype chain if a parent is passed
    var parentIsFunction = typeof(parent) === "function"
    if(parentIsFunction) {
        prototypeBuilder[prototypeName] = parent[prototypeName]
    } else {
        prototypeBuilder[prototypeName] = parent
    }

    // the prototype that will be used to make instances
    var prototype = new prototypeBuilder(parent)
    namePointer.name = prototype.name

    // if there's no init, assume its inheriting a non-proto class, so default to applying the superclass's constructor.
    if(!prototype[init] && parentIsFunction) {
        prototype[init] = function() {
            parent.apply(this, arguments)
        }
    }

    // constructor for empty object which will be populated via the constructor
    var F = function() {}
        F[prototypeName] = prototype    // set the prototype for created instances

    var constructorName = prototype.name?prototype.name:''
    if(prototype[init] === undefined || prototype[init] === noop) {
        var ProtoObjectFactory = new Function('F',
            "return function " + constructorName + "(){" +
                "return new F()" +
            "}"
        )(F)
    } else {
        // dynamically creating this function cause there's no other way to dynamically name a function
        var ProtoObjectFactory = new Function('F','i','u','n', // shitty variables cause minifiers aren't gonna minify my function string here
            "return function " + constructorName + "(){ " +
                "var x=new F(),r=i.apply(x,arguments)\n" +    // populate object via the constructor
                "if(r===n)\n" +
                    "return x\n" +
                "else if(r===u)\n" +
                    "return n\n" +
                "else\n" +
                    "return r\n" +
            "}"
        )(F, prototype[init], proto[protoUndefined]) // note that n is undefined
    }

    prototype.constructor = ProtoObjectFactory;    // set the constructor property on the prototype

    // add all the prototype properties onto the static class as well (so you can access that class when you want to reference superclass properties)
    for(var n in prototype) {
        addProperty(ProtoObjectFactory, prototype, n)
    }

    // add properties from parent that don't exist in the static class object yet
    for(var n in parent) {
        if(ownProperty.call(parent, n) && ProtoObjectFactory[n] === undefined) {
            addProperty(ProtoObjectFactory, parent, n)
        }
    }

    ProtoObjectFactory.parent = parent;            // special parent property only available on the returned proto class
    ProtoObjectFactory[prototypeName] = prototype  // set the prototype on the object factory

    return ProtoObjectFactory;
}

proto[protoUndefined] = {} // a special marker for when you want to return undefined from a constructor

module.exports = proto

function normalizeErrorObject(ErrorObject, namePointer) {
    function NormalizedError() {
        var tmp = new ErrorObject(arguments[0])
        tmp.name = namePointer.name

        this.message = tmp.message
        if(Object.defineProperty) {
            /*this.stack = */Object.defineProperty(this, 'stack', { // getter for more optimizy goodness
                get: function() {
                    return tmp.stack
                },
                configurable: true // so you can change it if you want
            })
        } else {
            this.stack = tmp.stack
        }

        return this
    }

    var IntermediateInheritor = function() {}
        IntermediateInheritor.prototype = ErrorObject.prototype
    NormalizedError.prototype = new IntermediateInheritor()

    return NormalizedError
}

function addProperty(factoryObject, prototype, property) {
    try {
        var info = Object.getOwnPropertyDescriptor(prototype, property)
        if(info.get !== undefined || info.get !== undefined && Object.defineProperty !== undefined) {
            Object.defineProperty(factoryObject, property, info)
        } else {
            factoryObject[property] = prototype[property]
        }
    } catch(e) {
        // do nothing, if a property (like `name`) can't be set, just ignore it
    }
}

/***/ }),
/* 1 */
/* unknown exports provided */
/* all exports used */
/*!***********************************************!*\
  !*** ./drip-drop/~/emitter-b/src/EmitterB.js ***!
  \***********************************************/
/***/ (function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(/*! events */ 5).EventEmitter
var proto = __webpack_require__(/*! proto */ 0)

module.exports = proto(EventEmitter, function(superclass) {

    this.init = function() {
        superclass.apply(this, arguments)

        this.ifonHandlers = {}
        this.ifoffHandlers = {}
        this.ifonAllHandlers = []
        this.ifoffAllHandlers = []
    }

    // callback will be triggered immediately if there is already a listener attached, or
    // callback will be triggered when the first listener for the event is added
    // (regardless of whether its done through on or once)
    // parameters can be:
        // event, callback - attach an ifon handler for the passed event
        // callback - attach an ifon handler for all events
    this.ifon = function(event, callback) {
        if(event instanceof Function) {     // event not passed, only a callback
            callback = event // fix the argument
            for(var eventName in this._events) {
                if(this.listeners(eventName).length > 0) {
                    callback(eventName)
                }
            }
        } else if(this.listeners(event).length > 0) {
            callback(event)
        }

        addHandlerToList(this, 'ifonHandlers', event, callback)
    }

    // removes either:
        // removeIfon() - all ifon handlers (if no arguments are passed), or
        // removeIfon(event) - all ifon handlers for the passed event, or
        // removeIfon(callback) - the passed ifon-all handler (if the first parameter is the callback)
        // removeIfon(event, callback) - the specific passed callback for the passed event
    this.removeIfon = function(event, callback) {
        removeFromHandlerList(this, 'ifonHandlers', event, callback)
    }

    // callback will be triggered when the last listener for the 'click' event is removed (will not trigger immediately if there is no event listeners on call of ifoff)
    // (regardless of whether this is done through removeListener or as a result of 'once' being fulfilled)
    // parameters can be:
        // event, callback - attach an ifoff handler for the passed event
        // callback - attach an ifoff handler for all events
    this.ifoff = function(event, callback) {
        addHandlerToList(this, 'ifoffHandlers', event, callback)
    }

    // removes either:
        // removeIfoff() - all ifoff handlers (if no arguments are passed), or
        // removeIfoff(event) - all ifoff handlers for the passed event, or
        // removeIfoff(callback) - the passed ifoff-all handler (if the first parameter is the callback)
        // removeIfoff(event, callback) - the specific passed callback for the passed event
    this.removeIfoff = function(event, callback) {
        removeFromHandlerList(this, 'ifoffHandlers', event, callback)
    }

    // emitter is the emitter to proxy handler binding to
    // options can have one of the following properties:
        // only - an array of events to proxy
        // except - an array of events to *not* proxy
    this.proxy = function(emitter, options) {
        if(options === undefined) options = {}
        if(options.except !== undefined) {
            var except = arrayToMap(options.except)
            var handleIt = function(event){return !(event in except)}
        } else if(options.only !== undefined) {
            var only = arrayToMap(options.only)
            var handleIt = function(event){return event in only}
        } else {
            var handleIt = function(){return true}
        }

        var that = this, handler;
        this.ifon(function(event) {
            if(handleIt(event)) {
                emitter.on(event, handler = function() {
                    that.emit.apply(that, [event].concat(Array.prototype.slice.call(arguments)))
                })
            }
        })
        this.ifoff(function(event) {
            if(handleIt(event))
                emitter.off(event, handler)
        })
    }

    /*override*/ this.on = this.addListener = function(event, callback) {
        var triggerIfOn = this.listeners(event).length === 0
        superclass.prototype.on.apply(this,arguments)
        if(triggerIfOn) triggerIfHandlers(this, 'ifonHandlers', event)
    }

    /*override*/ this.off = this.removeListener = function(event, callback) {
        var triggerIfOff = this.listeners(event).length === 1
        superclass.prototype.removeListener.apply(this,arguments)
        if(triggerIfOff) triggerIfHandlers(this, 'ifoffHandlers', event)
    }
    /*override*/ this.removeAllListeners = function(event) {
        var triggerIfOffForEvents = []
        if(event !== undefined) {
            if(this.listeners(event).length > 0) {
                triggerIfOffForEvents.push(event)
            }
        } else {
            for(var event in this._events) {
                if(this.listeners(event).length > 0) {
                    triggerIfOffForEvents.push(event)
                }
            }
        }

        superclass.prototype.removeAllListeners.apply(this,arguments)

        for(var n=0; n<triggerIfOffForEvents.length; n++) {
            triggerIfHandlers(this, 'ifoffHandlers', triggerIfOffForEvents[n])
        }
    }

})


// triggers the if handlers from the normal list and the "all" list
function triggerIfHandlers(that, handlerListName, event) {
    triggerIfHandlerList(that[handlerListName][event], event)
    triggerIfHandlerList(that[normalHandlerToAllHandlerProperty(handlerListName)], event)
}


// triggers the if handlers from a specific list
// ya these names are confusing, sorry : (
function triggerIfHandlerList(handlerList, event) {
    if(handlerList !== undefined) {
        for(var n=0; n<handlerList.length; n++) {
            handlerList[n](event)
        }
    }
}

function addHandlerToList(that, handlerListName, event, callback) {
    if(event instanceof Function) {
        // correct arguments
        callback = event
        event = undefined
    }

    if(event !== undefined && callback !== undefined) {
        var handlerList = that[handlerListName][event]
        if(handlerList === undefined) {
            handlerList = that[handlerListName][event] = []
        }

        handlerList.push(callback)
    } else {
        that[normalHandlerToAllHandlerProperty(handlerListName)].push(callback)
    }
}

function removeFromHandlerList(that, handlerListName, event, callback) {
    if(event instanceof Function) {
        // correct arguments
        callback = event
        event = undefined
    }

    if(event !== undefined && callback !== undefined) {
        removeCallbackFromList(that[handlerListName][event], callback)
    } else if(event !== undefined) {
        delete that[handlerListName][event]
    } else if(callback !== undefined) {
        var allHandlerListName = normalHandlerToAllHandlerProperty(handlerListName)
        removeCallbackFromList(that[allHandlerListName], callback)
    } else {
        var allHandlerListName = normalHandlerToAllHandlerProperty(handlerListName)
        that[handlerListName] = {}
        that[allHandlerListName] = []
    }
}

function normalHandlerToAllHandlerProperty(handlerListName) {
    if(handlerListName === 'ifonHandlers')
        return 'ifonAllHandlers'
    if(handlerListName === 'ifoffHandlers')
        return 'ifoffAllHandlers'
}

function removeCallbackFromList(list, callback) {
    var index = list.indexOf(callback)
    list.splice(index,1)
}

function getTrace() {
    try {
        throw new Error()
    } catch(e) {
        return e
    }
}

// turns an array of values into a an object where those values are all keys that point to 'true'
function arrayToMap(array) {
    var result = {}
    array.forEach(function(v) {
        result[v] = true
    })
    return result
}


/***/ }),
/* 2 */
/* unknown exports provided */
/* all exports used */
/*!***************************!*\
  !*** ./drip-drop/drag.js ***!
  \***************************/
/***/ (function(module, exports, __webpack_require__) {

var EmitterB = __webpack_require__(/*! emitter-b */ 1)
var proto = __webpack_require__(/*! proto */ 0)

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
        this.ifoff('move', function() {
            moveHandlerExists = false
            if(dragInfo.docOver) document.removeEventListener('dragover', dragInfo.docOver, true)
        })
        this.ifoff('end', function() {
            dragInfo.node.removeEventListener('dragend', dragInfo.end)
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

/***/ }),
/* 3 */
/* unknown exports provided */
/* all exports used */
/*!***************************!*\
  !*** ./drip-drop/drop.js ***!
  \***************************/
/***/ (function(module, exports, __webpack_require__) {

var EmitterB = __webpack_require__(/*! emitter-b */ 1)
var proto = __webpack_require__(/*! proto */ 0)

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

/***/ }),
/* 4 */
/* unknown exports provided */
/* all exports used */
/*!********************************!*\
  !*** ./drip-drop/drip-drop.js ***!
  \********************************/
/***/ (function(module, exports, __webpack_require__) {

exports.drop = __webpack_require__(/*! ./drop */ 3)
exports.drag = __webpack_require__(/*! ./drag */ 2)

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




/***/ }),
/* 5 */
/* unknown exports provided */
/* all exports used */
/*!**************************************!*\
  !*** ./drip-drop/~/events/events.js ***!
  \**************************************/
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ })
/******/ ]);
});
//# sourceMappingURL=dripDrop-dev.umd.js.map