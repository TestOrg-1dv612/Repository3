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
