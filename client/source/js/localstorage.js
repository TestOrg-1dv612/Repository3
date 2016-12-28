/**
 * Module for handling local storage.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

"use strict";

/**
 * Gets an item from local storage.
 *
 * @param {String} name - The name of the item to get.
 * @returns item - The requested item
 */
function get(name) {
    if (name === "notes") {
        return JSON.parse(localStorage.getItem(name));
    } else {
        return localStorage.getItem(name);
    }
}

/**
 * Sets an item in local storage.
 *
 * @param {String} itemName - The name of the item to set.
 * @param item - The item.
 */
function set(itemName, item) {
    if (itemName === "notes") {
        let notes;
        if (get(itemName)) {
            notes = get(itemName).notes;
        } else {
            notes = [];
        }

        notes.push(item);
        let allNotes = {
            notes: notes
        };

        localStorage.setItem(itemName, JSON.stringify(allNotes));
    } else {
        localStorage.setItem(itemName, item);
    }
}

/**
 * Exports.
 *
 * @type {Object}
 */
module.exports = {
    set: set,
    get: get
};
