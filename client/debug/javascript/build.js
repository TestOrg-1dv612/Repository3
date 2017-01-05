(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Module for Chat.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

"use strict";

const DesktopWindow = require("./DesktopWindow");
const storage = require("./localstorage");

/**
 * Creates an instance of a Chat.
 *
 * @constructor
 * @param {String} id - The id of the window.
 */
function Chat(id) {
    DesktopWindow.call(this, id);

    /**
     * The name of the user. "Unknown" by default.
     */
    this.user = "Unknown";

    /**
     * The web socket for the chat.
     */
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
 * Initiates the application.
 */
Chat.prototype.open = function() {
    let template = document.querySelector("#chat").content;
    let content = document.importNode(template, true);
    this.div.querySelector(".content").appendChild(content);

    let messageInput = this.div.querySelector(".chatMessage");
    let userInfo = this.div.querySelector(".user");
    this.getUser(userInfo);

    messageInput.addEventListener("keypress", (event) => {
        this.emojis(messageInput);

        if (event.keyCode === 13 || event.which === 13) {
            event.preventDefault();

            if (this.user !== "Unknown") {
                if (!messageInput.value || messageInput.value.trim() === "") {
                    this.message.textContent = "Write your message.";
                } else {
                    this.send(messageInput.value);
                    messageInput.value = "";
                    this.message.textContent = "";
                }
            } else {
                userInfo.firstElementChild.classList.add("redbg");
            }
        }
    });

    this.socket.addEventListener("message", (event) => {
        let data = JSON.parse(event.data);

        if (data.type === "message" || data.type === "notification") {
            this.receive(data);
        }
    });
};

/**
 * Gets the user for the chat application.
 *
 * @param {Element} div - The div holding the user information.
 */
Chat.prototype.getUser = function(div) {
    let input = div.firstElementChild;
    let button = div.lastElementChild;

    let removeUserElem = () => {
        div.removeChild(input);
        div.removeChild(button);
        div.classList.add("loggedIn");
        div.textContent = "Logged in as " + this.user;
    };

    let getUsername = () => {
        if (div.firstElementChild.value) {
            this.user = div.firstElementChild.value;
            input.classList.remove("redbg");
            input.value = "";
            removeUserElem();
            storage.set("username", this.user);
        }
    };

    if (!storage.get("username")) {
        div.lastElementChild.addEventListener("click", getUsername);
    } else {
        this.user = storage.get("username");
        removeUserElem();
    }

    this.dropdown.textContent = "Change user";
    this.dropdown.addEventListener("click", (event) => {
        event.preventDefault();
        div.textContent = "User: ";
        div.classList.remove("loggedIn");
        div.appendChild(input);
        div.appendChild(button);
        this.user = "Unknown";
        div.lastElementChild.addEventListener("click", getUsername);
    });
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
    let container = this.div.querySelector(".messageContainer");

    let user = document.createElement("p");
    user.setAttribute("class", "username");
    user.appendChild(document.createTextNode(data.username));
    let pElem = document.createElement("p");
    pElem.appendChild(document.createTextNode(data.data));

    container.appendChild(user);
    container.appendChild(pElem);

    container.scrollTop = container.scrollHeight - container.clientHeight;
};

/**
 * Replaces certain character combinations with emojis.
 *
 * @param element - The element containing the user input.
 */
Chat.prototype.emojis = function(element) {
    let emojis = {
        ":)": "\uD83D\uDE0A",
        ";)": "\uD83D\uDE09",
        ":D": "\uD83D\uDE03",
        ":P": "\uD83D\uDE1B",
        ";P": "\uD83D\uDE1C",
        ":/": "\uD83D\uDE15",
        ":(": "\uD83D\uDE1E",
        ":'(": "\uD83D\uDE22",
        "(y)": "\uD83D\uDC4D",
        "<3": "\u2764\uFE0F"
    };

    for (let i in emojis) {
        element.value = element.value.replace(i, emojis[i]);
    }
};

/**
 * Exports.
 *
 * @type {Chat}
 */
module.exports = Chat;

},{"./DesktopWindow":2,"./localstorage":7}],2:[function(require,module,exports){
/**
 * Module for DesktopWindow.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

"use strict";

/**
 * Creates a new instance of DesktopWindow.
 *
 * @constructor
 * @param {String} id - The id of the window to create.
 * @throws {Error} - Window must have an id.
 */
function DesktopWindow(id) {
    if (!id) {
        throw new Error("Window must have an id.");
    }

    /**
     * Gets DesktopWindow's top-name.
     *
     * @private
     * @type {Element}
     * @name DesktopWindow#name
     */
    Object.defineProperty(this, "name", {
        get: function() {
            return this.div.querySelector(".name");
        }
    });

    /**
     * Gets DesktopWindow's top-icon.
     *
     * @private
     * @type {Element}
     * @name DesktopWindow#icon
     */
    Object.defineProperty(this, "icon", {
        get: function() {
            return this.div.querySelector(".logo");
        }
    });

    /**
     * Gets DesktopWindow's footer message element.
     *
     * @private
     * @type {Element}
     * @name DesktopWindow#message
     */
    Object.defineProperty(this, "message", {
        get: function() {
            return this.div.querySelector(".window-footer");
        }
    });

    /**
     * Gets DesktopWindow's first dropdown link in the first submenu.
     *
     * @private
     * @type {Element}
     * @name DesktopWindow#dropdown
     */
    Object.defineProperty(this, "dropdown", {
        get: function() {
            return this.div.querySelectorAll(".dropdown a")[0];
        }
    });

    /**
     * Gets the wrapper div of the current DesktopWindow.
     *
     * @private
     * @type {Element}
     * @name DesktopWindow#div
     */
    Object.defineProperty(this, "div", {
        get: function() {
            return document.getElementById(this.id);
        }
    });

    /**
     * Gets DesktopWindow's id.
     *
     * @private
     * @type {String}
     * @name DesktopWindow#id
     * @throws {TypeError} - Must be a string.
     */
    Object.defineProperty(this, "id", {
        get: function() {
            if (typeof id !== "string") {
                throw new TypeError("Window id must be a string.");
            }

            return id;
        }
    });

    /**
     * Creates a new window.
     */
    this.create();
}

/**
 * Creates a new window from template.
 */
DesktopWindow.prototype.create = function() {
    let template = document.querySelector("#window");
    let windowDiv = document.importNode(template.content, true);
    document.querySelector("#desktop").appendChild(windowDiv);
    document.querySelector("#unclaimed").id = this.id;

    this.position();
    this.handleMovement();

    this.div.querySelector(".content").addEventListener("click", (event) => {
        if (this.div !== this.div.parentNode.lastElementChild) {
            this.div.parentNode.appendChild(this.div);
        }

        if (event.target === this.div.querySelector("textarea") ||
            event.target === this.div.querySelector("input")) {
            event.target.focus();
        }

        let container = this.div.querySelector(".messageContainer");
        if (container) {
            container.scrollTop = container.scrollHeight - container.clientHeight;
        }
    });
};

/**
 * Positions the window in the desktop, stacks if necessary.
 */
DesktopWindow.prototype.position = function() {
    let stackWindows = (app) => {
        let idNr;
        if (this.id.length === 2) {
            idNr = (this.id.indexOf("1") === -1) ? (this.id.charAt(1) - 1) : "";
        } else if (this.id.length > 2) {
            idNr = this.id.slice(1) - 1;
        }

        let elementBefore = document.getElementById(app + idNr);
        if (elementBefore && elementBefore.style.visibility !== "hidden") {
            this.div.style.top = (elementBefore.offsetTop + 35) + "px";
            this.div.style.left = (elementBefore.offsetLeft + 35) + "px";
        }
    };

    switch (this.id.slice(0, 1)) {
        case "c":
            stackWindows("c");
            break;
        case "m":
            this.div.style.left = (this.div.offsetLeft + 200) + "px";
            stackWindows("m");
            break;
        case "r":
            this.div.style.left = (this.div.offsetLeft + 400) + "px";
            stackWindows("r");
            break;
        case "i":
            this.div.style.left = (this.div.offsetLeft + 600) + "px";
            stackWindows("i");
            break;
    }
};

/**
 * Handles dragging movements of the window.
 */
DesktopWindow.prototype.handleMovement = function() {
    let posX = 0;
    let posY = 0;

    let scrollDown = () => {
        let container = this.div.querySelector(".messageContainer");
        if (container) {
            container.scrollTop = container.scrollHeight - container.clientHeight;
        }
    };

    let moveWindow = (event) => {
        this.div.style.left = (event.clientX - posX) + "px";
        this.div.style.top = (event.clientY - posY) + "px";
        scrollDown();
    };

    let getPosition = (event) => {
        event.preventDefault();

        if (event.target === this.div.querySelector(".close")) {
            this.close();
            return;
        } else if (event.target === this.div.querySelector(".minimize")) {
            this.minimize();
            return;
        }

        if (this.div !== this.div.parentNode.lastElementChild) {
            this.div.parentNode.appendChild(this.div);
        }

        posX = event.clientX - this.div.offsetLeft;
        posY = event.clientY - this.div.offsetTop;
        window.addEventListener("mousemove", moveWindow);
        scrollDown();
    };

    this.div.firstElementChild.addEventListener("mousedown", getPosition);

    window.addEventListener("mouseup", () => {
        window.removeEventListener("mousemove", moveWindow);
    });
};

/**
 * Minimizes window, or maximizes if clicked on the reference.
 */
DesktopWindow.prototype.minimize = function() {
    this.div.style.visibility = "hidden";

    let aTag = document.createElement("a");
    aTag.setAttribute("href", "#");

    let addWindow = (iconMenu, app) => {
        iconMenu.appendChild(aTag);
        iconMenu.classList.add("minimized");
        iconMenu.lastElementChild.textContent = app + " " + (this.id.slice(1));

        iconMenu.lastElementChild.addEventListener("click", (event) => {
            event.preventDefault();
            this.div.style.visibility = "visible";
            iconMenu.removeChild(event.target);

            if (!iconMenu.firstElementChild) {
                iconMenu.classList.remove("minimized");
            }
        });
    };

    let iconMenus = document.querySelectorAll("nav .icon-menu");
    switch (this.id.slice(0, 1)) {
        case "c":
            addWindow(iconMenus[0], "Chat");
            break;
        case "m":
            addWindow(iconMenus[1], "Memory");
            break;
        case "r":
            addWindow(iconMenus[2], "Remember");
            break;
        case "i":
            addWindow(iconMenus[3], "Info");
            break;
    }
};

/**
 * Closes the window.
 */
DesktopWindow.prototype.close = function() {
    this.div.parentNode.removeChild(this.div);

    if (this.socket) {
        this.socket.close();
    }
};

/**
 * Exports.
 *
 * @type {DesktopWindow}
 */
module.exports = DesktopWindow;

},{}],3:[function(require,module,exports){
/**
 * Module for Memory.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

"use strict";

const DesktopWindow = require("./DesktopWindow");

/**
 * Creates an instance of a Memory game.
 *
 * @constructor
 * @param {String} id - The id of the window.
 */
function Memory(id) {
    DesktopWindow.call(this, id);

    /**
     * The size of the board in number of bricks, defaults to 16.
     */
    this.size = 16;

    /**
     * The array to contain the brick images.
     */
    this.images = [];

    /**
     * The first turned brick.
     */
    this.turn1 = null;

    /**
     * The second turned brick.
     */
    this.turn2 = null;

    /**
     * The number of pairs.
     */
    this.pairs = 0;

    /**
     * The number of clicks/tries.
     */
    this.nrOfClicks = 0;

    /**
     * Starts the Memory game.
     */
    this.start();
}

/**
 * Handles inheritance from DesktopWindow.
 */
Memory.prototype = Object.create(DesktopWindow.prototype);
Memory.prototype.constructor = Memory;

/**
 * Starts the game and adds event listeners.
 */
Memory.prototype.start = function() {
    this.shuffle();
    this.setBoard();
    this.setMenu();

    this.dropdown.addEventListener("click", (event) => {
        event.preventDefault();
        this.restart();
    });

    let links = this.div.querySelectorAll(".menulink")[1].querySelectorAll(".dropdown a");
    links.forEach((current) => {
        current.addEventListener("click", (event) => {
            event.preventDefault();
            switch (event.target.textContent) {
                case "3x2":
                    this.size = 6;
                    break;
                case "4x3":
                    this.size = 12;
                    break;
                case "4x4":
                    this.size = 16;
                    break;
            }

            this.restart();
        });
    });
};

/**
 * Sets elements for the drop-down menu to allow changing size of the board.
 */
Memory.prototype.setMenu = function() {
    let element = this.div.querySelector(".menulink");
    let menuClone = element.cloneNode(true);
    element.parentNode.appendChild(menuClone);

    let newLink = this.div.querySelectorAll(".menulink")[1];
    newLink.firstElementChild.textContent = "Size";

    for (let i = 0; i < 2; i += 1) {
        let dropdownClone = newLink.querySelector(".dropdown a").cloneNode(true);
        newLink.lastElementChild.appendChild(dropdownClone);
    }

    let dropdownLinks = newLink.querySelectorAll(".dropdown a");
    dropdownLinks[0].textContent = "3x2";
    dropdownLinks[1].textContent = "4x3";
    dropdownLinks[2].textContent = "4x4";
};

/**
 * Sets the size of the board and the board elements.
 */
Memory.prototype.setBoard = function() {
    let templateDiv = document.querySelector("#memory").content;
    let div = document.importNode(templateDiv.firstElementChild, false);
    let resultElem = document.importNode(templateDiv.lastElementChild, true);

    switch (this.size) {
        case 6:
            div.classList.add("board6");
            break;
        case 12:
            div.classList.add("board12");
            break;
        case 16:
            div.classList.add("board16");
            break;
    }

    let a;
    this.images.forEach((image, index) => {
        a = document.importNode(templateDiv.firstElementChild.firstElementChild, true);
        a.firstElementChild.setAttribute("data-brickNr", index);
        div.appendChild(a);

    });

    div.addEventListener("click", (event) => {
        event.preventDefault();

        let img;
        if (event.target.tagName === "A") {
            if (event.target.firstElementChild) {
                img = event.target.firstElementChild;
            } else {
                return;
            }
        } else if (event.target.tagName === "IMG") {
            img = event.target;
        }

        if (img) {
            let i = parseInt(img.getAttribute("data-brickNr"));
            this.turnBrick(this.images[i], img);
        }
    });

    this.div.querySelector(".content").appendChild(div);
    this.div.querySelector(".content").appendChild(resultElem);
};

/**
 * Shuffles the array with images.
 */
Memory.prototype.shuffle = function() {
    this.images = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8];

    let indexToSwap;
    let tempImg;
    let imgs;

    switch (this.size) {
        case 6:
            imgs = this.images.slice(0, 6);
            break;
        case 12:
            imgs = this.images.slice(0, 12);
            break;
        default:
        case 16:
            imgs = this.images;
    }

    for (let i = this.size - 1; i > 0; i -= 1) {
        indexToSwap = Math.floor(Math.random() * i);
        tempImg = imgs[i];
        imgs[i] = imgs[indexToSwap];
        imgs[indexToSwap] = tempImg;
    }

    this.images = imgs;
};

/**
 * Handles the event of turning a brick.
 *
 * @param {Number} brickImg - The image of the turned brick.
 * @param {Element} imgElem - The element containing the brick.
 */
Memory.prototype.turnBrick = function(brickImg, imgElem) {
    if (this.turn2) {
        return;
    }

    imgElem.src = "/image/memory/" + brickImg + ".png";

    if (!this.turn1) {
        this.turn1 = imgElem;
    } else {
        if (imgElem === this.turn1) {
            return;
        }

        this.nrOfClicks += 1;
        this.div.querySelector(".tries").textContent = this.nrOfClicks.toString();

        this.turn2 = imgElem;
        if (this.turn1.src === this.turn2.src) {
            this.pairs += 1;
            this.div.querySelector(".pairs").textContent = this.pairs.toString();

            if (this.pairs === this.size / 2) {
                this.endGame();
            }

            setTimeout(() => {
                this.turn1.parentNode.classList.add("empty");
                this.turn2.parentNode.classList.add("empty");

                this.turn1 = null;
                this.turn2 = null;
            }, 400);
        } else {
            setTimeout(() => {
                this.turn1.src = "/image/memory/0.png";
                this.turn2.src = "/image/memory/0.png";

                this.turn1 = null;
                this.turn2 = null;
            }, 500);
        }
    }
};

/**
 * Ends the game and displays message.
 */
Memory.prototype.endGame = function() {
    let message = this.div.querySelector(".message");

    message.textContent = "You finished the game!";
};

/**
 * Restarts and clears the Memory game.
 */
Memory.prototype.restart = function() {
    let container = this.div.querySelector(".content");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    this.pairs = 0;
    this.nrOfClicks = 0;
    this.shuffle();
    this.setBoard();
};

/**
 * Exports.
 *
 * @type {Memory}
 */
module.exports = Memory;

},{"./DesktopWindow":2}],4:[function(require,module,exports){
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

    /**
     * The array to hold the notes.
     */
    this.notes = [];

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
 *
 * @param {Boolean} notFirst - Whether or not the created note is the first or not.
 */
Remember.prototype.new = function(notFirst) {
    if (notFirst) {
        let container = this.div.querySelector(".content");
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        this.notes = [];
    }

    let template = document.querySelector("#remember").content;
    let content = document.importNode(template, true);
    this.div.querySelector(".content").appendChild(content);

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
            this.save(true);
        }

        this.dropdown.textContent = "Save";
        this.dropdown.addEventListener("click", (event) => {
            event.preventDefault();
            if (this.div.querySelectorAll(".note p").length > 1) {
                this.save();
            } else {
                this.message.textContent = "Note is empty.";
            }
        });
    }
};

