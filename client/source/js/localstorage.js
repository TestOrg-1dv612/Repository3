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
 * @returns user - The set username.
 */
function get(name) {
    return localStorage.getItem(name);
}

/**
 * Sets an item in local storage.
 *
 * @param {Object} username - The name of the user.
 */
function set(username) {
    localStorage.setItem("username", username);
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
