/**
 * Module for Remember application.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

"use strict";

const DesktopWindow = require("./DesktopWindow");

/**
 * Creates an instance of Remember.
 *
 * @constructor
 * @param id
 */
function Remember(id) {
    DesktopWindow.call(this, id);
    this.new();
};

/**
 * Handles inheritance from DesktopWindow.
 *
 * @type {DesktopWindow}
 */
Remember.prototype = Object.create(DesktopWindow.prototype);
Remember.prototype.constructor = Remember;

/**
 * Creates a new note.
 */
Remember.prototype.new = function() {
    let template = document.querySelector("#remember").content;
    let content = document.importNode(template, true);
    document.getElementById(this.id).querySelector(".content").appendChild(content);

    let input = document.getElementById(this.id).querySelector(".note-input");
    document.getElementById(this.id).querySelector("button").addEventListener("click", function() {
        if (!input.value) {
            input.classList.add("redbg");
        } else {
            input.classList.remove("redbg");
            this.add(input.value);
            input.value = "";
        }
    }.bind(this));

    this.dropdown.textContent = "Save";
};

/**
 * Adds input to the note.
 *
 * @param {String} input - User input from element.
 */
Remember.prototype.add = function(input) {
    let noteElem = document.getElementById(this.id).querySelectorAll(".note p")[0].cloneNode(true);
    noteElem.textContent = input;
    document.getElementById(this.id).querySelector(".note").appendChild(noteElem);
};

/**
 * Exports.
 *
 * @type {Remember}
 */
module.exports = Remember;
