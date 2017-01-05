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

    /**
     * Opens up a new chat.
     */
    this.open();
}

/**
 * Handles inheritance from DesktopWindow.
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

    let messageInput = this.div.querySelector(".messageInput");
    let userInfo = this.div.querySelector(".user");
    this.getUser(userInfo);

    messageInput.addEventListener("keypress", (event) => {
        this.emojis(messageInput);

        if (event.keyCode === 13 || event.which === 13) {
            event.preventDefault();

            if (this.user !== "Unknown") {
                if (!messageInput.value.trim()) {
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
    let messageDiv = document.importNode(document.querySelector("#chatMessage").content, true);
    container.appendChild(messageDiv);

    container.lastElementChild.firstElementChild.textContent = data.username;
    container.lastElementChild.lastElementChild.textContent = data.data;

    if (container.children.length > 70) {
        container.removeChild(container.firstElementChild);
    }

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
            if ((elementBefore.offsetTop + 35) > (window.innerHeight - 50)) {
                this.div.style.left = (elementBefore.offsetLeft - 300) + "px";
            } else {
                this.div.style.top = (elementBefore.offsetTop + 35) + "px";
                this.div.style.left = (elementBefore.offsetLeft + 35) + "px";
            }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZW1lbWJlci5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9sb2NhbHN0b3JhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIE1vZHVsZSBmb3IgQ2hhdC5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERlc2t0b3BXaW5kb3cgPSByZXF1aXJlKFwiLi9EZXNrdG9wV2luZG93XCIpO1xuY29uc3Qgc3RvcmFnZSA9IHJlcXVpcmUoXCIuL2xvY2Fsc3RvcmFnZVwiKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgQ2hhdC5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgd2luZG93LlxuICovXG5mdW5jdGlvbiBDaGF0KGlkKSB7XG4gICAgRGVza3RvcFdpbmRvdy5jYWxsKHRoaXMsIGlkKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSB1c2VyLiBcIlVua25vd25cIiBieSBkZWZhdWx0LlxuICAgICAqL1xuICAgIHRoaXMudXNlciA9IFwiVW5rbm93blwiO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHdlYiBzb2NrZXQgZm9yIHRoZSBjaGF0LlxuICAgICAqL1xuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIpO1xuXG4gICAgLyoqXG4gICAgICogT3BlbnMgdXAgYSBuZXcgY2hhdC5cbiAgICAgKi9cbiAgICB0aGlzLm9wZW4oKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqL1xuQ2hhdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlc2t0b3BXaW5kb3cucHJvdG90eXBlKTtcbkNoYXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2hhdDtcblxuLyoqXG4gKiBJbml0aWF0ZXMgdGhlIGFwcGxpY2F0aW9uLlxuICovXG5DaGF0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLCB0cnVlKTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICBsZXQgbWVzc2FnZUlucHV0ID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlSW5wdXRcIik7XG4gICAgbGV0IHVzZXJJbmZvID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi51c2VyXCIpO1xuICAgIHRoaXMuZ2V0VXNlcih1c2VySW5mbyk7XG5cbiAgICBtZXNzYWdlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLmVtb2ppcyhtZXNzYWdlSW5wdXQpO1xuXG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMyB8fCBldmVudC53aGljaCA9PT0gMTMpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnVzZXIgIT09IFwiVW5rbm93blwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtZXNzYWdlSW5wdXQudmFsdWUudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiV3JpdGUgeW91ciBtZXNzYWdlLlwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZChtZXNzYWdlSW5wdXQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlSW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdXNlckluZm8uZmlyc3RFbGVtZW50Q2hpbGQuY2xhc3NMaXN0LmFkZChcInJlZGJnXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgIGlmIChkYXRhLnR5cGUgPT09IFwibWVzc2FnZVwiIHx8IGRhdGEudHlwZSA9PT0gXCJub3RpZmljYXRpb25cIikge1xuICAgICAgICAgICAgdGhpcy5yZWNlaXZlKGRhdGEpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHVzZXIgZm9yIHRoZSBjaGF0IGFwcGxpY2F0aW9uLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZGl2IC0gVGhlIGRpdiBob2xkaW5nIHRoZSB1c2VyIGluZm9ybWF0aW9uLlxuICovXG5DaGF0LnByb3RvdHlwZS5nZXRVc2VyID0gZnVuY3Rpb24oZGl2KSB7XG4gICAgbGV0IGlucHV0ID0gZGl2LmZpcnN0RWxlbWVudENoaWxkO1xuICAgIGxldCBidXR0b24gPSBkaXYubGFzdEVsZW1lbnRDaGlsZDtcblxuICAgIGxldCByZW1vdmVVc2VyRWxlbSA9ICgpID0+IHtcbiAgICAgICAgZGl2LnJlbW92ZUNoaWxkKGlucHV0KTtcbiAgICAgICAgZGl2LnJlbW92ZUNoaWxkKGJ1dHRvbik7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwibG9nZ2VkSW5cIik7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IFwiTG9nZ2VkIGluIGFzIFwiICsgdGhpcy51c2VyO1xuICAgIH07XG5cbiAgICBsZXQgZ2V0VXNlcm5hbWUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChkaXYuZmlyc3RFbGVtZW50Q2hpbGQudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IGRpdi5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcbiAgICAgICAgICAgIGlucHV0LmNsYXNzTGlzdC5yZW1vdmUoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIHJlbW92ZVVzZXJFbGVtKCk7XG4gICAgICAgICAgICBzdG9yYWdlLnNldChcInVzZXJuYW1lXCIsIHRoaXMudXNlcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCFzdG9yYWdlLmdldChcInVzZXJuYW1lXCIpKSB7XG4gICAgICAgIGRpdi5sYXN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXRVc2VybmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51c2VyID0gc3RvcmFnZS5nZXQoXCJ1c2VybmFtZVwiKTtcbiAgICAgICAgcmVtb3ZlVXNlckVsZW0oKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyb3Bkb3duLnRleHRDb250ZW50ID0gXCJDaGFuZ2UgdXNlclwiO1xuICAgIHRoaXMuZHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkaXYudGV4dENvbnRlbnQgPSBcIlVzZXI6IFwiO1xuICAgICAgICBkaXYuY2xhc3NMaXN0LnJlbW92ZShcImxvZ2dlZEluXCIpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgdGhpcy51c2VyID0gXCJVbmtub3duXCI7XG4gICAgICAgIGRpdi5sYXN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXRVc2VybmFtZSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFNlbmRzIHR5cGVkIGluIG1lc3NhZ2VzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCAtIFRoZSBpbnB1dCBtZXNzYWdlIGZyb20gdGhlIHRleHRhcmVhLlxuICovXG5DaGF0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICBsZXQgbWVzc2FnZSA9IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGRhdGE6IGlucHV0LFxuICAgICAgICB1c2VybmFtZTogdGhpcy51c2VyLFxuICAgICAgICBrZXk6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIlxuICAgIH07XG5cbiAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbn07XG5cbi8qKlxuICogUmVjZWl2ZXMgYW5kIGRpc3BsYXlzIG1lc3NhZ2VzIGluIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gVGhlIHJlY2VpdmVkIGRhdGEuXG4gKi9cbkNoYXQucHJvdG90eXBlLnJlY2VpdmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICBsZXQgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0TWVzc2FnZVwiKS5jb250ZW50LCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobWVzc2FnZURpdik7XG5cbiAgICBjb250YWluZXIubGFzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IGRhdGEudXNlcm5hbWU7XG4gICAgY29udGFpbmVyLmxhc3RFbGVtZW50Q2hpbGQubGFzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IGRhdGEuZGF0YTtcblxuICAgIGlmIChjb250YWluZXIuY2hpbGRyZW4ubGVuZ3RoID4gNzApIHtcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZCk7XG4gICAgfVxuXG4gICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xufTtcblxuLyoqXG4gKiBSZXBsYWNlcyBjZXJ0YWluIGNoYXJhY3RlciBjb21iaW5hdGlvbnMgd2l0aCBlbW9qaXMuXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgLSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSB1c2VyIGlucHV0LlxuICovXG5DaGF0LnByb3RvdHlwZS5lbW9qaXMgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgbGV0IGVtb2ppcyA9IHtcbiAgICAgICAgXCI6KVwiOiBcIlxcdUQ4M0RcXHVERTBBXCIsXG4gICAgICAgIFwiOylcIjogXCJcXHVEODNEXFx1REUwOVwiLFxuICAgICAgICBcIjpEXCI6IFwiXFx1RDgzRFxcdURFMDNcIixcbiAgICAgICAgXCI6UFwiOiBcIlxcdUQ4M0RcXHVERTFCXCIsXG4gICAgICAgIFwiO1BcIjogXCJcXHVEODNEXFx1REUxQ1wiLFxuICAgICAgICBcIjovXCI6IFwiXFx1RDgzRFxcdURFMTVcIixcbiAgICAgICAgXCI6KFwiOiBcIlxcdUQ4M0RcXHVERTFFXCIsXG4gICAgICAgIFwiOicoXCI6IFwiXFx1RDgzRFxcdURFMjJcIixcbiAgICAgICAgXCIoeSlcIjogXCJcXHVEODNEXFx1REM0RFwiLFxuICAgICAgICBcIjwzXCI6IFwiXFx1Mjc2NFxcdUZFMEZcIlxuICAgIH07XG5cbiAgICBmb3IgKGxldCBpIGluIGVtb2ppcykge1xuICAgICAgICBlbGVtZW50LnZhbHVlID0gZWxlbWVudC52YWx1ZS5yZXBsYWNlKGksIGVtb2ppc1tpXSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtDaGF0fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEZXNrdG9wV2luZG93LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cgdG8gY3JlYXRlLlxuICogQHRocm93cyB7RXJyb3J9IC0gV2luZG93IG11c3QgaGF2ZSBhbiBpZC5cbiAqL1xuZnVuY3Rpb24gRGVza3RvcFdpbmRvdyhpZCkge1xuICAgIGlmICghaWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2luZG93IG11c3QgaGF2ZSBhbiBpZC5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgdG9wLW5hbWUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjbmFtZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIm5hbWVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubmFtZVwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgdG9wLWljb24uXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjaWNvblxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImljb25cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubG9nb1wiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgZm9vdGVyIG1lc3NhZ2UgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNtZXNzYWdlXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwibWVzc2FnZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctZm9vdGVyXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIERlc2t0b3BXaW5kb3cncyBmaXJzdCBkcm9wZG93biBsaW5rIGluIHRoZSBmaXJzdCBzdWJtZW51LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2Ryb3Bkb3duXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZHJvcGRvd25cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKVswXTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgd3JhcHBlciBkaXYgb2YgdGhlIGN1cnJlbnQgRGVza3RvcFdpbmRvdy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNkaXZcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJkaXZcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIERlc2t0b3BXaW5kb3cncyBpZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2lkXG4gICAgICogQHRocm93cyB7VHlwZUVycm9yfSAtIE11c3QgYmUgYSBzdHJpbmcuXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiaWRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJXaW5kb3cgaWQgbXVzdCBiZSBhIHN0cmluZy5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyB3aW5kb3cuXG4gICAgICovXG4gICAgdGhpcy5jcmVhdGUoKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHdpbmRvdyBmcm9tIHRlbXBsYXRlLlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvd1wiKTtcbiAgICBsZXQgd2luZG93RGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Rlc2t0b3BcIikuYXBwZW5kQ2hpbGQod2luZG93RGl2KTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3VuY2xhaW1lZFwiKS5pZCA9IHRoaXMuaWQ7XG5cbiAgICB0aGlzLnBvc2l0aW9uKCk7XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudCgpO1xuXG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZGl2ICE9PSB0aGlzLmRpdi5wYXJlbnROb2RlLmxhc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMuZGl2LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5kaXYpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcInRleHRhcmVhXCIpIHx8XG4gICAgICAgICAgICBldmVudC50YXJnZXQgPT09IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFwiKSkge1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmZvY3VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlQ29udGFpbmVyXCIpO1xuICAgICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodCAtIGNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogUG9zaXRpb25zIHRoZSB3aW5kb3cgaW4gdGhlIGRlc2t0b3AsIHN0YWNrcyBpZiBuZWNlc3NhcnkuXG4gKi9cbkRlc2t0b3BXaW5kb3cucHJvdG90eXBlLnBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHN0YWNrV2luZG93cyA9IChhcHApID0+IHtcbiAgICAgICAgbGV0IGlkTnI7XG4gICAgICAgIGlmICh0aGlzLmlkLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgaWROciA9ICh0aGlzLmlkLmluZGV4T2YoXCIxXCIpID09PSAtMSkgPyAodGhpcy5pZC5jaGFyQXQoMSkgLSAxKSA6IFwiXCI7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pZC5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICBpZE5yID0gdGhpcy5pZC5zbGljZSgxKSAtIDE7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZWxlbWVudEJlZm9yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFwcCArIGlkTnIpO1xuICAgICAgICBpZiAoZWxlbWVudEJlZm9yZSAmJiBlbGVtZW50QmVmb3JlLnN0eWxlLnZpc2liaWxpdHkgIT09IFwiaGlkZGVuXCIpIHtcbiAgICAgICAgICAgIGlmICgoZWxlbWVudEJlZm9yZS5vZmZzZXRUb3AgKyAzNSkgPiAod2luZG93LmlubmVySGVpZ2h0IC0gNTApKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IChlbGVtZW50QmVmb3JlLm9mZnNldExlZnQgLSAzMDApICsgXCJweFwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRUb3AgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IChlbGVtZW50QmVmb3JlLm9mZnNldExlZnQgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgc3dpdGNoICh0aGlzLmlkLnNsaWNlKDAsIDEpKSB7XG4gICAgICAgIGNhc2UgXCJjXCI6XG4gICAgICAgICAgICBzdGFja1dpbmRvd3MoXCJjXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJtXCI6XG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gKHRoaXMuZGl2Lm9mZnNldExlZnQgKyAyMDApICsgXCJweFwiO1xuICAgICAgICAgICAgc3RhY2tXaW5kb3dzKFwibVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiclwiOlxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9ICh0aGlzLmRpdi5vZmZzZXRMZWZ0ICsgNDAwKSArIFwicHhcIjtcbiAgICAgICAgICAgIHN0YWNrV2luZG93cyhcInJcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImlcIjpcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAodGhpcy5kaXYub2Zmc2V0TGVmdCArIDYwMCkgKyBcInB4XCI7XG4gICAgICAgICAgICBzdGFja1dpbmRvd3MoXCJpXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGRyYWdnaW5nIG1vdmVtZW50cyBvZiB0aGUgd2luZG93LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5oYW5kbGVNb3ZlbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBwb3NYID0gMDtcbiAgICBsZXQgcG9zWSA9IDA7XG5cbiAgICBsZXQgc2Nyb2xsRG93biA9ICgpID0+IHtcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICAgICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGxldCBtb3ZlV2luZG93ID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAoZXZlbnQuY2xpZW50WCAtIHBvc1gpICsgXCJweFwiO1xuICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSAoZXZlbnQuY2xpZW50WSAtIHBvc1kpICsgXCJweFwiO1xuICAgICAgICBzY3JvbGxEb3duKCk7XG4gICAgfTtcblxuICAgIGxldCBnZXRQb3NpdGlvbiA9IChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VcIikpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWluaW1pemVcIikpIHtcbiAgICAgICAgICAgIHRoaXMubWluaW1pemUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmRpdiAhPT0gdGhpcy5kaXYucGFyZW50Tm9kZS5sYXN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgICAgICB0aGlzLmRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMuZGl2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc1ggPSBldmVudC5jbGllbnRYIC0gdGhpcy5kaXYub2Zmc2V0TGVmdDtcbiAgICAgICAgcG9zWSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmRpdi5vZmZzZXRUb3A7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVXaW5kb3cpO1xuICAgICAgICBzY3JvbGxEb3duKCk7XG4gICAgfTtcblxuICAgIHRoaXMuZGl2LmZpcnN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZ2V0UG9zaXRpb24pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsICgpID0+IHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIE1pbmltaXplcyB3aW5kb3csIG9yIG1heGltaXplcyBpZiBjbGlja2VkIG9uIHRoZSByZWZlcmVuY2UuXG4gKi9cbkRlc2t0b3BXaW5kb3cucHJvdG90eXBlLm1pbmltaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5kaXYuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG5cbiAgICBsZXQgYVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGFUYWcuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcIiNcIik7XG5cbiAgICBsZXQgYWRkV2luZG93ID0gKGljb25NZW51LCBhcHApID0+IHtcbiAgICAgICAgaWNvbk1lbnUuYXBwZW5kQ2hpbGQoYVRhZyk7XG4gICAgICAgIGljb25NZW51LmNsYXNzTGlzdC5hZGQoXCJtaW5pbWl6ZWRcIik7XG4gICAgICAgIGljb25NZW51Lmxhc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBhcHAgKyBcIiBcIiArICh0aGlzLmlkLnNsaWNlKDEpKTtcblxuICAgICAgICBpY29uTWVudS5sYXN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgICBpY29uTWVudS5yZW1vdmVDaGlsZChldmVudC50YXJnZXQpO1xuXG4gICAgICAgICAgICBpZiAoIWljb25NZW51LmZpcnN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgICAgICAgICAgaWNvbk1lbnUuY2xhc3NMaXN0LnJlbW92ZShcIm1pbmltaXplZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGxldCBpY29uTWVudXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwibmF2IC5pY29uLW1lbnVcIik7XG4gICAgc3dpdGNoICh0aGlzLmlkLnNsaWNlKDAsIDEpKSB7XG4gICAgICAgIGNhc2UgXCJjXCI6XG4gICAgICAgICAgICBhZGRXaW5kb3coaWNvbk1lbnVzWzBdLCBcIkNoYXRcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm1cIjpcbiAgICAgICAgICAgIGFkZFdpbmRvdyhpY29uTWVudXNbMV0sIFwiTWVtb3J5XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJyXCI6XG4gICAgICAgICAgICBhZGRXaW5kb3coaWNvbk1lbnVzWzJdLCBcIlJlbWVtYmVyXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJpXCI6XG4gICAgICAgICAgICBhZGRXaW5kb3coaWNvbk1lbnVzWzNdLCBcIkluZm9cIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG4vKipcbiAqIENsb3NlcyB0aGUgd2luZG93LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZGl2LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5kaXYpO1xuXG4gICAgaWYgKHRoaXMuc29ja2V0KSB7XG4gICAgICAgIHRoaXMuc29ja2V0LmNsb3NlKCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IERlc2t0b3BXaW5kb3c7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgTWVtb3J5LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIE1lbW9yeSBnYW1lLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKi9cbmZ1bmN0aW9uIE1lbW9yeShpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2l6ZSBvZiB0aGUgYm9hcmQgaW4gbnVtYmVyIG9mIGJyaWNrcywgZGVmYXVsdHMgdG8gMTYuXG4gICAgICovXG4gICAgdGhpcy5zaXplID0gMTY7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXJyYXkgdG8gY29udGFpbiB0aGUgYnJpY2sgaW1hZ2VzLlxuICAgICAqL1xuICAgIHRoaXMuaW1hZ2VzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZmlyc3QgdHVybmVkIGJyaWNrLlxuICAgICAqL1xuICAgIHRoaXMudHVybjEgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNlY29uZCB0dXJuZWQgYnJpY2suXG4gICAgICovXG4gICAgdGhpcy50dXJuMiA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIHBhaXJzLlxuICAgICAqL1xuICAgIHRoaXMucGFpcnMgPSAwO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBjbGlja3MvdHJpZXMuXG4gICAgICovXG4gICAgdGhpcy5uck9mQ2xpY2tzID0gMDtcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyB0aGUgTWVtb3J5IGdhbWUuXG4gICAgICovXG4gICAgdGhpcy5zdGFydCgpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICovXG5NZW1vcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNrdG9wV2luZG93LnByb3RvdHlwZSk7XG5NZW1vcnkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVtb3J5O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgZ2FtZSBhbmQgYWRkcyBldmVudCBsaXN0ZW5lcnMuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNodWZmbGUoKTtcbiAgICB0aGlzLnNldEJvYXJkKCk7XG4gICAgdGhpcy5zZXRNZW51KCk7XG5cbiAgICB0aGlzLmRyb3Bkb3duLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5yZXN0YXJ0KCk7XG4gICAgfSk7XG5cbiAgICBsZXQgbGlua3MgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzFdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKTtcbiAgICBsaW5rcy5mb3JFYWNoKChjdXJyZW50KSA9PiB7XG4gICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQudGFyZ2V0LnRleHRDb250ZW50KSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIjN4MlwiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSA2O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiNHgzXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDEyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiNHg0XCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDE2O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yZXN0YXJ0KCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBTZXRzIGVsZW1lbnRzIGZvciB0aGUgZHJvcC1kb3duIG1lbnUgdG8gYWxsb3cgY2hhbmdpbmcgc2l6ZSBvZiB0aGUgYm9hcmQuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc2V0TWVudSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBlbGVtZW50ID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZW51bGlua1wiKTtcbiAgICBsZXQgbWVudUNsb25lID0gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgZWxlbWVudC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKG1lbnVDbG9uZSk7XG5cbiAgICBsZXQgbmV3TGluayA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMV07XG4gICAgbmV3TGluay5maXJzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IFwiU2l6ZVwiO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyOyBpICs9IDEpIHtcbiAgICAgICAgbGV0IGRyb3Bkb3duQ2xvbmUgPSBuZXdMaW5rLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd24gYVwiKS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5ld0xpbmsubGFzdEVsZW1lbnRDaGlsZC5hcHBlbmRDaGlsZChkcm9wZG93bkNsb25lKTtcbiAgICB9XG5cbiAgICBsZXQgZHJvcGRvd25MaW5rcyA9IG5ld0xpbmsucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpO1xuICAgIGRyb3Bkb3duTGlua3NbMF0udGV4dENvbnRlbnQgPSBcIjN4MlwiO1xuICAgIGRyb3Bkb3duTGlua3NbMV0udGV4dENvbnRlbnQgPSBcIjR4M1wiO1xuICAgIGRyb3Bkb3duTGlua3NbMl0udGV4dENvbnRlbnQgPSBcIjR4NFwiO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBzaXplIG9mIHRoZSBib2FyZCBhbmQgdGhlIGJvYXJkIGVsZW1lbnRzLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnNldEJvYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlcIikuY29udGVudDtcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZCwgZmFsc2UpO1xuICAgIGxldCByZXN1bHRFbGVtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5sYXN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAodGhpcy5zaXplKSB7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiYm9hcmQ2XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImJvYXJkMTJcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiYm9hcmQxNlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCBhO1xuICAgIHRoaXMuaW1hZ2VzLmZvckVhY2goKGltYWdlLCBpbmRleCkgPT4ge1xuICAgICAgICBhID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuc2V0QXR0cmlidXRlKFwiZGF0YS1icmlja05yXCIsIGluZGV4KTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGEpO1xuXG4gICAgfSk7XG5cbiAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGxldCBpbWc7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQudGFnTmFtZSA9PT0gXCJBXCIpIHtcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICBpbWcgPSBldmVudC50YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQudGFnTmFtZSA9PT0gXCJJTUdcIikge1xuICAgICAgICAgICAgaW1nID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGltZykge1xuICAgICAgICAgICAgbGV0IGkgPSBwYXJzZUludChpbWcuZ2V0QXR0cmlidXRlKFwiZGF0YS1icmlja05yXCIpKTtcbiAgICAgICAgICAgIHRoaXMudHVybkJyaWNrKHRoaXMuaW1hZ2VzW2ldLCBpbWcpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQocmVzdWx0RWxlbSk7XG59O1xuXG4vKipcbiAqIFNodWZmbGVzIHRoZSBhcnJheSB3aXRoIGltYWdlcy5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zaHVmZmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pbWFnZXMgPSBbMSwxLDIsMiwzLDMsNCw0LDUsNSw2LDYsNyw3LDgsOF07XG5cbiAgICBsZXQgaW5kZXhUb1N3YXA7XG4gICAgbGV0IHRlbXBJbWc7XG4gICAgbGV0IGltZ3M7XG5cbiAgICBzd2l0Y2ggKHRoaXMuc2l6ZSkge1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBpbWdzID0gdGhpcy5pbWFnZXMuc2xpY2UoMCwgNik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcy5zbGljZSgwLCAxMik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcztcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gdGhpcy5zaXplIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICBpbmRleFRvU3dhcCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpO1xuICAgICAgICB0ZW1wSW1nID0gaW1nc1tpXTtcbiAgICAgICAgaW1nc1tpXSA9IGltZ3NbaW5kZXhUb1N3YXBdO1xuICAgICAgICBpbWdzW2luZGV4VG9Td2FwXSA9IHRlbXBJbWc7XG4gICAgfVxuXG4gICAgdGhpcy5pbWFnZXMgPSBpbWdzO1xufTtcblxuLyoqXG4gKiBIYW5kbGVzIHRoZSBldmVudCBvZiB0dXJuaW5nIGEgYnJpY2suXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGJyaWNrSW1nIC0gVGhlIGltYWdlIG9mIHRoZSB0dXJuZWQgYnJpY2suXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGltZ0VsZW0gLSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBicmljay5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS50dXJuQnJpY2sgPSBmdW5jdGlvbihicmlja0ltZywgaW1nRWxlbSkge1xuICAgIGlmICh0aGlzLnR1cm4yKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpbWdFbGVtLnNyYyA9IFwiL2ltYWdlL21lbW9yeS9cIiArIGJyaWNrSW1nICsgXCIucG5nXCI7XG5cbiAgICBpZiAoIXRoaXMudHVybjEpIHtcbiAgICAgICAgdGhpcy50dXJuMSA9IGltZ0VsZW07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGltZ0VsZW0gPT09IHRoaXMudHVybjEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubnJPZkNsaWNrcyArPSAxO1xuICAgICAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLnRyaWVzXCIpLnRleHRDb250ZW50ID0gdGhpcy5uck9mQ2xpY2tzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgdGhpcy50dXJuMiA9IGltZ0VsZW07XG4gICAgICAgIGlmICh0aGlzLnR1cm4xLnNyYyA9PT0gdGhpcy50dXJuMi5zcmMpIHtcbiAgICAgICAgICAgIHRoaXMucGFpcnMgKz0gMTtcbiAgICAgICAgICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIucGFpcnNcIikudGV4dENvbnRlbnQgPSB0aGlzLnBhaXJzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhaXJzID09PSB0aGlzLnNpemUgLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmRHYW1lKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjEucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwiZW1wdHlcIik7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMi5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJlbXB0eVwiKTtcblxuICAgICAgICAgICAgICAgIHRoaXMudHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIgPSBudWxsO1xuICAgICAgICAgICAgfSwgNDAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjEuc3JjID0gXCIvaW1hZ2UvbWVtb3J5LzAucG5nXCI7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMi5zcmMgPSBcIi9pbWFnZS9tZW1vcnkvMC5wbmdcIjtcblxuICAgICAgICAgICAgICAgIHRoaXMudHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIgPSBudWxsO1xuICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRW5kcyB0aGUgZ2FtZSBhbmQgZGlzcGxheXMgbWVzc2FnZS5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5lbmRHYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IG1lc3NhZ2UgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VcIik7XG5cbiAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gXCJZb3UgZmluaXNoZWQgdGhlIGdhbWUhXCI7XG59O1xuXG4vKipcbiAqIFJlc3RhcnRzIGFuZCBjbGVhcnMgdGhlIE1lbW9yeSBnYW1lLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHRoaXMucGFpcnMgPSAwO1xuICAgIHRoaXMubnJPZkNsaWNrcyA9IDA7XG4gICAgdGhpcy5zaHVmZmxlKCk7XG4gICAgdGhpcy5zZXRCb2FyZCgpO1xufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtNZW1vcnl9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIFJlbWVtYmVyIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5jb25zdCBzdG9yYWdlID0gcmVxdWlyZShcIi4vbG9jYWxzdG9yYWdlXCIpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgUmVtZW1iZXIuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gUmVtZW1iZXIoaWQpIHtcbiAgICBEZXNrdG9wV2luZG93LmNhbGwodGhpcywgaWQpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGFycmF5IHRvIGhvbGQgdGhlIG5vdGVzLlxuICAgICAqL1xuICAgIHRoaXMubm90ZXMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgbm90ZS5cbiAgICAgKi9cbiAgICB0aGlzLm5ldygpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlc2t0b3BXaW5kb3cucHJvdG90eXBlKTtcblJlbWVtYmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlbWVtYmVyO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbm90ZS5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG5vdEZpcnN0IC0gV2hldGhlciBvciBub3QgdGhlIGNyZWF0ZWQgbm90ZSBpcyB0aGUgZmlyc3Qgb2YgYWxsIG9yIG5vdC5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLm5ldyA9IGZ1bmN0aW9uKG5vdEZpcnN0KSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcbiAgICBpZiAobm90Rmlyc3QpIHtcbiAgICAgICAgdGhpcy5jbGVhcihjb250YWluZXIpO1xuICAgICAgICB0aGlzLm5vdGVzID0gW107XG4gICAgfVxuXG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZW1lbWJlclwiKS5jb250ZW50O1xuICAgIGxldCBjb250ZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZSwgdHJ1ZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuXG4gICAgbGV0IGlucHV0ID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5ub3RlLWlucHV0XCIpO1xuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgaWYgKCFpbnB1dC52YWx1ZSkge1xuICAgICAgICAgICAgaW5wdXQuY2xhc3NMaXN0LmFkZChcInJlZGJnXCIpO1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJZb3UgbmVlZCB0byB3cml0ZSBhbiBpdGVtIGZvciB0aGUgbGlzdC5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0LmNsYXNzTGlzdC5yZW1vdmUoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgICAgICAgICB0aGlzLmFkZChpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICBpbnB1dC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICghbm90Rmlyc3QpIHtcbiAgICAgICAgdGhpcy5zZXRNZW51KCk7XG4gICAgICAgIGlmIChzdG9yYWdlLmdldChcIm5vdGVzXCIpICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmVkKHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcm9wZG93bi50ZXh0Q29udGVudCA9IFwiU2F2ZVwiO1xuICAgICAgICB0aGlzLmRyb3Bkb3duLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5ub3RlIHBcIikubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZWQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJOb3RlIGlzIGVtcHR5LlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIGRpZmZlcmVudCBkcm9wZG93biBtZW51cyBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUuc2V0TWVudSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBzdWJNZW51ID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVswXTtcbiAgICBsZXQgbWVudUNsb25lID0gc3ViTWVudS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgc3ViTWVudS5wYXJlbnROb2RlLmFwcGVuZENoaWxkKG1lbnVDbG9uZSk7XG5cbiAgICBsZXQgbmV3U3ViTWVudSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMV07XG4gICAgbGV0IG5vdGVMaXN0ID0gbmV3U3ViTWVudS5sYXN0RWxlbWVudENoaWxkO1xuICAgIG5ld1N1Yk1lbnUuZmlyc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBcIk5vdGVzXCI7XG4gICAgbm90ZUxpc3QucmVtb3ZlQ2hpbGQobmV3U3ViTWVudS5xdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duIGFcIikpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyOyBpICs9IDEpIHtcbiAgICAgICAgbGV0IGRyb3Bkb3duQ2xvbmUgPSBzdWJNZW51LnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd24gYVwiKS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHN1Yk1lbnUubGFzdEVsZW1lbnRDaGlsZC5hcHBlbmRDaGlsZChkcm9wZG93bkNsb25lKTtcbiAgICB9XG5cbiAgICBsZXQgZHJvcGRvd25MaW5rcyA9IHN1Yk1lbnUucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpO1xuICAgIGRyb3Bkb3duTGlua3NbMV0udGV4dENvbnRlbnQgPSBcIk5ld1wiO1xuICAgIGRyb3Bkb3duTGlua3NbMl0udGV4dENvbnRlbnQgPSBcIkRlbGV0ZSBBbGxcIjtcblxuICAgIGRyb3Bkb3duTGlua3NbMV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLm5ldyh0cnVlKTtcbiAgICB9KTtcblxuICAgIGRyb3Bkb3duTGlua3NbMl0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcIm5vdGVzXCIpO1xuICAgICAgICB0aGlzLmNsZWFyKG5vdGVMaXN0KTtcbiAgICAgICAgdGhpcy5uZXcodHJ1ZSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEFkZHMgaW5wdXQgdG8gdGhlIG5vdGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IC0gVXNlciBpbnB1dCBmcm9tIGVsZW1lbnQuXG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgIGxldCBub3RlRWxlbSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubm90ZSBwXCIpWzBdLmNsb25lTm9kZSh0cnVlKTtcbiAgICBub3RlRWxlbS50ZXh0Q29udGVudCA9IGlucHV0O1xuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubm90ZVwiKS5hcHBlbmRDaGlsZChub3RlRWxlbSk7XG5cbiAgICB0aGlzLm5vdGVzLnB1c2goaW5wdXQpO1xufTtcblxuLyoqXG4gKiBTYXZlcyBjdXJyZW50IG5vdGUgdG8gbG9jYWwgc3RvcmFnZSBhbmQgYWRkcyB0byBzdWJtZW51LCBvciBnZXRzIG9sZCBub3Rlcy5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9sZE5vdGVzIC0gV2hldGhlciBvciBub3QgdGhlcmUgYXJlIG9sZCBub3RlcyBpbiBsb2NhbCBzdG9yYWdlLlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUuc2F2ZWQgPSBmdW5jdGlvbihvbGROb3Rlcykge1xuICAgIGxldCBuZXdTdWJNZW51O1xuICAgIGxldCBkcm9wZG93bkxpbms7XG5cbiAgICBsZXQgYWRkTWVudU5vdGUgPSAoKSA9PiB7XG4gICAgICAgIG5ld1N1Yk1lbnUgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzFdO1xuICAgICAgICBsZXQgZHJvcGRvd25DbG9uZSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMF0ucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93biBhXCIpLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgbmV3U3ViTWVudS5sYXN0RWxlbWVudENoaWxkLmFwcGVuZENoaWxkKGRyb3Bkb3duQ2xvbmUpO1xuXG4gICAgICAgIGRyb3Bkb3duTGluayA9IG5ld1N1Yk1lbnUucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93blwiKS5sYXN0RWxlbWVudENoaWxkO1xuICAgICAgICBkcm9wZG93bkxpbmsudGV4dENvbnRlbnQgPSBcIk5vdGUgXCIgKyAobmV3U3ViTWVudS5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIikubGVuZ3RoKTtcblxuICAgICAgICBkcm9wZG93bkxpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGxldCBuciA9IGV2ZW50LnRhcmdldC50ZXh0Q29udGVudC5zbGljZSg1KTtcbiAgICAgICAgICAgIHRoaXMuZ2V0KG5yKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGxldCBub3RlcyA9IChzdG9yYWdlLmdldChcIm5vdGVzXCIpID09PSBudWxsKSA/IDAgOiBzdG9yYWdlLmdldChcIm5vdGVzXCIpLm5vdGVzO1xuICAgIGlmIChvbGROb3Rlcykge1xuICAgICAgICBub3Rlcy5mb3JFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGFkZE1lbnVOb3RlKCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChub3RlcyA9PT0gMCB8fCBub3Rlcy5sZW5ndGggPD0gNCkge1xuICAgICAgICAgICAgc3RvcmFnZS5zZXQoXCJub3Rlc1wiLCB0aGlzLm5vdGVzKTtcbiAgICAgICAgICAgIGFkZE1lbnVOb3RlKCk7XG4gICAgICAgICAgICB0aGlzLm5ldyh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiWW91IGFscmVhZHkgaGF2ZSA1IHNhdmVkIG5vdGVzLlwiO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBpdGVtIHRoYXQgd2FzIGNsaWNrZWQgb24gZnJvbSBsaXN0LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuciAtIFRoZSBudW1iZXIgb2YgdGhlIGNsaWNrZWQgaXRlbSBpbiBsb2NhbCBzdG9yYWdlIGFycmF5LlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obnIpIHtcbiAgICBsZXQgbm90ZXMgPSBzdG9yYWdlLmdldChcIm5vdGVzXCIpLm5vdGVzO1xuICAgIGxldCBub3RlQ29udGVudCA9IG5vdGVzWyhuciAtIDEpXTtcblxuICAgIHRoaXMuY2xlYXIodGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5ub3RlXCIpKTtcblxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVtZW1iZXJcIikuY29udGVudDtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuZmlyc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubm90ZVwiKS5hcHBlbmRDaGlsZChjb250ZW50KTtcbiAgICB0aGlzLm5vdGVzID0gbm90ZUNvbnRlbnQ7XG5cbiAgICBub3RlQ29udGVudC5mb3JFYWNoKChjdXJyZW50KSA9PiB7XG4gICAgICAgIGxldCBub3RlRWxlbSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubm90ZSBwXCIpWzBdLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgbm90ZUVsZW0udGV4dENvbnRlbnQgPSBjdXJyZW50O1xuICAgICAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5vdGVcIikuYXBwZW5kQ2hpbGQobm90ZUVsZW0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBDbGVhcnMgdGhlIGdpdmVuIGNvbnRhaW5lciBvZiBpdHMgY29udGVudC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciAtIFRoZSBjb250YWluZXIgdG8gYmUgY2xlYXJlZC5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtSZW1lbWJlcn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBSZW1lbWJlcjtcbiIsIi8qKlxuICogU3RhcnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5jb25zdCBkZXNrdG9wID0gcmVxdWlyZShcIi4vZGVza3RvcFwiKTtcblxuZGVza3RvcC5pbml0KCk7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgZGVza3RvcC5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5jb25zdCBDaGF0ID0gcmVxdWlyZShcIi4vQ2hhdFwiKTtcbmNvbnN0IE1lbW9yeSA9IHJlcXVpcmUoXCIuL01lbW9yeVwiKTtcbmNvbnN0IFJlbWVtYmVyID0gcmVxdWlyZShcIi4vUmVtZW1iZXJcIik7XG5cbi8qKlxuICogR2V0cyB0aGUgY3VycmVudCB0aW1lIGFuZCBwcmVzZW50cyBpdCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIC0gVGhlIGNvbnRhaW5lciBvZiB0aGUgY2xvY2suXG4gKi9cbmZ1bmN0aW9uIGRlc2t0b3BDbG9jayhjb250YWluZXIpIHtcbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Nsb2NrXCIpO1xuICAgIH1cblxuICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IGhvdXJzID0gdG9kYXkuZ2V0SG91cnMoKTtcbiAgICBsZXQgbWlucyA9IHRvZGF5LmdldE1pbnV0ZXMoKTtcblxuICAgIGlmIChtaW5zIDwgMTApIHtcbiAgICAgICAgbWlucyA9IFwiMFwiICsgbWlucztcbiAgICB9XG5cbiAgICBpZiAoaG91cnMgPCAxMCkge1xuICAgICAgICBob3VycyA9IFwiMFwiICsgaG91cnM7XG4gICAgfVxuXG4gICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gaG91cnMgKyBcIjpcIiArIG1pbnM7XG59XG5cbi8qKlxuICogR2V0cyB0b2RheSdzIGRhdGUgYW5kIHByZXNlbnRzIGl0IGluIHRoZSBnaXZlbiBjb250YWluZXIuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIgLSBUaGUgY29udGFpbmVyIG9mIHRoZSBjbG9jay5cbiAqL1xuZnVuY3Rpb24gZ2V0RGF0ZShjb250YWluZXIpIHtcbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBtb250aCA9IFtcImphblwiLCBcImZlYlwiLCBcIm1hclwiLCBcImFwclwiLCBcIm1heVwiLCBcImp1bmVcIiwgXCJqdWx5XCIsIFwiYXVnXCIsIFwic2VwdFwiLCBcIm9jdFwiLCBcIm5vdlwiLCBcImRlY1wiXTtcbiAgICBjb250YWluZXIudGV4dENvbnRlbnQgPSB0b2RheS5nZXREYXRlKCkgKyBcIiBcIiArIG1vbnRoW3RvZGF5LmdldE1vbnRoKCldICsgXCIgXCIgKyB0b2RheS5nZXRGdWxsWWVhcigpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGFwcGxpY2F0aW9uIGluZm9ybWF0aW9uIGZvciBpbmZvIHdpbmRvdy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHRvIGRpc3BsYXkgdGhlIGluZm9ybWF0aW9uIGluLlxuICovXG5mdW5jdGlvbiBpbmZvKGVsZW1lbnQpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luZm9cIikuY29udGVudDtcbiAgICBsZXQgY29udGFpbmVyID0gZWxlbWVudC5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUsIHRydWUpKTtcbiAgICBsZXQgc3ViTWVudSA9IGVsZW1lbnQuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVudVwiKTtcbiAgICBzdWJNZW51LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3ViTWVudSk7XG59XG5cbi8qKlxuICogSW5pdGlhdGVzIGRlc2t0b3AgYnkgYWRkaW5nIG5lY2Vzc2FyeSBldmVudCBsaXN0ZW5lcnMgdG8gb3BlbiB3aW5kb3dzIGFuZCBnZXR0aW5nIHRpbWUgYW5kIGRhdGUuXG4gKi9cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgbGV0IG5ld1dpbmRvdztcbiAgICBsZXQgbnVtYmVycyA9IFsxLCAxLCAxLCAxXTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwibmF2IC5pY29uc1wiKS5mb3JFYWNoKChjdXJyZW50LCBpbmRleCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGluZGV4KXtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IENoYXQoXCJjXCIgKyBudW1iZXJzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lm5hbWUudGV4dENvbnRlbnQgPSBcIkNoYXRcIjtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lmljb24uc3JjID0gXCIvaW1hZ2UvY2hhdC5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgbnVtYmVyc1swXSArPSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBNZW1vcnkoXCJtXCIgKyBudW1iZXJzWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgbnVtYmVyc1sxXSArPSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBSZW1lbWJlcihcInJcIiArIG51bWJlcnNbMl0pO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cubmFtZS50ZXh0Q29udGVudCA9IFwiUmVtZW1iZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lmljb24uc3JjID0gXCIvaW1hZ2Uvbm90ZXMucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIG51bWJlcnNbMl0gKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgRGVza3RvcFdpbmRvdyhcImlcIiArIG51bWJlcnNbM10pO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cubmFtZS50ZXh0Q29udGVudCA9IFwiQXBwbGljYXRpb24gaW5mb1wiO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cuaWNvbi5zcmMgPSBcIi9pbWFnZS9pbmZvLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICBpbmZvKG5ld1dpbmRvdyk7XG4gICAgICAgICAgICAgICAgICAgIG51bWJlcnNbM10gKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBnZXREYXRlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGF0ZVwiKSk7XG4gICAgZGVza3RvcENsb2NrKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2xvY2tcIikpO1xuICAgIHNldEludGVydmFsKGRlc2t0b3BDbG9jaywgNTAwMCk7XG59XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogaW5pdCxcbiAgICBnZXRDbG9jazogZGVza3RvcENsb2NrLFxuICAgIGdldERhdGU6IGdldERhdGUsXG4gICAgZ2V0SW5mbzogaW5mb1xufTtcbiIsIi8qKlxuICogTW9kdWxlIGZvciBoYW5kbGluZyBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBHZXRzIGFuIGl0ZW0gZnJvbSBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGl0ZW0gdG8gZ2V0LlxuICogQHJldHVybnMgaXRlbSAtIFRoZSByZXF1ZXN0ZWQgaXRlbVxuICovXG5mdW5jdGlvbiBnZXQobmFtZSkge1xuICAgIGlmIChuYW1lID09PSBcIm5vdGVzXCIpIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShuYW1lKTtcbiAgICB9XG59XG5cbi8qKlxuICogU2V0cyBhbiBpdGVtIGluIGxvY2FsIHN0b3JhZ2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGl0ZW1OYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGl0ZW0gdG8gc2V0LlxuICogQHBhcmFtIGl0ZW0gLSBUaGUgaXRlbS5cbiAqL1xuZnVuY3Rpb24gc2V0KGl0ZW1OYW1lLCBpdGVtKSB7XG4gICAgaWYgKGl0ZW1OYW1lID09PSBcIm5vdGVzXCIpIHtcbiAgICAgICAgbGV0IG5vdGVzID0gKGdldChpdGVtTmFtZSkpID8gZ2V0KGl0ZW1OYW1lKS5ub3RlcyA6IFtdO1xuICAgICAgICBub3Rlcy5wdXNoKGl0ZW0pO1xuXG4gICAgICAgIGxldCBhbGxOb3RlcyA9IHtcbiAgICAgICAgICAgIG5vdGVzOiBub3Rlc1xuICAgICAgICB9O1xuXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGl0ZW1OYW1lLCBKU09OLnN0cmluZ2lmeShhbGxOb3RlcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGl0ZW1OYW1lLCBpdGVtKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZXQ6IHNldCxcbiAgICBnZXQ6IGdldFxufTtcbiJdfQ==
