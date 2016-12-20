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
