(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Module for Window.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

"use strict";

/**
 * Creates a new instance of Window.
 *
 * @constructor
 * @param {String} id - The id of the window to create.
 * @throws {Error} - Window must have an id.
 */
function Window(id) {
    if (!id) {
        throw new Error("Window must have an id.");
    }

    /**
     * Gets Window's top-name.
     *
     * @private
     * @type {Element}
     * @name Window#name
     */
    Object.defineProperty(this, "name", {
        get: function() {
            return document.getElementById(this.id).querySelector(".name");
        }
    });

    /**
     * Gets Window's top-name.
     *
     * @private
     * @type {Element}
     * @name Window#icon
     */
    Object.defineProperty(this, "icon", {
        get: function() {
            return document.getElementById(this.id).querySelector(".logo");
        }
    });

    /**
     * Gets Window's id.
     *
     * @private
     * @type {String}
     * @name Window#id
     * @throws {TypeError} - Must be a string.
     */
    Object.defineProperty(this, "id", {
        get: function() {
            if (typeof id !== "string") {
                throw new TypeError("Window id must be a string.");
            }

            return id;
        }
    });

    this.create();
}

/**
 * Creates a new window from template.
 */
Window.prototype.create = function() {
    let template = document.querySelector("#window");
    let windowDiv = document.importNode(template.content, true);
    document.querySelector("#desktop").appendChild(windowDiv);
    document.querySelector("#unclaimed").id = this.id;

    let id = this.id.toString();
    let div = document.getElementById(this.id);

    this.position(id, div);
    this.handleMovement(div);

    div.addEventListener("click", function(event) {
        if (div !== div.parentNode.lastElementChild) {
            div.parentNode.appendChild(div);
        } else if (event.target === div.querySelector(".close")) {
            event.preventDefault();
            this.close(div);
        }
    }.bind(this));
};

/**
 * Positions the window in the desktop, stacks if necessary.
 *
 * @param {String} id - The id of the window.
 * @param {Element} div - The window element.
 */
Window.prototype.position = function(id, div) {
    let stackWindows = function(app) {
        if (id.indexOf("1") === -1) {
            let idNr = id.charAt(1) - 1;
            if (document.getElementById(app + idNr)) {
                let elementBefore = document.getElementById(app + idNr);
                div.style.top = (elementBefore.offsetTop + 35) + "px";
                div.style.left = (elementBefore.offsetLeft + 35) + "px";
            }
        }
    };

    if (id.indexOf("c") !== -1) {
        stackWindows("c");
    } else if (id.indexOf("m") !== -1) {
        div.style.left = (div.offsetLeft + 250) + "px";
        stackWindows("m");
    } else if (id.indexOf("i") !== -1) {
        div.style.left = (div.offsetLeft + 500) + "px";
        stackWindows("i");
    }
};

/**
 * Handles dragging movements of the window.
 *
 * @param {Element} div - The div containing the window.
 */
Window.prototype.handleMovement = function(div) {
    let posX = 0;
    let posY = 0;

    let moveWindow = function(event) {
        div.style.top = (event.clientY - posY) + "px";
        div.style.left = (event.clientX - posX) + "px";
    };

    let getPosition = function(event) {
        event.preventDefault();
        div.parentNode.appendChild(div);
        posX = event.clientX - div.offsetLeft;
        posY = event.clientY - div.offsetTop;
        window.addEventListener("mousemove", moveWindow);
    };

    div.firstElementChild.addEventListener("mousedown", getPosition);

    window.addEventListener("mouseup", function() {
        window.removeEventListener("mousemove", moveWindow);
    });
};

/**
 * Closes the window.
 *
 * @param {Element} element - The element window to close.
 */
Window.prototype.close = function(element) {
    element.parentNode.removeChild(element);
};

/**
 * Exports.
 *
 * @type {Window}
 */
module.exports = Window;

},{}],2:[function(require,module,exports){
/**
 * Start of the application.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

const desktop = require("./desktop");

desktop.init();

},{"./desktop":3}],3:[function(require,module,exports){
/**
 * Module for desktop.
 */

"use strict";

const DesktopWindow = require("./Window");

/**
 * Gets the current time and presents it in the given container.
 *
 * @param {Element} container - The container of the clock.
 */
function desktopClock(container) {
    console.log("clock");
    if (!container) {
        container = document.querySelector("#clock");
    }

    let today = new Date();
    let hours = today.getHours();
    let mins = today.getMinutes();

    if (mins < 10) {
        mins = "0" + mins;
    }

    container.textContent = hours + ":" + mins;
}

/**
 * Gets today's date and presents it in the given container.
 *
 * @param {Element} container - The container of the clock.
 */
function getDate(container) {
    let today = new Date();
    let month = ["jan", "feb", "mar", "apr", "may", "june", "july", "aug", "sept", "oct", "nov", "dec"];
    container.textContent = today.getDate() + " " + month[today.getMonth()] + " " + today.getFullYear();
}

/**
 * Initiates desktop by adding necessary event listeners.
 */
function init() {
    let newWindow;
    let cNr = 1;
    let mNr = 1;
    let iNr = 1;
    document.querySelectorAll("nav a").forEach(function(current, index) {
        switch (index){
            case 0:
                current.addEventListener("click", function(event) {
                    event.preventDefault();
                    newWindow = new DesktopWindow("c" + cNr);
                    newWindow.name.textContent = "Chat";
                    newWindow.icon.src = "/image/chat.png";
                    cNr += 1;
                });

                break;
            case 1:
                current.addEventListener("click", function(event) {
                    event.preventDefault();
                    newWindow = new DesktopWindow("m" + mNr);
                    mNr += 1;
                });

                break;
            case 2:
                current.addEventListener("click", function(event) {
                    event.preventDefault();
                    newWindow = new DesktopWindow("i" + iNr);
                    newWindow.name.textContent = "Application info";
                    newWindow.icon.src = "/image/info.png";
                    iNr += 1;
                });

                break;
        }
    });

    getDate(document.querySelector("#date"));
    desktopClock(document.querySelector("#clock"));
    setInterval(desktopClock, 5000);
}

/**
 * Exports.
 */
module.exports = {
    init: init,
    getClock: desktopClock,
    getDate: getDate
};

},{"./Window":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2Rlc2t0b3AuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIE1vZHVsZSBmb3IgV2luZG93LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIFdpbmRvdy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgd2luZG93IHRvIGNyZWF0ZS5cbiAqIEB0aHJvd3Mge0Vycm9yfSAtIFdpbmRvdyBtdXN0IGhhdmUgYW4gaWQuXG4gKi9cbmZ1bmN0aW9uIFdpbmRvdyhpZCkge1xuICAgIGlmICghaWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2luZG93IG11c3QgaGF2ZSBhbiBpZC5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBXaW5kb3cncyB0b3AtbmFtZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgV2luZG93I25hbWVcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJuYW1lXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLm5hbWVcIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgV2luZG93J3MgdG9wLW5hbWUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIFdpbmRvdyNpY29uXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiaWNvblwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5sb2dvXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIFdpbmRvdydzIGlkLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBuYW1lIFdpbmRvdyNpZFxuICAgICAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gLSBNdXN0IGJlIGEgc3RyaW5nLlxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImlkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiV2luZG93IGlkIG11c3QgYmUgYSBzdHJpbmcuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuY3JlYXRlKCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB3aW5kb3cgZnJvbSB0ZW1wbGF0ZS5cbiAqL1xuV2luZG93LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvd1wiKTtcbiAgICBsZXQgd2luZG93RGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Rlc2t0b3BcIikuYXBwZW5kQ2hpbGQod2luZG93RGl2KTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3VuY2xhaW1lZFwiKS5pZCA9IHRoaXMuaWQ7XG5cbiAgICBsZXQgaWQgPSB0aGlzLmlkLnRvU3RyaW5nKCk7XG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpO1xuXG4gICAgdGhpcy5wb3NpdGlvbihpZCwgZGl2KTtcbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KGRpdik7XG5cbiAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChkaXYgIT09IGRpdi5wYXJlbnROb2RlLmxhc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgICAgICAgIGRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0ID09PSBkaXYucXVlcnlTZWxlY3RvcihcIi5jbG9zZVwiKSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoZGl2KTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG4vKipcbiAqIFBvc2l0aW9ucyB0aGUgd2luZG93IGluIHRoZSBkZXNrdG9wLCBzdGFja3MgaWYgbmVjZXNzYXJ5LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtFbGVtZW50fSBkaXYgLSBUaGUgd2luZG93IGVsZW1lbnQuXG4gKi9cbldpbmRvdy5wcm90b3R5cGUucG9zaXRpb24gPSBmdW5jdGlvbihpZCwgZGl2KSB7XG4gICAgbGV0IHN0YWNrV2luZG93cyA9IGZ1bmN0aW9uKGFwcCkge1xuICAgICAgICBpZiAoaWQuaW5kZXhPZihcIjFcIikgPT09IC0xKSB7XG4gICAgICAgICAgICBsZXQgaWROciA9IGlkLmNoYXJBdCgxKSAtIDE7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXBwICsgaWROcikpIHtcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudEJlZm9yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFwcCArIGlkTnIpO1xuICAgICAgICAgICAgICAgIGRpdi5zdHlsZS50b3AgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRUb3AgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRMZWZ0ICsgMzUpICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGlmIChpZC5pbmRleE9mKFwiY1wiKSAhPT0gLTEpIHtcbiAgICAgICAgc3RhY2tXaW5kb3dzKFwiY1wiKTtcbiAgICB9IGVsc2UgaWYgKGlkLmluZGV4T2YoXCJtXCIpICE9PSAtMSkge1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChkaXYub2Zmc2V0TGVmdCArIDI1MCkgKyBcInB4XCI7XG4gICAgICAgIHN0YWNrV2luZG93cyhcIm1cIik7XG4gICAgfSBlbHNlIGlmIChpZC5pbmRleE9mKFwiaVwiKSAhPT0gLTEpIHtcbiAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSAoZGl2Lm9mZnNldExlZnQgKyA1MDApICsgXCJweFwiO1xuICAgICAgICBzdGFja1dpbmRvd3MoXCJpXCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBkcmFnZ2luZyBtb3ZlbWVudHMgb2YgdGhlIHdpbmRvdy5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpdiAtIFRoZSBkaXYgY29udGFpbmluZyB0aGUgd2luZG93LlxuICovXG5XaW5kb3cucHJvdG90eXBlLmhhbmRsZU1vdmVtZW50ID0gZnVuY3Rpb24oZGl2KSB7XG4gICAgbGV0IHBvc1ggPSAwO1xuICAgIGxldCBwb3NZID0gMDtcblxuICAgIGxldCBtb3ZlV2luZG93ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZGl2LnN0eWxlLnRvcCA9IChldmVudC5jbGllbnRZIC0gcG9zWSkgKyBcInB4XCI7XG4gICAgICAgIGRpdi5zdHlsZS5sZWZ0ID0gKGV2ZW50LmNsaWVudFggLSBwb3NYKSArIFwicHhcIjtcbiAgICB9O1xuXG4gICAgbGV0IGdldFBvc2l0aW9uID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGl2LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgcG9zWCA9IGV2ZW50LmNsaWVudFggLSBkaXYub2Zmc2V0TGVmdDtcbiAgICAgICAgcG9zWSA9IGV2ZW50LmNsaWVudFkgLSBkaXYub2Zmc2V0VG9wO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlV2luZG93KTtcbiAgICB9O1xuXG4gICAgZGl2LmZpcnN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZ2V0UG9zaXRpb24pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlV2luZG93KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgd2luZG93IHRvIGNsb3NlLlxuICovXG5XaW5kb3cucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtZW50KTtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7V2luZG93fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFdpbmRvdztcbiIsIi8qKlxuICogU3RhcnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5jb25zdCBkZXNrdG9wID0gcmVxdWlyZShcIi4vZGVza3RvcFwiKTtcblxuZGVza3RvcC5pbml0KCk7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgZGVza3RvcC5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL1dpbmRvd1wiKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBjdXJyZW50IHRpbWUgYW5kIHByZXNlbnRzIGl0IGluIHRoZSBnaXZlbiBjb250YWluZXIuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIgLSBUaGUgY29udGFpbmVyIG9mIHRoZSBjbG9jay5cbiAqL1xuZnVuY3Rpb24gZGVza3RvcENsb2NrKGNvbnRhaW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiY2xvY2tcIik7XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjbG9ja1wiKTtcbiAgICB9XG5cbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBob3VycyA9IHRvZGF5LmdldEhvdXJzKCk7XG4gICAgbGV0IG1pbnMgPSB0b2RheS5nZXRNaW51dGVzKCk7XG5cbiAgICBpZiAobWlucyA8IDEwKSB7XG4gICAgICAgIG1pbnMgPSBcIjBcIiArIG1pbnM7XG4gICAgfVxuXG4gICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gaG91cnMgKyBcIjpcIiArIG1pbnM7XG59XG5cbi8qKlxuICogR2V0cyB0b2RheSdzIGRhdGUgYW5kIHByZXNlbnRzIGl0IGluIHRoZSBnaXZlbiBjb250YWluZXIuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIgLSBUaGUgY29udGFpbmVyIG9mIHRoZSBjbG9jay5cbiAqL1xuZnVuY3Rpb24gZ2V0RGF0ZShjb250YWluZXIpIHtcbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBtb250aCA9IFtcImphblwiLCBcImZlYlwiLCBcIm1hclwiLCBcImFwclwiLCBcIm1heVwiLCBcImp1bmVcIiwgXCJqdWx5XCIsIFwiYXVnXCIsIFwic2VwdFwiLCBcIm9jdFwiLCBcIm5vdlwiLCBcImRlY1wiXTtcbiAgICBjb250YWluZXIudGV4dENvbnRlbnQgPSB0b2RheS5nZXREYXRlKCkgKyBcIiBcIiArIG1vbnRoW3RvZGF5LmdldE1vbnRoKCldICsgXCIgXCIgKyB0b2RheS5nZXRGdWxsWWVhcigpO1xufVxuXG4vKipcbiAqIEluaXRpYXRlcyBkZXNrdG9wIGJ5IGFkZGluZyBuZWNlc3NhcnkgZXZlbnQgbGlzdGVuZXJzLlxuICovXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIGxldCBuZXdXaW5kb3c7XG4gICAgbGV0IGNOciA9IDE7XG4gICAgbGV0IG1OciA9IDE7XG4gICAgbGV0IGlOciA9IDE7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIm5hdiBhXCIpLmZvckVhY2goZnVuY3Rpb24oY3VycmVudCwgaW5kZXgpIHtcbiAgICAgICAgc3dpdGNoIChpbmRleCl7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IERlc2t0b3BXaW5kb3coXCJjXCIgKyBjTnIpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cubmFtZS50ZXh0Q29udGVudCA9IFwiQ2hhdFwiO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cuaWNvbi5zcmMgPSBcIi9pbWFnZS9jaGF0LnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICBjTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBEZXNrdG9wV2luZG93KFwibVwiICsgbU5yKTtcbiAgICAgICAgICAgICAgICAgICAgbU5yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgRGVza3RvcFdpbmRvdyhcImlcIiArIGlOcik7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5uYW1lLnRleHRDb250ZW50ID0gXCJBcHBsaWNhdGlvbiBpbmZvXCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL2luZm8ucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIGlOciArPSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGdldERhdGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkYXRlXCIpKTtcbiAgICBkZXNrdG9wQ2xvY2soZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjbG9ja1wiKSk7XG4gICAgc2V0SW50ZXJ2YWwoZGVza3RvcENsb2NrLCA1MDAwKTtcbn1cblxuLyoqXG4gKiBFeHBvcnRzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBpbml0LFxuICAgIGdldENsb2NrOiBkZXNrdG9wQ2xvY2ssXG4gICAgZ2V0RGF0ZTogZ2V0RGF0ZVxufTtcbiJdfQ==
