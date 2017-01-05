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
 * @param {String} id - The id of the window.
 */
function Remember(id) {
    DesktopWindow.call(this, id);

    /**
     * The array to hold the notes.
     */
    this.notes = [];

    /**
     * Creates a new note.
     */
    this.new();
}

/**
 * Handles inheritance from DesktopWindow.
 */
Remember.prototype = Object.create(DesktopWindow.prototype);
Remember.prototype.constructor = Remember;

/**
 * Creates a new note.
 *
 * @param {Boolean} notFirst - Whether or not the created note is the first of all or not.
 */
Remember.prototype.new = function(notFirst) {
    let container = this.div.querySelector(".content");
    if (notFirst) {
        this.clear(container);
        this.notes = [];
    }

    let template = document.querySelector("#remember").content;
    let content = document.importNode(template, true);
    container.appendChild(content);

    let input = this.div.querySelector(".note-input");
    this.div.querySelector("button").addEventListener("click", () => {
        if (!input.value) {
            input.classList.add("redbg");
            this.message.textContent = "You need to write an item for the list.";
        } else {
            input.classList.remove("redbg");
            this.message.textContent = "";
            this.add(input.value);
            input.value = "";
        }
    });

    if (!notFirst) {
        this.setMenu();
        if (storage.get("notes") !== null) {
            this.saved(true);
        }

        this.dropdown.textContent = "Save";
        this.dropdown.addEventListener("click", (event) => {
            event.preventDefault();
            if (this.div.querySelectorAll(".note p").length > 1) {
                this.saved();
            } else {
                this.message.textContent = "Note is empty.";
            }
        });
    }
};

/**
 * Sets the different dropdown menus for the application.
 */
Remember.prototype.setMenu = function() {
    let subMenu = this.div.querySelectorAll(".menulink")[0];
    let menuClone = subMenu.cloneNode(true);
    subMenu.parentNode.appendChild(menuClone);

    let newSubMenu = this.div.querySelectorAll(".menulink")[1];
    let noteList = newSubMenu.lastElementChild;
    newSubMenu.firstElementChild.textContent = "Notes";
    noteList.removeChild(newSubMenu.querySelector(".dropdown a"));

    for (let i = 0; i < 2; i += 1) {
        let dropdownClone = subMenu.querySelector(".dropdown a").cloneNode(true);
        subMenu.lastElementChild.appendChild(dropdownClone);
    }

    let dropdownLinks = subMenu.querySelectorAll(".dropdown a");
    dropdownLinks[1].textContent = "New";
    dropdownLinks[2].textContent = "Delete All";

    dropdownLinks[1].addEventListener("click", (event) => {
        event.preventDefault();
        this.new(true);
    });

    dropdownLinks[2].addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("notes");
        this.clear(noteList);
        this.new(true);
    });
};

/**
 * Adds input to the note.
 *
 * @param {String} input - User input from element.
 */
Remember.prototype.add = function(input) {
    let noteElem = this.div.querySelectorAll(".note p")[0].cloneNode(true);
    noteElem.textContent = input;
    this.div.querySelector(".note").appendChild(noteElem);

    this.notes.push(input);
};

/**
 * Saves current note to local storage and adds to submenu, or gets old notes.
 *
 * @param {Boolean} oldNotes - Whether or not there are old notes in local storage.
 */
Remember.prototype.saved = function(oldNotes) {
    let newSubMenu;
    let dropdownLink;

    let addMenuNote = () => {
        newSubMenu = this.div.querySelectorAll(".menulink")[1];
        let dropdownClone = this.div.querySelectorAll(".menulink")[0].querySelector(".dropdown a").cloneNode(true);
        newSubMenu.lastElementChild.appendChild(dropdownClone);

        dropdownLink = newSubMenu.querySelector(".dropdown").lastElementChild;
        dropdownLink.textContent = "Note " + (newSubMenu.querySelectorAll(".dropdown a").length);

        dropdownLink.addEventListener("click", (event) => {
            event.preventDefault();
            let nr = event.target.textContent.slice(5);
            this.get(nr);
        });
    };

    let notes = (storage.get("notes") === null) ? 0 : storage.get("notes").notes;
    if (oldNotes) {
        notes.forEach(() => {
            addMenuNote();
        });
    } else {
        if (notes === 0 || notes.length <= 4) {
            storage.set("notes", this.notes);
            addMenuNote();
            this.new(true);
        } else {
            this.message.textContent = "You already have 5 saved notes.";
        }
    }
};

/**
 * Gets the item that was clicked on from list.
 *
 * @param {Number} nr - The number of the clicked item in local storage array.
 */
Remember.prototype.get = function(nr) {
    let notes = storage.get("notes").notes;
    let noteContent = notes[(nr - 1)];

    this.clear(this.div.querySelector(".note"));

    let template = document.querySelector("#remember").content;
    let content = document.importNode(template.firstElementChild.firstElementChild, true);
    this.div.querySelector(".note").appendChild(content);
    this.notes = noteContent;

    noteContent.forEach((current) => {
        let noteElem = this.div.querySelectorAll(".note p")[0].cloneNode(true);
        noteElem.textContent = current;
        this.div.querySelector(".note").appendChild(noteElem);
    });
};

/**
 * Clears the given container of its content.
 *
 * @param {Element} container - The container to be cleared.
 */
Remember.prototype.clear = function(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

/**
 * Exports.
 *
 * @type {Remember}
 */
module.exports = Remember;
