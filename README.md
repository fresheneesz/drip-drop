
`drip-drop`
=====

Drip-drop is a simple generalized drag-and-drop module that abstracts away most of the drag-and-drop APIs weirdness and surprises.
This library simply handles drag-and-drop events in all the major cases:
* within a browser window,
* between browser windows
* into a browser window from an external program (including uploading files from your desktop),
* and to an external program from a browser window.

Example
=======

It can be this easy

```javascript
var dd = require("drip-drop")

dd.drag(myDomNode, {
    dragImage: true, // default drag image
    start: function(setData, e) {
        setData('myCustomData', JSON.stringify({a:1, b:"NOT THE BEES"})) // camel case types are allowed!*
    }
})
dd.drop(myDropzone, {
    drop: function(data, pointer, e) {
        myDropzone.innerHTML = data.myCustomData
    }
})
```

Motivation
==========

Man does the HTML5 drag and drop API suck big giant donkey balls!
And all the existing drag-and-drop modules I could find are either tied to a framework like Angular or React, or are trying to give you
complex libraries for moving elements around on the page.
I wanted a generalized library I could use as the basis for any drag-and-drop situation without being bloated by code that is only needed in a subset of the situations.

Install
=======

```
npm install drip-drop
```


Usage
=====

Accessing drip-drop:
```javascript
// node.js
var dd = require('drip-drop')

// amd
require.config({paths: {'drip-drop': '../generatedBuilds/drip-drop.umd.js'}})
require(['drip-drop'], function(dd) { /* your code */ })

// global variable
<script src="drip-drop.umd.js"></script>
dripDrop; // drip-drop.umd.js can define dripDrop globally if you really
       //   want to shun module-based design
```

Using drip-drop:

