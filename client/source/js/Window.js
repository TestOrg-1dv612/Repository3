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
 * @param {Number} id
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

    this.handleMovement();
};

/**
 * Handles dragging movements of the window.
 */
Window.prototype.handleMovement = function() {
    let windowDiv = document.getElementById(this.id);

    let posX = 0;
    let posY = 0;

    let moveWindow = function(event) {
        windowDiv.style.top = (event.clientY - posY) + "px";
        windowDiv.style.left = (event.clientX - posX) + "px";
    };

    let getPosition = function(event) {
        event.preventDefault();
        windowDiv.parentNode.appendChild(windowDiv);
        posX = event.clientX - windowDiv.offsetLeft;
        posY = event.clientY - windowDiv.offsetTop;
        window.addEventListener("mousemove", moveWindow);
    };

    windowDiv.firstElementChild.addEventListener("mousedown", getPosition);

    window.addEventListener("mouseup", function() {
        window.removeEventListener("mousemove", moveWindow);
    });
};

/**
 * Exports.
 *
 * @type {Window}
 */
module.exports = Window;
