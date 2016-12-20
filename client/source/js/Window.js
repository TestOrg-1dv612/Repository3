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
 */
function Window() {
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

    this.handleMovement();
};

/**
 * Handles dragging movements of the window.
 */
Window.prototype.handleMovement = function() {
    let windowTop = document.querySelectorAll(".window-wrapper .window-top")[0];

    let posX = 0;
    let posY = 0;

    let moveWindow = function(event) {
        document.styleSheets[0].cssRules[4].style.top = (event.clientY - posY) + "px";
        document.styleSheets[0].cssRules[4].style.left = (event.clientX - posX) + "px";
    };

    let getPosition = function(event) {
        posX = event.clientX - windowTop.parentNode.offsetLeft;
        posY = event.clientY - windowTop.parentNode.offsetTop;
        window.addEventListener("mousemove", moveWindow);
    };

    windowTop.addEventListener("mousedown", getPosition);

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