***`dd.drag(domNode, options)`*** - Sets up drag-related events on the `domNode`. Returns a function that, when called, remove the handlers for those events.
* `domNode` - The domNode to be set as a drag source (you can then drag from that element).
* `options`
    * `image` - Can take on one of the following possible values:
        * `false` - (Default) No image.
        * `true` - The default generated drag image.
        * `aString` - The path to an image to show next to the cursor while dragging.
        * `imageObject` - If this is an [Image object](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image), the image it represents will be used
    * `start(setData, e)` - This function will be called when dragging starts. Use setData to set the data for each type.
        * `setData(type,stringData)` - Sets data for a particular type.
            * NOTE: In an attempt mitigate type lower-casing weirdness, capitals will be converted to dash-lowercase *and* lowercase without dashes. Drip-drop's `drop` function will convert back to camel case. **Eg. using the type "camelCase" will set the value on both the type "camelcase" and "camel-case".**
            * CAVEAT: Internet Explorer only allows two possible values for 'type': `"text"` and `"url"`. IE isn't making any friends here. Complain about it here: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/329509/
        * `e` - The original [Drag Event object](https://developer.mozilla.org/en-US/docs/Web/API/DragEvent).
    * `move(pointerPosition, e)` - This function will be called when the drag event moves position.
        * `pointerPosition` - An object with the properties `x` and `y` containing the current position of the pointer.
    * `end(e)` - This function will be called when the drag event has been either completed or canceled.

***`dd.drop(domNode, options)`*** - Sets up drop-related events on the `domNode`. Returns a function that, when called, remove the handlers for those events.
* `domNode` - The domNode to be set as a drop-zone.
* `options`
    * `allow` - A list of types to allow the event handlers be called for. If this is passed and the current drag operation doesn't have an allowed type, the handlers will not be called. If this isn't passed, all types are allowed.
    * `enter(types, e)` - A function called when a drag action enters the node
        * types - The data types available on drop. If any types have the sequence dash-then-lowercase-letter, the type will exist in its original form *and* in a camel cased from. **Eg. `["text", "camel-case"]` will be transformed into `["text", "camel-case", "camelCase"]`.** Also note that the data associated with the types is only available in the 'drop' event.
        * `e` - The original [Drag Event object](https://developer.mozilla.org/en-US/docs/Web/API/DragEvent).
    * `move(types, pointerPosition, e)` - This function will be called when the drag event moves position over the drop-zone.
        * `pointerPosition` - An object with the properties `x` and `y` containing the current position of the pointer.
    * `leave(types,e)` - A function called with the dragging pointer moves out of the node or is canceled.
    * `drop(data, pointerPosition, e)` - This function will be called when the dragging pointer releases above the node.
        * `data` - An object where each key is a data type. If a type contains dashes, the type will be available as-is *and* with dash-lowercase converted to camel case (matching the `types` described above). The value with either be:
             * For the 'Files' type, the value is a list of files, each with a set of properties described here: https://developer.mozilla.org/en-US/docs/Web/API/File . In addition, the files have the methods:
                * `getText(errback)` - Returns the text of the file in a call to the the errback.
                * `getBuffer(errback)` - Returns a Buffer of the file contents in a call to the the errback.
             * For any other type, the value is a string of data in a format depending on the type

***`dd.dontPreventDefault`*** - Unsets some document-level handlers that prevent the defaults for 'dragenter' and 'dragover'. If you call this, you will need to call `event.preventDefault()` in the appropriate `dd.drop` 'event' and 'move' handlers.

***`dd.ghostItem(domNode[, zIndex])`*** - Returns a semi-transparent clone of the passed dom node ready to be moved with `dd.moveAbsoluteNode`.
    * zIndex - (Default: 1000) - The zIndex to give to the returned clone.

*** `dd.moveAbsoluteNode(domNode, x, y)`*** -  Moves an absolutely positioned element to the position by x and y.

### `ghostItem` and `moveAbsoluteNode` example

These two functions are basic helper functions for doing the common drag visualization of creating a semi-transparent clone of what you're dragging and moving it along with your mouse.

```javascript
var ghostItem;
dd.drag(myDomNode, {
    start: function(setData, e) {
        setData('myCustomData', "Through counter-intelligence it should be possible to pinpoint potential troublemakers, and neutralize them.")
        ghostItem = dd.ghostItem(myDomNode.parent)
        document.body.appendChild(ghostItem)
    }
    move: function(pointer, event) {
        dd.moveAbsoluteNode(ghostItem, pointer.x, pointer.y)
    },
    end: function() {
        document.body.removeChild(ghostItem)
    }
})
```

### The bizzarities that drip-drop abstracts away from the [garbagy native drag-and-drop API](http://www.quirksmode.org/blog/archives/2009/09/the_html5_drag.html)

* Handles canceling the default at the appropriate times
* Prevents dragging a file on the wrong spot from loading that file, which would kill your application (this can be turned off if for some reason you want that behavior)
* Replaces the 'dragover' event (which fires even when your pointer isn't moving) with the 'move' event (which only fires when your pointer moves)
* Replaces the 'dragleave' event (which fires even when your pointer doesn't exit the dropzone if it crosses child-node boundaries) with 'leave' (which doesn't do that stupid BS)
* Allows you to use camelcase in setData 'types' (see description of the 'start' event for caveats)
* Only 6 event-types to care about (rather than the 8 from the spec)
* Provides an easy and obvious way to make changes related to the source element on-pointer-move (drag's 'move' event)

Todo
======

How to Contribute!
============

Anything helps:

* Creating issues (aka tickets/bugs/etc). Please feel free to use issues to report bugs, request features, and discuss changes
* Updating the documentation: ie this readme file. Be bold! Help create amazing documentation!
* Submitting pull requests.

How to submit pull requests:

1. Please create an issue and get my input before spending too much time creating a feature. Work with me to ensure your feature or addition is optimal and fits with the purpose of the project.
2. Fork the repository
3. clone your forked repo onto your machine and run `npm install` at its root
4. If you're gonna work on multiple separate things, its best to create a separate branch for each of them
5. edit!
6. When you're done, run the unit tests and ensure they all pass
7. Commit and push your changes
8. Submit a pull request: https://help.github.com/articles/creating-a-pull-request

Change Log
=========

* 0.0.1 - first commit!

License
=======
Released under the MIT license: http://opensource.org/licenses/MIT