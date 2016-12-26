/**
 * Module for Chat.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

"use strict";

const DesktopWindow = require("./DesktopWindow");

/**
 * Creates an instance of a Chat.
 *
 * @constructor
 * @param {String} id - The id of the window.
 */
function Chat(id) {
    DesktopWindow.call(this, id);

    this.user = null;
    this.open();
}

/**
 * Handles inheritance from DesktopWindow.
 *
 * @type {DesktopWindow}
 */
Chat.prototype = Object.create(DesktopWindow.prototype);
Chat.prototype.constructor = Chat;

/**
 *
 */
Chat.prototype.open = function() {
    let template = document.querySelector("#chat").content;
    let content = document.importNode(template, true);
    document.getElementById(this.id).querySelector(".content").appendChild(content);

    let container = document.getElementById(this.id).querySelector(".messageContainer");
    let messageInput = document.getElementById(this.id).querySelector(".chatMessage");
    let user = document.getElementById(this.id).querySelector(".user input");
    let userMessage = user.parentNode;

    userMessage.lastElementChild.addEventListener("click", function() {
        if (user.value) {
            this.user = user.value;
            userMessage.removeChild(user);
            userMessage.removeChild(userMessage.lastElementChild);
            userMessage.classList.add("loggedIn");
            userMessage.textContent = "Logged in as " + this.user;

        }
    });

};

/**
 * Exports.
 *
 * @type {Chat}
 */
module.exports = Chat;
