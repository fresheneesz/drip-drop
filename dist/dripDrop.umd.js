!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):"object"==typeof exports?exports.dripDrop=t():e.dripDrop=t()}(this,function(){return function(e){function t(n){if(r[n])return r[n].exports;var o=r[n]={exports:{},id:n,loaded:!1};return e[n].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var r={};return t.m=e,t.c=r,t.p="",t(0)}([function(e,t,r){t.drop=r(1),t.drag=r(2),t.dontPreventDefault=function(){document.removeEventListener("dragenter",n),document.removeEventListener("dragover",o)},t.ghostItem=function(e,t){void 0===t&&(t=1e3);var r=e.cloneNode(!0);return r.style.position="absolute",r.style.top="-100px",r.style.width=e.clientWidth+"px",r.style.opacity=".6",r.style.pointerEvents="none",r.style["z-index"]=t,r},t.moveAbsoluteNode=function(e,t,r){e.style.left=t+"px",e.style.top=r+"px"};var n,o;document.addEventListener("dragenter",n=function(e){e.preventDefault()}),document.addEventListener("dragover",o=function(e){e.preventDefault()})},function(e){function t(e,t,r){var n=new FileReader;n.onloadend=function(e){e.target.readyState==FileReader.DONE&&r(void 0,n.result)},n.onerror=function(e){r(e)},n[t](e)}function r(e){var r={};e.files.length>0&&(r.Files=e.files);for(var a=0;a<e.types.length;a++){var d=e.types[a];if("Files"===d){r.Files=e.files;for(var i=0;i<r.Files.length;i++){var v=r.Files[i];v.getText=function(e){t(v,"readAsText",e)},v.getBuffer=function(e){t(v,"readAsArrayBuffer",e)}}}else{n(r,e,d);var s=o(d);s!==d&&n(r,e,s)}}return r}function n(e,t,r){Object.defineProperty(e,r,{enumerable:!0,get:function(){return t.getData(r)}})}function o(e){return e.replace(/(-[a-z])/g,function(e,t){return t[1].toUpperCase()})}e.exports=function(e,t){if(t.allow)var n=t.allow,o=function(e){for(var t=0;t<n.length;t++)if(-1!==e.indexOf(n[t]))return!0;return!1};else var o=function(){return!0};var a,d={node:e},i=0;if(e.addEventListener("dragenter",d.enter=function(e){if(i++,1===i){var n=r(e.dataTransfer);a=Object.keys(n),void 0!==t.enter&&o(a)&&t.enter(a,e)}}),t.move){var v,s="copy";e.addEventListener("dragover",d.over=function(e){(void 0===v||e.pageX!==v.x||e.pageY!==v.y)&&(v={x:e.pageX,y:e.pageY},o(a)&&(s=t.move(a,e))),s&&(e.dataTransfer.dropEffect=s)})}return e.addEventListener("dragleave",d.leave=function(e){i--,0===i&&(t.leave&&o(a)&&t.leave(a,e),i=0)}),t.drop&&e.addEventListener("drop",d.drop=function(e){if(e.preventDefault(),o(a)){var n=r(e.dataTransfer);t.drop(n,{x:e.pageX,y:e.pageY},e)}i=0}),function(e){e.enter&&e.node.removeEventListener("dragstart",e.start),e.move&&document.removeEventListener("dragover",e.docover),e.leave&&e.node.removeEventListener("dragend",e.end),e.drop&&e.node.removeEventListener("drop",e.drop)}}},function(e){function t(e){return e.replace(/([A-Z])/g,function(e,t){return"-"+t.toLowerCase()})}e.exports=function(e,r){r||(r={}),e.setAttribute("draggable","true");var n={node:e};return r.start&&e.addEventListener("dragstart",n.start=function(o){if(void 0!==r.image){if(r.image!==!0){if("string"==typeof r.image)var a=new Image(r.image);else var a=r.image;o.dataTransfer.setDragImage(a,a.width,a.height)}}else o.dataTransfer.setDragImage(new Image,0,0);var d=o.dataTransfer,i=r.start(function(e,r){d.setData(e,r);var n=t(e);n!==e&&d.setData(n,r)},o);if(i&&(o.dataTransfer.effectAllowed=i),r.move){var v;document.addEventListener("dragover",n.docOver=function(e){(void 0===v||e.pageX!==v.x||e.pageY!==v.y)&&(v={x:e.pageX,y:e.pageY},r.move(e))}),e.addEventListener("dragend",function s(){document.removeEventListener("dragover",n.docOver),n.node.removeEventListener("dragend",s)})}}),r.end&&e.addEventListener("dragend",n.end=r.end),function(){n.start&&n.node.removeEventListener("dragstart",n.start),n.end&&n.node.removeEventListener("dragend",n.end),n.docOver&&document.removeEventListener("dragover",n.docOver)}}}])});
//# sourceMappingURL=dripDrop.umd.js.map