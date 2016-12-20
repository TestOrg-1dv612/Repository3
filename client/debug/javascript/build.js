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
 * @param {Number} id - The id of the window to create.
 */
function Window(id) {
    this.id = id;
    this.container = document.querySelector("#desktop");
    this.create();
}

/**
 * Creates a new window from template.
 */
Window.prototype.create = function() {
    let template = document.querySelector("#window");
    let windowDiv = document.importNode(template.content, true);
    this.container.appendChild(windowDiv);
    document.querySelector("#unclaimed").id = this.id;

    let div = document.getElementById(this.id);
    if (this.id !== 1) {
        let eID = this.id - 1;
        let elementBefore = document.getElementById(eID);
        div.style.top = (elementBefore.offsetTop + 35) + "px";
        div.style.left = (elementBefore.offsetLeft + 35) + "px";
    }

    this.handleMovement(div);

    div.addEventListener("click", function() {
        if (div !== div.parentNode.lastElementChild) {
            div.parentNode.appendChild(div);
        } else { return; }
    });

    div.querySelector(".close").addEventListener("click", function(event) {
        event.preventDefault();
        this.close(div);
    }.bind(this));
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

const Window = require("./Window");

let window = new Window(1);

let window2 = new Window(2);
let window3 = new Window(3);
let window4 = new Window(4);

},{"./Window":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvV2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogTW9kdWxlIGZvciBXaW5kb3cuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgV2luZG93LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cgdG8gY3JlYXRlLlxuICovXG5mdW5jdGlvbiBXaW5kb3coaWQpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Rlc2t0b3BcIik7XG4gICAgdGhpcy5jcmVhdGUoKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHdpbmRvdyBmcm9tIHRlbXBsYXRlLlxuICovXG5XaW5kb3cucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93XCIpO1xuICAgIGxldCB3aW5kb3dEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHdpbmRvd0Rpdik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN1bmNsYWltZWRcIikuaWQgPSB0aGlzLmlkO1xuXG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpO1xuICAgIGlmICh0aGlzLmlkICE9PSAxKSB7XG4gICAgICAgIGxldCBlSUQgPSB0aGlzLmlkIC0gMTtcbiAgICAgICAgbGV0IGVsZW1lbnRCZWZvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlSUQpO1xuICAgICAgICBkaXYuc3R5bGUudG9wID0gKGVsZW1lbnRCZWZvcmUub2Zmc2V0VG9wICsgMzUpICsgXCJweFwiO1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChlbGVtZW50QmVmb3JlLm9mZnNldExlZnQgKyAzNSkgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChkaXYpO1xuXG4gICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGRpdiAhPT0gZGl2LnBhcmVudE5vZGUubGFzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICAgICAgZGl2LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgfSBlbHNlIHsgcmV0dXJuOyB9XG4gICAgfSk7XG5cbiAgICBkaXYucXVlcnlTZWxlY3RvcihcIi5jbG9zZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5jbG9zZShkaXYpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgZHJhZ2dpbmcgbW92ZW1lbnRzIG9mIHRoZSB3aW5kb3cuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBkaXYgLSBUaGUgZGl2IGNvbnRhaW5pbmcgdGhlIHdpbmRvdy5cbiAqL1xuV2luZG93LnByb3RvdHlwZS5oYW5kbGVNb3ZlbWVudCA9IGZ1bmN0aW9uKGRpdikge1xuICAgIGxldCBwb3NYID0gMDtcbiAgICBsZXQgcG9zWSA9IDA7XG5cbiAgICBsZXQgbW92ZVdpbmRvdyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGRpdi5zdHlsZS50b3AgPSAoZXZlbnQuY2xpZW50WSAtIHBvc1kpICsgXCJweFwiO1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChldmVudC5jbGllbnRYIC0gcG9zWCkgKyBcInB4XCI7XG4gICAgfTtcblxuICAgIGxldCBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgIHBvc1ggPSBldmVudC5jbGllbnRYIC0gZGl2Lm9mZnNldExlZnQ7XG4gICAgICAgIHBvc1kgPSBldmVudC5jbGllbnRZIC0gZGl2Lm9mZnNldFRvcDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgfTtcblxuICAgIGRpdi5maXJzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGdldFBvc2l0aW9uKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIENsb3NlcyB0aGUgd2luZG93LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHdpbmRvdyB0byBjbG9zZS5cbiAqL1xuV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge1dpbmRvd31cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBXaW5kb3c7XG4iLCIvKipcbiAqIFN0YXJ0IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuY29uc3QgV2luZG93ID0gcmVxdWlyZShcIi4vV2luZG93XCIpO1xuXG5sZXQgd2luZG93ID0gbmV3IFdpbmRvdygxKTtcblxubGV0IHdpbmRvdzIgPSBuZXcgV2luZG93KDIpO1xubGV0IHdpbmRvdzMgPSBuZXcgV2luZG93KDMpO1xubGV0IHdpbmRvdzQgPSBuZXcgV2luZG93KDQpO1xuIl19