/**
 * Sets the different dropdown menus.
 */
Remember.prototype.setMenu = function() {
    let element = this.div.querySelector(".menulink");
    let menuClone = element.cloneNode(true);
    element.parentNode.appendChild(menuClone);

    let newLink = this.div.querySelectorAll(".menulink")[1];
    newLink.firstElementChild.textContent = "Notes";
    newLink.querySelector(".dropdown").removeChild(newLink.querySelector(".dropdown a"));

    for (let i = 0; i < 2; i += 1) {
        let dropdownClone = this.div.querySelectorAll(".menulink")[0].querySelector(".dropdown a").cloneNode(true);
        this.div.querySelectorAll(".menulink")[0].lastElementChild.appendChild(dropdownClone);
    }

    let dropdownLinks = this.div.querySelectorAll(".menulink")[0].querySelectorAll(".dropdown a");
    dropdownLinks[1].textContent = "New";
    dropdownLinks[2].textContent = "Delete All";

    dropdownLinks[1].addEventListener("click", (event) => {
        event.preventDefault();
        this.new(true);
    });

    dropdownLinks[2].addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("notes");

        let container = newLink.lastElementChild;
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

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
 * Saves current note to local storage or gets old notes.
 *
 * @param {Boolean} oldNotes - Whether or not there are old notes in local storage.
 */
Remember.prototype.save = function(oldNotes) {
    let newLink;
    let dropdownLink;

    let addMenuNote = () => {
        newLink = this.div.querySelectorAll(".menulink")[1];
        let dropdownClone = this.div.querySelectorAll(".menulink")[0].querySelector(".dropdown a").cloneNode(true);
        newLink.lastElementChild.appendChild(dropdownClone);

        dropdownLink = newLink.querySelector(".dropdown").lastElementChild;
        dropdownLink.textContent = "Note " + (newLink.querySelectorAll(".dropdown a").length);

        dropdownLink.addEventListener("click", (event) => {
            event.preventDefault();
            let nr = event.target.textContent.charAt(event.target.textContent.length - 1);
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

    let container = this.div.querySelector(".note");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    let template = document.querySelector("#remember").content;
    let content = document.importNode(template.firstElementChild.firstElementChild, true);
    container.appendChild(content);

    noteContent.forEach((current) => {
        let noteElem = this.div.querySelectorAll(".note p")[0].cloneNode(true);
        noteElem.textContent = current;
        container.appendChild(noteElem);
    });
};

/**
 * Exports.
 *
 * @type {Remember}
 */
module.exports = Remember;

},{"./DesktopWindow":2,"./localstorage":7}],5:[function(require,module,exports){
/**
 * Start of the application.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

const desktop = require("./desktop");

desktop.init();

},{"./desktop":6}],6:[function(require,module,exports){
/**
 * Module for desktop.
 */

"use strict";

const DesktopWindow = require("./DesktopWindow");
const Chat = require("./Chat");
const Memory = require("./Memory");
const Remember = require("./Remember");

/**
 * Gets the current time and presents it in the given container.
 *
 * @param {Element} container - The container of the clock.
 */
function desktopClock(container) {
    if (!container) {
        container = document.querySelector("#clock");
    }

    let today = new Date();
    let hours = today.getHours();
    let mins = today.getMinutes();

    if (mins < 10) {
        mins = "0" + mins;
    }

    if (hours < 10) {
        hours = "0" + hours;
    }

    container.textContent = hours + ":" + mins;
}

/**
 * Gets today's date and presents it in the given container.
 *
 * @param {Element} container - The container of the clock.
 */
function getDate(container) {
    let today = new Date();
    let month = ["jan", "feb", "mar", "apr", "may", "june", "july", "aug", "sept", "oct", "nov", "dec"];
    container.textContent = today.getDate() + " " + month[today.getMonth()] + " " + today.getFullYear();
}

/**
 * Gets the application information for info window.
 *
 * @param {Object} element - The element to display the information in.
 */
function info(element) {
    let template = document.querySelector("#info").content;
    let container = element.div.querySelector(".content");

    container.appendChild(document.importNode(template, true));
    let subMenu = element.div.querySelector(".menu");
    subMenu.parentNode.removeChild(subMenu);
}

/**
 * Initiates desktop by adding necessary event listeners to open windows and getting time and date.
 */
function init() {
    let newWindow;
    let numbers = [1, 1, 1, 1];
    document.querySelectorAll("nav .icons").forEach((current, index) => {
        switch (index){
            case 0:
                current.addEventListener("click", (event) => {
                    event.preventDefault();
                    newWindow = new Chat("c" + numbers[0]);
                    newWindow.name.textContent = "Chat";
                    newWindow.icon.src = "/image/chat.png";
                    numbers[0] += 1;
                });

                break;
            case 1:
                current.addEventListener("click", (event) => {
                    event.preventDefault();
                    newWindow = new Memory("m" + numbers[1]);
                    numbers[1] += 1;
                });

                break;
            case 2:
                current.addEventListener("click", (event) => {
                    event.preventDefault();
                    newWindow = new Remember("r" + numbers[2]);
                    newWindow.name.textContent = "Remember";
                    newWindow.icon.src = "/image/notes.png";
                    numbers[2] += 1;
                });

                break;
            case 3:
                current.addEventListener("click", (event) => {
                    event.preventDefault();
                    newWindow = new DesktopWindow("i" + numbers[3]);
                    newWindow.name.textContent = "Application info";
                    newWindow.icon.src = "/image/info.png";
                    info(newWindow);
                    numbers[3] += 1;
                });

                break;
        }
    });

    getDate(document.querySelector("#date"));
    desktopClock(document.querySelector("#clock"));
    setInterval(desktopClock, 5000);
}

/**
 * Exports.
 */
module.exports = {
    init: init,
    getClock: desktopClock,
    getDate: getDate,
    getInfo: info
};

},{"./Chat":1,"./DesktopWindow":2,"./Memory":3,"./Remember":4}],7:[function(require,module,exports){
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
        let notes = (get(itemName)) ? get(itemName).notes : [];
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

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZW1lbWJlci5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9sb2NhbHN0b3JhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBNb2R1bGUgZm9yIENoYXQuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcbmNvbnN0IHN0b3JhZ2UgPSByZXF1aXJlKFwiLi9sb2NhbHN0b3JhZ2VcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIENoYXQuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gQ2hhdChpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgdXNlci4gXCJVbmtub3duXCIgYnkgZGVmYXVsdC5cbiAgICAgKi9cbiAgICB0aGlzLnVzZXIgPSBcIlVua25vd25cIjtcblxuICAgIC8qKlxuICAgICAqIFRoZSB3ZWIgc29ja2V0IGZvciB0aGUgY2hhdC5cbiAgICAgKi9cbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiKTtcblxuICAgIHRoaXMub3BlbigpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5DaGF0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGVza3RvcFdpbmRvdy5wcm90b3R5cGUpO1xuQ2hhdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGF0O1xuXG4vKipcbiAqIEluaXRpYXRlcyB0aGUgYXBwbGljYXRpb24uXG4gKi9cbkNoYXQucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXRcIikuY29udGVudDtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUsIHRydWUpO1xuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuICAgIGxldCBtZXNzYWdlSW5wdXQgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNoYXRNZXNzYWdlXCIpO1xuICAgIGxldCB1c2VySW5mbyA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIudXNlclwiKTtcbiAgICB0aGlzLmdldFVzZXIodXNlckluZm8pO1xuXG4gICAgbWVzc2FnZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5lbW9qaXMobWVzc2FnZUlucHV0KTtcblxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMgfHwgZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy51c2VyICE9PSBcIlVua25vd25cIikge1xuICAgICAgICAgICAgICAgIGlmICghbWVzc2FnZUlucHV0LnZhbHVlIHx8IG1lc3NhZ2VJbnB1dC52YWx1ZS50cmltKCkgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJXcml0ZSB5b3VyIG1lc3NhZ2UuXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kKG1lc3NhZ2VJbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJbnB1dC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1c2VySW5mby5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuYWRkKFwicmVkYmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIChldmVudCkgPT4ge1xuICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG5cbiAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gXCJtZXNzYWdlXCIgfHwgZGF0YS50eXBlID09PSBcIm5vdGlmaWNhdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzLnJlY2VpdmUoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgdXNlciBmb3IgdGhlIGNoYXQgYXBwbGljYXRpb24uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBkaXYgLSBUaGUgZGl2IGhvbGRpbmcgdGhlIHVzZXIgaW5mb3JtYXRpb24uXG4gKi9cbkNoYXQucHJvdG90eXBlLmdldFVzZXIgPSBmdW5jdGlvbihkaXYpIHtcbiAgICBsZXQgaW5wdXQgPSBkaXYuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgbGV0IGJ1dHRvbiA9IGRpdi5sYXN0RWxlbWVudENoaWxkO1xuXG4gICAgbGV0IHJlbW92ZVVzZXJFbGVtID0gKCkgPT4ge1xuICAgICAgICBkaXYucmVtb3ZlQ2hpbGQoaW5wdXQpO1xuICAgICAgICBkaXYucmVtb3ZlQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJsb2dnZWRJblwiKTtcbiAgICAgICAgZGl2LnRleHRDb250ZW50ID0gXCJMb2dnZWQgaW4gYXMgXCIgKyB0aGlzLnVzZXI7XG4gICAgfTtcblxuICAgIGxldCBnZXRVc2VybmFtZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKGRpdi5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy51c2VyID0gZGl2LmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICAgICAgaW5wdXQuY2xhc3NMaXN0LnJlbW92ZShcInJlZGJnXCIpO1xuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgcmVtb3ZlVXNlckVsZW0oKTtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KFwidXNlcm5hbWVcIiwgdGhpcy51c2VyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoIXN0b3JhZ2UuZ2V0KFwidXNlcm5hbWVcIikpIHtcbiAgICAgICAgZGl2Lmxhc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldFVzZXJuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVzZXIgPSBzdG9yYWdlLmdldChcInVzZXJuYW1lXCIpO1xuICAgICAgICByZW1vdmVVc2VyRWxlbSgpO1xuICAgIH1cblxuICAgIHRoaXMuZHJvcGRvd24udGV4dENvbnRlbnQgPSBcIkNoYW5nZSB1c2VyXCI7XG4gICAgdGhpcy5kcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IFwiVXNlcjogXCI7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QucmVtb3ZlKFwibG9nZ2VkSW5cIik7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB0aGlzLnVzZXIgPSBcIlVua25vd25cIjtcbiAgICAgICAgZGl2Lmxhc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldFVzZXJuYW1lKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogU2VuZHMgdHlwZWQgaW4gbWVzc2FnZXMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IC0gVGhlIGlucHV0IG1lc3NhZ2UgZnJvbSB0aGUgdGV4dGFyZWEuXG4gKi9cbkNoYXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgZGF0YTogaW5wdXQsXG4gICAgICAgIHVzZXJuYW1lOiB0aGlzLnVzZXIsXG4gICAgICAgIGtleTogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xufTtcblxuLyoqXG4gKiBSZWNlaXZlcyBhbmQgZGlzcGxheXMgbWVzc2FnZXMgaW4gYXBwbGljYXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSBUaGUgcmVjZWl2ZWQgZGF0YS5cbiAqL1xuQ2hhdC5wcm90b3R5cGUucmVjZWl2ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlQ29udGFpbmVyXCIpO1xuXG4gICAgbGV0IHVzZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICB1c2VyLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwidXNlcm5hbWVcIik7XG4gICAgdXNlci5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhLnVzZXJuYW1lKSk7XG4gICAgbGV0IHBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgcEVsZW0uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YS5kYXRhKSk7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodXNlcik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHBFbGVtKTtcblxuICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gY29udGFpbmVyLmNsaWVudEhlaWdodDtcbn07XG5cbi8qKlxuICogUmVwbGFjZXMgY2VydGFpbiBjaGFyYWN0ZXIgY29tYmluYXRpb25zIHdpdGggZW1vamlzLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdXNlciBpbnB1dC5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuZW1vamlzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGxldCBlbW9qaXMgPSB7XG4gICAgICAgIFwiOilcIjogXCJcXHVEODNEXFx1REUwQVwiLFxuICAgICAgICBcIjspXCI6IFwiXFx1RDgzRFxcdURFMDlcIixcbiAgICAgICAgXCI6RFwiOiBcIlxcdUQ4M0RcXHVERTAzXCIsXG4gICAgICAgIFwiOlBcIjogXCJcXHVEODNEXFx1REUxQlwiLFxuICAgICAgICBcIjtQXCI6IFwiXFx1RDgzRFxcdURFMUNcIixcbiAgICAgICAgXCI6L1wiOiBcIlxcdUQ4M0RcXHVERTE1XCIsXG4gICAgICAgIFwiOihcIjogXCJcXHVEODNEXFx1REUxRVwiLFxuICAgICAgICBcIjonKFwiOiBcIlxcdUQ4M0RcXHVERTIyXCIsXG4gICAgICAgIFwiKHkpXCI6IFwiXFx1RDgzRFxcdURDNERcIixcbiAgICAgICAgXCI8M1wiOiBcIlxcdTI3NjRcXHVGRTBGXCJcbiAgICB9O1xuXG4gICAgZm9yIChsZXQgaSBpbiBlbW9qaXMpIHtcbiAgICAgICAgZWxlbWVudC52YWx1ZSA9IGVsZW1lbnQudmFsdWUucmVwbGFjZShpLCBlbW9qaXNbaV0pO1xuICAgIH1cbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7Q2hhdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIERlc2t0b3BXaW5kb3cuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgd2luZG93IHRvIGNyZWF0ZS5cbiAqIEB0aHJvd3Mge0Vycm9yfSAtIFdpbmRvdyBtdXN0IGhhdmUgYW4gaWQuXG4gKi9cbmZ1bmN0aW9uIERlc2t0b3BXaW5kb3coaWQpIHtcbiAgICBpZiAoIWlkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIldpbmRvdyBtdXN0IGhhdmUgYW4gaWQuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIHRvcC1uYW1lLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I25hbWVcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJuYW1lXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5hbWVcIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIHRvcC1pY29uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2ljb25cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpY29uXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmxvZ29cIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIGZvb3RlciBtZXNzYWdlIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjbWVzc2FnZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIm1lc3NhZ2VcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWZvb3RlclwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgZmlyc3QgZHJvcGRvd24gbGluayBpbiB0aGUgZmlyc3Qgc3VibWVudS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNkcm9wZG93blxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImRyb3Bkb3duXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIilbMF07XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHdyYXBwZXIgZGl2IG9mIHRoZSBjdXJyZW50IERlc2t0b3BXaW5kb3cuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjZGl2XG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZGl2XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgaWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNpZFxuICAgICAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gLSBNdXN0IGJlIGEgc3RyaW5nLlxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImlkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiV2luZG93IGlkIG11c3QgYmUgYSBzdHJpbmcuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgd2luZG93LlxuICAgICAqL1xuICAgIHRoaXMuY3JlYXRlKCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB3aW5kb3cgZnJvbSB0ZW1wbGF0ZS5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dcIik7XG4gICAgbGV0IHdpbmRvd0RpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZXNrdG9wXCIpLmFwcGVuZENoaWxkKHdpbmRvd0Rpdik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN1bmNsYWltZWRcIikuaWQgPSB0aGlzLmlkO1xuXG4gICAgdGhpcy5wb3NpdGlvbigpO1xuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQoKTtcblxuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmRpdiAhPT0gdGhpcy5kaXYucGFyZW50Tm9kZS5sYXN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgICAgICB0aGlzLmRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMuZGl2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCJ0ZXh0YXJlYVwiKSB8fFxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0ID09PSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIikpIHtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICAgICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFBvc2l0aW9ucyB0aGUgd2luZG93IGluIHRoZSBkZXNrdG9wLCBzdGFja3MgaWYgbmVjZXNzYXJ5LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBzdGFja1dpbmRvd3MgPSAoYXBwKSA9PiB7XG4gICAgICAgIGxldCBpZE5yO1xuICAgICAgICBpZiAodGhpcy5pZC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIGlkTnIgPSAodGhpcy5pZC5pbmRleE9mKFwiMVwiKSA9PT0gLTEpID8gKHRoaXMuaWQuY2hhckF0KDEpIC0gMSkgOiBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaWQubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgaWROciA9IHRoaXMuaWQuc2xpY2UoMSkgLSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVsZW1lbnRCZWZvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhcHAgKyBpZE5yKTtcbiAgICAgICAgaWYgKGVsZW1lbnRCZWZvcmUgJiYgZWxlbWVudEJlZm9yZS5zdHlsZS52aXNpYmlsaXR5ICE9PSBcImhpZGRlblwiKSB7XG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRUb3AgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gKGVsZW1lbnRCZWZvcmUub2Zmc2V0TGVmdCArIDM1KSArIFwicHhcIjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBzd2l0Y2ggKHRoaXMuaWQuc2xpY2UoMCwgMSkpIHtcbiAgICAgICAgY2FzZSBcImNcIjpcbiAgICAgICAgICAgIHN0YWNrV2luZG93cyhcImNcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm1cIjpcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAodGhpcy5kaXYub2Zmc2V0TGVmdCArIDIwMCkgKyBcInB4XCI7XG4gICAgICAgICAgICBzdGFja1dpbmRvd3MoXCJtXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJyXCI6XG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gKHRoaXMuZGl2Lm9mZnNldExlZnQgKyA0MDApICsgXCJweFwiO1xuICAgICAgICAgICAgc3RhY2tXaW5kb3dzKFwiclwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiaVwiOlxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9ICh0aGlzLmRpdi5vZmZzZXRMZWZ0ICsgNjAwKSArIFwicHhcIjtcbiAgICAgICAgICAgIHN0YWNrV2luZG93cyhcImlcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgZHJhZ2dpbmcgbW92ZW1lbnRzIG9mIHRoZSB3aW5kb3cuXG4gKi9cbkRlc2t0b3BXaW5kb3cucHJvdG90eXBlLmhhbmRsZU1vdmVtZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHBvc1ggPSAwO1xuICAgIGxldCBwb3NZID0gMDtcblxuICAgIGxldCBzY3JvbGxEb3duID0gKCkgPT4ge1xuICAgICAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlQ29udGFpbmVyXCIpO1xuICAgICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodCAtIGNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbGV0IG1vdmVXaW5kb3cgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IChldmVudC5jbGllbnRYIC0gcG9zWCkgKyBcInB4XCI7XG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCA9IChldmVudC5jbGllbnRZIC0gcG9zWSkgKyBcInB4XCI7XG4gICAgICAgIHNjcm9sbERvd24oKTtcbiAgICB9O1xuXG4gICAgbGV0IGdldFBvc2l0aW9uID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jbG9zZVwiKSkge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5taW5pbWl6ZVwiKSkge1xuICAgICAgICAgICAgdGhpcy5taW5pbWl6ZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZGl2ICE9PSB0aGlzLmRpdi5wYXJlbnROb2RlLmxhc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMuZGl2LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5kaXYpO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9zWCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLmRpdi5vZmZzZXRMZWZ0O1xuICAgICAgICBwb3NZID0gZXZlbnQuY2xpZW50WSAtIHRoaXMuZGl2Lm9mZnNldFRvcDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgICAgIHNjcm9sbERvd24oKTtcbiAgICB9O1xuXG4gICAgdGhpcy5kaXYuZmlyc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBnZXRQb3NpdGlvbik7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKCkgPT4ge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlV2luZG93KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogTWluaW1pemVzIHdpbmRvdywgb3IgbWF4aW1pemVzIGlmIGNsaWNrZWQgb24gdGhlIHJlZmVyZW5jZS5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUubWluaW1pemUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmRpdi5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcblxuICAgIGxldCBhVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgYVRhZy5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiI1wiKTtcblxuICAgIGxldCBhZGRXaW5kb3cgPSAoaWNvbk1lbnUsIGFwcCkgPT4ge1xuICAgICAgICBpY29uTWVudS5hcHBlbmRDaGlsZChhVGFnKTtcbiAgICAgICAgaWNvbk1lbnUuY2xhc3NMaXN0LmFkZChcIm1pbmltaXplZFwiKTtcbiAgICAgICAgaWNvbk1lbnUubGFzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IGFwcCArIFwiIFwiICsgKHRoaXMuaWQuc2xpY2UoMSkpO1xuXG4gICAgICAgIGljb25NZW51Lmxhc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgICAgIGljb25NZW51LnJlbW92ZUNoaWxkKGV2ZW50LnRhcmdldCk7XG5cbiAgICAgICAgICAgIGlmICghaWNvbk1lbnUuZmlyc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICBpY29uTWVudS5jbGFzc0xpc3QucmVtb3ZlKFwibWluaW1pemVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgbGV0IGljb25NZW51cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJuYXYgLmljb24tbWVudVwiKTtcbiAgICBzd2l0Y2ggKHRoaXMuaWQuc2xpY2UoMCwgMSkpIHtcbiAgICAgICAgY2FzZSBcImNcIjpcbiAgICAgICAgICAgIGFkZFdpbmRvdyhpY29uTWVudXNbMF0sIFwiQ2hhdFwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibVwiOlxuICAgICAgICAgICAgYWRkV2luZG93KGljb25NZW51c1sxXSwgXCJNZW1vcnlcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInJcIjpcbiAgICAgICAgICAgIGFkZFdpbmRvdyhpY29uTWVudXNbMl0sIFwiUmVtZW1iZXJcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImlcIjpcbiAgICAgICAgICAgIGFkZFdpbmRvdyhpY29uTWVudXNbM10sIFwiSW5mb1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbi8qKlxuICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gKi9cbkRlc2t0b3BXaW5kb3cucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5kaXYucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmRpdik7XG5cbiAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge0Rlc2t0b3BXaW5kb3d9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gRGVza3RvcFdpbmRvdztcbiIsIi8qKlxuICogTW9kdWxlIGZvciBNZW1vcnkuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgTWVtb3J5IGdhbWUuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gTWVtb3J5KGlkKSB7XG4gICAgRGVza3RvcFdpbmRvdy5jYWxsKHRoaXMsIGlkKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzaXplIG9mIHRoZSBib2FyZCBpbiBudW1iZXIgb2YgYnJpY2tzLCBkZWZhdWx0cyB0byAxNi5cbiAgICAgKi9cbiAgICB0aGlzLnNpemUgPSAxNjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBhcnJheSB0byBjb250YWluIHRoZSBicmljayBpbWFnZXMuXG4gICAgICovXG4gICAgdGhpcy5pbWFnZXMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBmaXJzdCB0dXJuZWQgYnJpY2suXG4gICAgICovXG4gICAgdGhpcy50dXJuMSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2Vjb25kIHR1cm5lZCBicmljay5cbiAgICAgKi9cbiAgICB0aGlzLnR1cm4yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgcGFpcnMuXG4gICAgICovXG4gICAgdGhpcy5wYWlycyA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIGNsaWNrcy90cmllcy5cbiAgICAgKi9cbiAgICB0aGlzLm5yT2ZDbGlja3MgPSAwO1xuXG4gICAgLyoqXG4gICAgICogU3RhcnRzIHRoZSBNZW1vcnkgZ2FtZS5cbiAgICAgKi9cbiAgICB0aGlzLnN0YXJ0KCk7XG59XG5cbi8qKlxuICogSGFuZGxlcyBpbmhlcml0YW5jZSBmcm9tIERlc2t0b3BXaW5kb3cuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlc2t0b3BXaW5kb3cucHJvdG90eXBlKTtcbk1lbW9yeS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW1vcnk7XG5cbi8qKlxuICogU3RhcnRzIHRoZSBnYW1lIGFuZCBhZGRzIGV2ZW50IGxpc3RlbmVycy5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2h1ZmZsZSgpO1xuICAgIHRoaXMuc2V0Qm9hcmQoKTtcbiAgICB0aGlzLnNldE1lbnUoKTtcblxuICAgIHRoaXMuZHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnJlc3RhcnQoKTtcbiAgICB9KTtcblxuICAgIGxldCBsaW5rcyA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMV0ucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpO1xuICAgIGxpbmtzLmZvckVhY2goKGN1cnJlbnQpID0+IHtcbiAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC50YXJnZXQudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiM3gyXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCI0eDNcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gMTI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCI0eDRcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gMTY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJlc3RhcnQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFNldHMgZWxlbWVudHMgZm9yIHRoZSBkcm9wLWRvd24gbWVudSB0byBhbGxvdyBjaGFuZ2luZyBzaXplIG9mIHRoZSBib2FyZC5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zZXRNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lbnVsaW5rXCIpO1xuICAgIGxldCBtZW51Q2xvbmUgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQobWVudUNsb25lKTtcblxuICAgIGxldCBuZXdMaW5rID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXTtcbiAgICBuZXdMaW5rLmZpcnN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gXCJTaXplXCI7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI7IGkgKz0gMSkge1xuICAgICAgICBsZXQgZHJvcGRvd25DbG9uZSA9IG5ld0xpbmsucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93biBhXCIpLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgbmV3TGluay5sYXN0RWxlbWVudENoaWxkLmFwcGVuZENoaWxkKGRyb3Bkb3duQ2xvbmUpO1xuICAgIH1cblxuICAgIGxldCBkcm9wZG93bkxpbmtzID0gbmV3TGluay5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIik7XG4gICAgZHJvcGRvd25MaW5rc1swXS50ZXh0Q29udGVudCA9IFwiM3gyXCI7XG4gICAgZHJvcGRvd25MaW5rc1sxXS50ZXh0Q29udGVudCA9IFwiNHgzXCI7XG4gICAgZHJvcGRvd25MaW5rc1syXS50ZXh0Q29udGVudCA9IFwiNHg0XCI7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHNpemUgb2YgdGhlIGJvYXJkIGFuZCB0aGUgYm9hcmQgZWxlbWVudHMuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc2V0Qm9hcmQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGVEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeVwiKS5jb250ZW50O1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLCBmYWxzZSk7XG4gICAgbGV0IHJlc3VsdEVsZW0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2Lmxhc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgc3dpdGNoICh0aGlzLnNpemUpIHtcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDZcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiYm9hcmQxMlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDE2XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbGV0IGE7XG4gICAgdGhpcy5pbWFnZXMuZm9yRWFjaCgoaW1hZ2UsIGluZGV4KSA9PiB7XG4gICAgICAgIGEgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgYS5maXJzdEVsZW1lbnRDaGlsZC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWJyaWNrTnJcIiwgaW5kZXgpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYSk7XG5cbiAgICB9KTtcblxuICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgbGV0IGltZztcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSBcIkFcIikge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICAgICAgICAgIGltZyA9IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSBcIklNR1wiKSB7XG4gICAgICAgICAgICBpbWcgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW1nKSB7XG4gICAgICAgICAgICBsZXQgaSA9IHBhcnNlSW50KGltZy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWJyaWNrTnJcIikpO1xuICAgICAgICAgICAgdGhpcy50dXJuQnJpY2sodGhpcy5pbWFnZXNbaV0sIGltZyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChyZXN1bHRFbGVtKTtcbn07XG5cbi8qKlxuICogU2h1ZmZsZXMgdGhlIGFycmF5IHdpdGggaW1hZ2VzLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnNodWZmbGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmltYWdlcyA9IFsxLDEsMiwyLDMsMyw0LDQsNSw1LDYsNiw3LDcsOCw4XTtcblxuICAgIGxldCBpbmRleFRvU3dhcDtcbiAgICBsZXQgdGVtcEltZztcbiAgICBsZXQgaW1ncztcblxuICAgIHN3aXRjaCAodGhpcy5zaXplKSB7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcy5zbGljZSgwLCA2KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgaW1ncyA9IHRoaXMuaW1hZ2VzLnNsaWNlKDAsIDEyKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgaW1ncyA9IHRoaXMuaW1hZ2VzO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSB0aGlzLnNpemUgLSAxOyBpID4gMDsgaSAtPSAxKSB7XG4gICAgICAgIGluZGV4VG9Td2FwID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSk7XG4gICAgICAgIHRlbXBJbWcgPSBpbWdzW2ldO1xuICAgICAgICBpbWdzW2ldID0gaW1nc1tpbmRleFRvU3dhcF07XG4gICAgICAgIGltZ3NbaW5kZXhUb1N3YXBdID0gdGVtcEltZztcbiAgICB9XG5cbiAgICB0aGlzLmltYWdlcyA9IGltZ3M7XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgdGhlIGV2ZW50IG9mIHR1cm5pbmcgYSBicmljay5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYnJpY2tJbWcgLSBUaGUgaW1hZ2Ugb2YgdGhlIHR1cm5lZCBicmljay5cbiAqIEBwYXJhbSB7RWxlbWVudH0gaW1nRWxlbSAtIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGJyaWNrLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnR1cm5CcmljayA9IGZ1bmN0aW9uKGJyaWNrSW1nLCBpbWdFbGVtKSB7XG4gICAgaWYgKHRoaXMudHVybjIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGltZ0VsZW0uc3JjID0gXCIvaW1hZ2UvbWVtb3J5L1wiICsgYnJpY2tJbWcgKyBcIi5wbmdcIjtcblxuICAgIGlmICghdGhpcy50dXJuMSkge1xuICAgICAgICB0aGlzLnR1cm4xID0gaW1nRWxlbTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaW1nRWxlbSA9PT0gdGhpcy50dXJuMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uck9mQ2xpY2tzICs9IDE7XG4gICAgICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIudHJpZXNcIikudGV4dENvbnRlbnQgPSB0aGlzLm5yT2ZDbGlja3MudG9TdHJpbmcoKTtcblxuICAgICAgICB0aGlzLnR1cm4yID0gaW1nRWxlbTtcbiAgICAgICAgaWYgKHRoaXMudHVybjEuc3JjID09PSB0aGlzLnR1cm4yLnNyYykge1xuICAgICAgICAgICAgdGhpcy5wYWlycyArPSAxO1xuICAgICAgICAgICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5wYWlyc1wiKS50ZXh0Q29udGVudCA9IHRoaXMucGFpcnMudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucGFpcnMgPT09IHRoaXMuc2l6ZSAvIDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZEdhbWUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJlbXB0eVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcImVtcHR5XCIpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMiA9IG51bGw7XG4gICAgICAgICAgICB9LCA0MDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMS5zcmMgPSBcIi9pbWFnZS9tZW1vcnkvMC5wbmdcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yLnNyYyA9IFwiL2ltYWdlL21lbW9yeS8wLnBuZ1wiO1xuXG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMiA9IG51bGw7XG4gICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBFbmRzIHRoZSBnYW1lIGFuZCBkaXNwbGF5cyBtZXNzYWdlLlxuICovXG5NZW1vcnkucHJvdG90eXBlLmVuZEdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbWVzc2FnZSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZVwiKTtcblxuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIllvdSBmaW5pc2hlZCB0aGUgZ2FtZSFcIjtcbn07XG5cbi8qKlxuICogUmVzdGFydHMgYW5kIGNsZWFycyB0aGUgTWVtb3J5IGdhbWUuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG4gICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgdGhpcy5wYWlycyA9IDA7XG4gICAgdGhpcy5uck9mQ2xpY2tzID0gMDtcbiAgICB0aGlzLnNodWZmbGUoKTtcbiAgICB0aGlzLnNldEJvYXJkKCk7XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge01lbW9yeX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnk7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgUmVtZW1iZXIgYXBwbGljYXRpb24uXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcbmNvbnN0IHN0b3JhZ2UgPSByZXF1aXJlKFwiLi9sb2NhbHN0b3JhZ2VcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBSZW1lbWJlci5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSBpZFxuICovXG5mdW5jdGlvbiBSZW1lbWJlcihpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXJyYXkgdG8gaG9sZCB0aGUgbm90ZXMuXG4gICAgICovXG4gICAgdGhpcy5ub3RlcyA9IFtdO1xuXG4gICAgdGhpcy5uZXcoKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNrdG9wV2luZG93LnByb3RvdHlwZSk7XG5SZW1lbWJlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZW1lbWJlcjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG5vdGUuXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBub3RGaXJzdCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjcmVhdGVkIG5vdGUgaXMgdGhlIGZpcnN0IG9yIG5vdC5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLm5ldyA9IGZ1bmN0aW9uKG5vdEZpcnN0KSB7XG4gICAgaWYgKG5vdEZpcnN0KSB7XG4gICAgICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG4gICAgICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubm90ZXMgPSBbXTtcbiAgICB9XG5cbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JlbWVtYmVyXCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLCB0cnVlKTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICBsZXQgaW5wdXQgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5vdGUtaW5wdXRcIik7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcImJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBpZiAoIWlucHV0LnZhbHVlKSB7XG4gICAgICAgICAgICBpbnB1dC5jbGFzc0xpc3QuYWRkKFwicmVkYmdcIik7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIllvdSBuZWVkIHRvIHdyaXRlIGFuIGl0ZW0gZm9yIHRoZSBsaXN0LlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5wdXQuY2xhc3NMaXN0LnJlbW92ZShcInJlZGJnXCIpO1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICAgICAgICAgIHRoaXMuYWRkKGlucHV0LnZhbHVlKTtcbiAgICAgICAgICAgIGlucHV0LnZhbHVlID0gXCJcIjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCFub3RGaXJzdCkge1xuICAgICAgICB0aGlzLnNldE1lbnUoKTtcbiAgICAgICAgaWYgKHN0b3JhZ2UuZ2V0KFwibm90ZXNcIikgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZSh0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJvcGRvd24udGV4dENvbnRlbnQgPSBcIlNhdmVcIjtcbiAgICAgICAgdGhpcy5kcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubm90ZSBwXCIpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJOb3RlIGlzIGVtcHR5LlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIGRpZmZlcmVudCBkcm9wZG93biBtZW51cy5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLnNldE1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVudWxpbmtcIik7XG4gICAgbGV0IG1lbnVDbG9uZSA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIGVsZW1lbnQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChtZW51Q2xvbmUpO1xuXG4gICAgbGV0IG5ld0xpbmsgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzFdO1xuICAgIG5ld0xpbmsuZmlyc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBcIk5vdGVzXCI7XG4gICAgbmV3TGluay5xdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duXCIpLnJlbW92ZUNoaWxkKG5ld0xpbmsucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93biBhXCIpKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjsgaSArPSAxKSB7XG4gICAgICAgIGxldCBkcm9wZG93bkNsb25lID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVswXS5xdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duIGFcIikuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzBdLmxhc3RFbGVtZW50Q2hpbGQuYXBwZW5kQ2hpbGQoZHJvcGRvd25DbG9uZSk7XG4gICAgfVxuXG4gICAgbGV0IGRyb3Bkb3duTGlua3MgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKTtcbiAgICBkcm9wZG93bkxpbmtzWzFdLnRleHRDb250ZW50ID0gXCJOZXdcIjtcbiAgICBkcm9wZG93bkxpbmtzWzJdLnRleHRDb250ZW50ID0gXCJEZWxldGUgQWxsXCI7XG5cbiAgICBkcm9wZG93bkxpbmtzWzFdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5uZXcodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBkcm9wZG93bkxpbmtzWzJdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJub3Rlc1wiKTtcblxuICAgICAgICBsZXQgY29udGFpbmVyID0gbmV3TGluay5sYXN0RWxlbWVudENoaWxkO1xuICAgICAgICB3aGlsZSAoY29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5ldyh0cnVlKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQWRkcyBpbnB1dCB0byB0aGUgbm90ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgLSBVc2VyIGlucHV0IGZyb20gZWxlbWVudC5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgbGV0IG5vdGVFbGVtID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5ub3RlIHBcIilbMF0uY2xvbmVOb2RlKHRydWUpO1xuICAgIG5vdGVFbGVtLnRleHRDb250ZW50ID0gaW5wdXQ7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5ub3RlXCIpLmFwcGVuZENoaWxkKG5vdGVFbGVtKTtcblxuICAgIHRoaXMubm90ZXMucHVzaChpbnB1dCk7XG59O1xuXG4vKipcbiAqIFNhdmVzIGN1cnJlbnQgbm90ZSB0byBsb2NhbCBzdG9yYWdlIG9yIGdldHMgb2xkIG5vdGVzLlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb2xkTm90ZXMgLSBXaGV0aGVyIG9yIG5vdCB0aGVyZSBhcmUgb2xkIG5vdGVzIGluIGxvY2FsIHN0b3JhZ2UuXG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24ob2xkTm90ZXMpIHtcbiAgICBsZXQgbmV3TGluaztcbiAgICBsZXQgZHJvcGRvd25MaW5rO1xuXG4gICAgbGV0IGFkZE1lbnVOb3RlID0gKCkgPT4ge1xuICAgICAgICBuZXdMaW5rID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXTtcbiAgICAgICAgbGV0IGRyb3Bkb3duQ2xvbmUgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzBdLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd24gYVwiKS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5ld0xpbmsubGFzdEVsZW1lbnRDaGlsZC5hcHBlbmRDaGlsZChkcm9wZG93bkNsb25lKTtcblxuICAgICAgICBkcm9wZG93bkxpbmsgPSBuZXdMaW5rLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd25cIikubGFzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgZHJvcGRvd25MaW5rLnRleHRDb250ZW50ID0gXCJOb3RlIFwiICsgKG5ld0xpbmsucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpLmxlbmd0aCk7XG5cbiAgICAgICAgZHJvcGRvd25MaW5rLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsZXQgbnIgPSBldmVudC50YXJnZXQudGV4dENvbnRlbnQuY2hhckF0KGV2ZW50LnRhcmdldC50ZXh0Q29udGVudC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0KG5yKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGxldCBub3RlcyA9IChzdG9yYWdlLmdldChcIm5vdGVzXCIpID09PSBudWxsKSA/IDAgOiBzdG9yYWdlLmdldChcIm5vdGVzXCIpLm5vdGVzO1xuICAgIGlmIChvbGROb3Rlcykge1xuICAgICAgICBub3Rlcy5mb3JFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGFkZE1lbnVOb3RlKCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChub3RlcyA9PT0gMCB8fCBub3Rlcy5sZW5ndGggPD0gNCkge1xuICAgICAgICAgICAgc3RvcmFnZS5zZXQoXCJub3Rlc1wiLCB0aGlzLm5vdGVzKTtcbiAgICAgICAgICAgIGFkZE1lbnVOb3RlKCk7XG4gICAgICAgICAgICB0aGlzLm5ldyh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiWW91IGFscmVhZHkgaGF2ZSA1IHNhdmVkIG5vdGVzLlwiO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBpdGVtIHRoYXQgd2FzIGNsaWNrZWQgb24gZnJvbSBsaXN0LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuciAtIFRoZSBudW1iZXIgb2YgdGhlIGNsaWNrZWQgaXRlbSBpbiBsb2NhbCBzdG9yYWdlIGFycmF5LlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obnIpIHtcbiAgICBsZXQgbm90ZXMgPSBzdG9yYWdlLmdldChcIm5vdGVzXCIpLm5vdGVzO1xuICAgIGxldCBub3RlQ29udGVudCA9IG5vdGVzWyhuciAtIDEpXTtcblxuICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5vdGVcIik7XG4gICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZW1lbWJlclwiKS5jb250ZW50O1xuICAgIGxldCBjb250ZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5maXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuXG4gICAgbm90ZUNvbnRlbnQuZm9yRWFjaCgoY3VycmVudCkgPT4ge1xuICAgICAgICBsZXQgbm90ZUVsZW0gPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm5vdGUgcFwiKVswXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5vdGVFbGVtLnRleHRDb250ZW50ID0gY3VycmVudDtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vdGVFbGVtKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7UmVtZW1iZXJ9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gUmVtZW1iZXI7XG4iLCIvKipcbiAqIFN0YXJ0IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuY29uc3QgZGVza3RvcCA9IHJlcXVpcmUoXCIuL2Rlc2t0b3BcIik7XG5cbmRlc2t0b3AuaW5pdCgpO1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIGRlc2t0b3AuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERlc2t0b3BXaW5kb3cgPSByZXF1aXJlKFwiLi9EZXNrdG9wV2luZG93XCIpO1xuY29uc3QgQ2hhdCA9IHJlcXVpcmUoXCIuL0NoYXRcIik7XG5jb25zdCBNZW1vcnkgPSByZXF1aXJlKFwiLi9NZW1vcnlcIik7XG5jb25zdCBSZW1lbWJlciA9IHJlcXVpcmUoXCIuL1JlbWVtYmVyXCIpO1xuXG4vKipcbiAqIEdldHMgdGhlIGN1cnJlbnQgdGltZSBhbmQgcHJlc2VudHMgaXQgaW4gdGhlIGdpdmVuIGNvbnRhaW5lci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciAtIFRoZSBjb250YWluZXIgb2YgdGhlIGNsb2NrLlxuICovXG5mdW5jdGlvbiBkZXNrdG9wQ2xvY2soY29udGFpbmVyKSB7XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjbG9ja1wiKTtcbiAgICB9XG5cbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBob3VycyA9IHRvZGF5LmdldEhvdXJzKCk7XG4gICAgbGV0IG1pbnMgPSB0b2RheS5nZXRNaW51dGVzKCk7XG5cbiAgICBpZiAobWlucyA8IDEwKSB7XG4gICAgICAgIG1pbnMgPSBcIjBcIiArIG1pbnM7XG4gICAgfVxuXG4gICAgaWYgKGhvdXJzIDwgMTApIHtcbiAgICAgICAgaG91cnMgPSBcIjBcIiArIGhvdXJzO1xuICAgIH1cblxuICAgIGNvbnRhaW5lci50ZXh0Q29udGVudCA9IGhvdXJzICsgXCI6XCIgKyBtaW5zO1xufVxuXG4vKipcbiAqIEdldHMgdG9kYXkncyBkYXRlIGFuZCBwcmVzZW50cyBpdCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIC0gVGhlIGNvbnRhaW5lciBvZiB0aGUgY2xvY2suXG4gKi9cbmZ1bmN0aW9uIGdldERhdGUoY29udGFpbmVyKSB7XG4gICAgbGV0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBsZXQgbW9udGggPSBbXCJqYW5cIiwgXCJmZWJcIiwgXCJtYXJcIiwgXCJhcHJcIiwgXCJtYXlcIiwgXCJqdW5lXCIsIFwianVseVwiLCBcImF1Z1wiLCBcInNlcHRcIiwgXCJvY3RcIiwgXCJub3ZcIiwgXCJkZWNcIl07XG4gICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gdG9kYXkuZ2V0RGF0ZSgpICsgXCIgXCIgKyBtb250aFt0b2RheS5nZXRNb250aCgpXSArIFwiIFwiICsgdG9kYXkuZ2V0RnVsbFllYXIoKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBhcHBsaWNhdGlvbiBpbmZvcm1hdGlvbiBmb3IgaW5mbyB3aW5kb3cuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBUaGUgZWxlbWVudCB0byBkaXNwbGF5IHRoZSBpbmZvcm1hdGlvbiBpbi5cbiAqL1xuZnVuY3Rpb24gaW5mbyhlbGVtZW50KSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNpbmZvXCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRhaW5lciA9IGVsZW1lbnQuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLCB0cnVlKSk7XG4gICAgbGV0IHN1Yk1lbnUgPSBlbGVtZW50LmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lbnVcIik7XG4gICAgc3ViTWVudS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN1Yk1lbnUpO1xufVxuXG4vKipcbiAqIEluaXRpYXRlcyBkZXNrdG9wIGJ5IGFkZGluZyBuZWNlc3NhcnkgZXZlbnQgbGlzdGVuZXJzIHRvIG9wZW4gd2luZG93cyBhbmQgZ2V0dGluZyB0aW1lIGFuZCBkYXRlLlxuICovXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIGxldCBuZXdXaW5kb3c7XG4gICAgbGV0IG51bWJlcnMgPSBbMSwgMSwgMSwgMV07XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIm5hdiAuaWNvbnNcIikuZm9yRWFjaCgoY3VycmVudCwgaW5kZXgpID0+IHtcbiAgICAgICAgc3dpdGNoIChpbmRleCl7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBDaGF0KFwiY1wiICsgbnVtYmVyc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5uYW1lLnRleHRDb250ZW50ID0gXCJDaGF0XCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL2NoYXQucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIG51bWJlcnNbMF0gKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgTWVtb3J5KFwibVwiICsgbnVtYmVyc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgIG51bWJlcnNbMV0gKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgUmVtZW1iZXIoXCJyXCIgKyBudW1iZXJzWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lm5hbWUudGV4dENvbnRlbnQgPSBcIlJlbWVtYmVyXCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL25vdGVzLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICBudW1iZXJzWzJdICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IERlc2t0b3BXaW5kb3coXCJpXCIgKyBudW1iZXJzWzNdKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lm5hbWUudGV4dENvbnRlbnQgPSBcIkFwcGxpY2F0aW9uIGluZm9cIjtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lmljb24uc3JjID0gXCIvaW1hZ2UvaW5mby5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgaW5mbyhuZXdXaW5kb3cpO1xuICAgICAgICAgICAgICAgICAgICBudW1iZXJzWzNdICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZ2V0RGF0ZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RhdGVcIikpO1xuICAgIGRlc2t0b3BDbG9jayhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Nsb2NrXCIpKTtcbiAgICBzZXRJbnRlcnZhbChkZXNrdG9wQ2xvY2ssIDUwMDApO1xufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgZ2V0Q2xvY2s6IGRlc2t0b3BDbG9jayxcbiAgICBnZXREYXRlOiBnZXREYXRlLFxuICAgIGdldEluZm86IGluZm9cbn07XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgaGFuZGxpbmcgbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogR2V0cyBhbiBpdGVtIGZyb20gbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpdGVtIHRvIGdldC5cbiAqIEByZXR1cm5zIGl0ZW0gLSBUaGUgcmVxdWVzdGVkIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZ2V0KG5hbWUpIHtcbiAgICBpZiAobmFtZSA9PT0gXCJub3Rlc1wiKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKG5hbWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFNldHMgYW4gaXRlbSBpbiBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpdGVtTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpdGVtIHRvIHNldC5cbiAqIEBwYXJhbSBpdGVtIC0gVGhlIGl0ZW0uXG4gKi9cbmZ1bmN0aW9uIHNldChpdGVtTmFtZSwgaXRlbSkge1xuICAgIGlmIChpdGVtTmFtZSA9PT0gXCJub3Rlc1wiKSB7XG4gICAgICAgIGxldCBub3RlcyA9IChnZXQoaXRlbU5hbWUpKSA/IGdldChpdGVtTmFtZSkubm90ZXMgOiBbXTtcbiAgICAgICAgbm90ZXMucHVzaChpdGVtKTtcblxuICAgICAgICBsZXQgYWxsTm90ZXMgPSB7XG4gICAgICAgICAgICBub3Rlczogbm90ZXNcbiAgICAgICAgfTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShpdGVtTmFtZSwgSlNPTi5zdHJpbmdpZnkoYWxsTm90ZXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShpdGVtTmFtZSwgaXRlbSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0OiBzZXQsXG4gICAgZ2V0OiBnZXRcbn07XG4iXX0=
