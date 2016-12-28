/**
 * Module for Remember application.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

"use strict";

const DesktopWindow = require("./DesktopWindow");
const storage = require("./localstorage");

/**
 * Creates an instance of Remember.
 *
 * @constructor
 * @param id
 */
function Remember(id) {
    DesktopWindow.call(this, id);

    this.notes = [];
    this.nr = 1;
    this.new();
}

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

    this.setMenu();

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
    this.dropdown.addEventListener("click", function(event) {
        event.preventDefault();
        this.save();
    }.bind(this));
};

/**
 * Sets the dropdown menu containing notes.
 */
Remember.prototype.setMenu = function() {
    let element = document.getElementById(this.id).querySelector(".menulink");
    let menuClone = element.cloneNode(true);
    element.parentNode.appendChild(menuClone);

    let newLink = document.getElementById(this.id).querySelectorAll(".menulink")[1];
    newLink.firstElementChild.textContent = "Notes";
    newLink.querySelector(".dropdown").removeChild(newLink.querySelector(".dropdown a"));
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

    this.notes.push(input);
};

/**
 * Saves current note to local storage.
 */
Remember.prototype.save = function() {
    storage.set("notes", this.notes);

    let newLink = document.getElementById(this.id).querySelectorAll(".menulink")[1];
    let dropdownClone = document.getElementById(this.id).querySelectorAll(".menulink")[0].
        querySelector(".dropdown a").cloneNode(true);
    newLink.lastElementChild.appendChild(dropdownClone);

    let dropdownLink = newLink.querySelector(".dropdown").lastElementChild;
    dropdownLink.textContent = "Note" + this.nr;
    let nr = this.nr;
    this.nr += 1;

    dropdownLink.addEventListener("click", function(event) {
        event.preventDefault();
        this.get(nr);
    }.bind(this));
};

/**
 * Gets the item that was clicked on from list.
 *
 * @param {Number} nr - The number of the clicked item in local storage array.
 */
Remember.prototype.get = function(nr) {
    let notes = storage.get("notes").notes;
    let noteContent = notes[(nr - 1)];

    let container = document.getElementById(this.id).querySelector(".note");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    let template = document.querySelector("#remember").content;
    let content = document.importNode(template.firstElementChild.firstElementChild, true);
    container.appendChild(content);

    noteContent.forEach(function(current) {
        let noteElem = document.getElementById(this.id).querySelectorAll(".note p")[0].cloneNode(true);
        noteElem.textContent = current;
        container.appendChild(noteElem);
    }.bind(this));
};

/**
 * Exports.
 *
 * @type {Remember}
 */
module.exports = Remember;
