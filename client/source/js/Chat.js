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
    this.socket = new WebSocket("ws://vhost3.lnu.se:20080/socket/");
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

    let messageInput = document.getElementById(this.id).querySelector(".chatMessage");
    let userMessage = document.getElementById(this.id).querySelector(".user");

    if (this.user === null) {
        userMessage.lastElementChild.addEventListener("click", function() {
            if (userMessage.firstElementChild.value) {
                this.user = userMessage.firstElementChild.value;
                userMessage.removeChild(userMessage.firstElementChild);
                userMessage.removeChild(userMessage.lastElementChild);
                userMessage.classList.add("loggedIn");
                userMessage.textContent = "Logged in as " + this.user;

            }
        });
    }

    messageInput.addEventListener("keypress", function(event) {
        if (event.keyCode === 13 || event.which === 13) {
            event.preventDefault();
            this.send(messageInput.value);
            messageInput.value = "";
        }
    }.bind(this));

    this.socket.addEventListener("message", function(event) {
        let data = JSON.parse(event.data);
        console.log(data);

        if (data.type === "message" || data.type === "notification") {
            this.receive(data);
        }
    }.bind(this));

};

/**
 * Sends typed in messages.
 *
 * @param {String} input - The input message from the textarea.
 */
Chat.prototype.send = function(input) {
    let message = {
        type: "message",
        data: input,
        username: this.user,
        key: "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
    };

    this.socket.send(JSON.stringify(message));
};

/**
 * Receives and displays messages in application.
 *
 * @param {Object} data - The received data.
 */
Chat.prototype.receive = function(data) {
    let container = document.getElementById(this.id).querySelector(".messageContainer");

    let user = document.createElement("p");
    user.setAttribute("class", "username");
    user.appendChild(document.createTextNode(data.username));
    let pElem = document.createElement("p");
    pElem.appendChild(document.createTextNode(data.data));

    container.appendChild(user);
    container.appendChild(pElem);
};

/**
 * Exports.
 *
 * @type {Chat}
 */
module.exports = Chat;
