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
     * Gets DesktopWindow's top-name.
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
     * Gets DesktopWindow's dropdown link in menu.
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
     * Gets the current DesktopWindow.
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

    let id = this.id.toString();

    this.position(id);
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
 *
 * @param {String} id - The id of the window.
 */
DesktopWindow.prototype.position = function(id) {
    let stackWindows = (app) => {
        if (id.indexOf("1") === -1) {
            let idNr = id.charAt(1) - 1;
            if (document.getElementById(app + idNr)) {
                let elementBefore = document.getElementById(app + idNr);
                this.div.style.top = (elementBefore.offsetTop + 35) + "px";
                this.div.style.left = (elementBefore.offsetLeft + 35) + "px";
            }
        }
    };

    if (id.indexOf("c") !== -1) {
        stackWindows("c");
    } else if (id.indexOf("m") !== -1) {
        this.div.style.left = (this.div.offsetLeft + 200) + "px";
        stackWindows("m");
    } else if (id.indexOf("r") !== -1) {
        this.div.style.left = (this.div.offsetLeft + 400) + "px";
        stackWindows("r");
    } else if (id.indexOf("i") !== -1) {
        this.div.style.left = (this.div.offsetLeft + 600) + "px";
        stackWindows("i");
    }
};

/**
 * Handles dragging movements of the window.
 */
DesktopWindow.prototype.handleMovement = function() {
    let posX = 0;
    let posY = 0;

    let scrollUp = () => {
        let container = this.div.querySelector(".messageContainer");
        if (container) {
            container.scrollTop = container.scrollHeight - container.clientHeight;
        }
    };

    let moveWindow = (event) => {
        this.div.style.top = (event.clientY - posY) + "px";
        this.div.style.left = (event.clientX - posX) + "px";
        scrollUp(this.div.querySelector(".messageContainer"));
    };

    let getPosition = (event) => {
        event.preventDefault();

        if (event.target === this.div.querySelector(".close")) {
            this.close(this.div);
            return;
        } else if (event.target === this.div.querySelector(".minimize")) {
            this.minimize();
            return;
        }

        this.div.parentNode.appendChild(this.div);
        posX = event.clientX - this.div.offsetLeft;
        posY = event.clientY - this.div.offsetTop;
        window.addEventListener("mousemove", moveWindow);
        scrollUp();
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
        iconMenu.lastElementChild.textContent = app + " " + (this.id.charAt(1));

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

    if (this.id.indexOf("c") !== -1) {
        addWindow(iconMenus[0], "Chat");
    } else if (this.id.indexOf("m") !== -1) {
        addWindow(iconMenus[1], "Memory");
    } else if (this.id.indexOf("r") !== -1) {
        addWindow(iconMenus[2], "Remember");
    } else if (this.id.indexOf("i") !== -1) {
        addWindow(iconMenus[3], "Info");
    }
};

/**
 * Closes the window.
 *
 * @param {Element} element - The element window to close.
 */
DesktopWindow.prototype.close = function(element) {
    element.parentNode.removeChild(element);

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
     * The size of the board.
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
     * The number of clicks.
     */
    this.nrOfClicks = 0;

    this.start();
}

/**
 * Handles inheritance from DesktopWindow.
 *
 * @type {DesktopWindow}
 */
Memory.prototype = Object.create(DesktopWindow.prototype);
Memory.prototype.constructor = Memory;

/**
 * Starts the game and adds event listeners.
 */
Memory.prototype.start = function() {
    this.shuffle();
    this.setSize();
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
 * Sets the size of the board.
 */
Memory.prototype.setSize = function() {
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
            let index = parseInt(img.getAttribute("data-brickNr"));
            this.turnBrick(this.images[index], img);
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
 * @param {Number} index - The index of the turned brick.
 * @param {Element} img - The element containing the brick.
 */
Memory.prototype.turnBrick = function(brickImg, img) {
    if (this.turn2) {
        return;
    }

    img.src = "/image/memory/" + brickImg + ".png";

    if (!this.turn1) {
        this.turn1 = img;
    } else {
        if (img === this.turn1) {
            return;
        }

        this.nrOfClicks += 1;
        this.div.querySelector(".tries").textContent = this.nrOfClicks.toString();

        this.turn2 = img;
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
    this.setSize();
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
 * Gets application information for info window.
 *
 * @param {Object} element - The element to display the information in.
 */
function info(element) {
    let template = document.querySelector("#info").content;
    let container = element.div.querySelector(".content");

    container.appendChild(document.importNode(template, true));
    let menu = element.div.querySelector(".menu");
    menu.parentNode.removeChild(menu);
}

/**
 * Initiates desktop by adding necessary event listeners.
 */
function init() {
    let newWindow;
    let cNr = 1;
    let mNr = 1;
    let rNr = 1;
    let iNr = 1;
    document.querySelectorAll("nav .icons").forEach((current, index) => {
        switch (index){
            case 0:
                current.addEventListener("click", (event) => {
                    event.preventDefault();
                    newWindow = new Chat("c" + cNr);
                    newWindow.name.textContent = "Chat";
                    newWindow.icon.src = "/image/chat.png";
                    cNr += 1;
                });

                break;
            case 1:
                current.addEventListener("click", (event) => {
                    event.preventDefault();
                    newWindow = new Memory("m" + mNr);
                    mNr += 1;
                });

                break;
            case 2:
                current.addEventListener("click", (event) => {
                    event.preventDefault();
                    newWindow = new Remember("r" + rNr);
                    newWindow.name.textContent = "Remember";
                    newWindow.icon.src = "/image/notes.png";
                    rNr += 1;
                });

                break;
            case 3:
                current.addEventListener("click", (event) => {
                    event.preventDefault();
                    newWindow = new DesktopWindow("i" + iNr);
                    newWindow.name.textContent = "Application info";
                    newWindow.icon.src = "/image/info.png";
                    info(newWindow);
                    iNr += 1;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZW1lbWJlci5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9sb2NhbHN0b3JhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogTW9kdWxlIGZvciBDaGF0LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5jb25zdCBzdG9yYWdlID0gcmVxdWlyZShcIi4vbG9jYWxzdG9yYWdlXCIpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYSBDaGF0LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKi9cbmZ1bmN0aW9uIENoYXQoaWQpIHtcbiAgICBEZXNrdG9wV2luZG93LmNhbGwodGhpcywgaWQpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIHVzZXIuIFwiVW5rbm93blwiIGJ5IGRlZmF1bHQuXG4gICAgICovXG4gICAgdGhpcy51c2VyID0gXCJVbmtub3duXCI7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgd2ViIHNvY2tldCBmb3IgdGhlIGNoYXQuXG4gICAgICovXG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KFwid3M6Ly92aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIik7XG5cbiAgICB0aGlzLm9wZW4oKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xuQ2hhdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlc2t0b3BXaW5kb3cucHJvdG90eXBlKTtcbkNoYXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2hhdDtcblxuLyoqXG4gKiBJbml0aWF0ZXMgdGhlIGFwcGxpY2F0aW9uLlxuICovXG5DaGF0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLCB0cnVlKTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICBsZXQgbWVzc2FnZUlucHV0ID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jaGF0TWVzc2FnZVwiKTtcbiAgICBsZXQgdXNlckluZm8gPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLnVzZXJcIik7XG4gICAgdGhpcy5nZXRVc2VyKHVzZXJJbmZvKTtcblxuICAgIG1lc3NhZ2VJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuZW1vamlzKG1lc3NhZ2VJbnB1dCk7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzIHx8IGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudXNlciAhPT0gXCJVbmtub3duXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW1lc3NhZ2VJbnB1dC52YWx1ZSB8fCBtZXNzYWdlSW5wdXQudmFsdWUudHJpbSgpID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiV3JpdGUgeW91ciBtZXNzYWdlLlwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZChtZXNzYWdlSW5wdXQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlSW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdXNlckluZm8uZmlyc3RFbGVtZW50Q2hpbGQuY2xhc3NMaXN0LmFkZChcInJlZGJnXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgIGlmIChkYXRhLnR5cGUgPT09IFwibWVzc2FnZVwiIHx8IGRhdGEudHlwZSA9PT0gXCJub3RpZmljYXRpb25cIikge1xuICAgICAgICAgICAgdGhpcy5yZWNlaXZlKGRhdGEpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHVzZXIgZm9yIHRoZSBjaGF0IGFwcGxpY2F0aW9uLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZGl2IC0gVGhlIGRpdiBob2xkaW5nIHRoZSB1c2VyIGluZm9ybWF0aW9uLlxuICovXG5DaGF0LnByb3RvdHlwZS5nZXRVc2VyID0gZnVuY3Rpb24oZGl2KSB7XG4gICAgbGV0IGlucHV0ID0gZGl2LmZpcnN0RWxlbWVudENoaWxkO1xuICAgIGxldCBidXR0b24gPSBkaXYubGFzdEVsZW1lbnRDaGlsZDtcblxuICAgIGxldCByZW1vdmVVc2VyRWxlbSA9ICgpID0+IHtcbiAgICAgICAgZGl2LnJlbW92ZUNoaWxkKGlucHV0KTtcbiAgICAgICAgZGl2LnJlbW92ZUNoaWxkKGJ1dHRvbik7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwibG9nZ2VkSW5cIik7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IFwiTG9nZ2VkIGluIGFzIFwiICsgdGhpcy51c2VyO1xuICAgIH07XG5cbiAgICBsZXQgZ2V0VXNlcm5hbWUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChkaXYuZmlyc3RFbGVtZW50Q2hpbGQudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IGRpdi5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcbiAgICAgICAgICAgIGlucHV0LmNsYXNzTGlzdC5yZW1vdmUoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIGlucHV0LnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgIHJlbW92ZVVzZXJFbGVtKCk7XG4gICAgICAgICAgICBzdG9yYWdlLnNldChcInVzZXJuYW1lXCIsIHRoaXMudXNlcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCFzdG9yYWdlLmdldChcInVzZXJuYW1lXCIpKSB7XG4gICAgICAgIGRpdi5sYXN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXRVc2VybmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51c2VyID0gc3RvcmFnZS5nZXQoXCJ1c2VybmFtZVwiKTtcbiAgICAgICAgcmVtb3ZlVXNlckVsZW0oKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyb3Bkb3duLnRleHRDb250ZW50ID0gXCJDaGFuZ2UgdXNlclwiO1xuICAgIHRoaXMuZHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkaXYudGV4dENvbnRlbnQgPSBcIlVzZXI6IFwiO1xuICAgICAgICBkaXYuY2xhc3NMaXN0LnJlbW92ZShcImxvZ2dlZEluXCIpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgdGhpcy51c2VyID0gXCJVbmtub3duXCI7XG4gICAgICAgIGRpdi5sYXN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXRVc2VybmFtZSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFNlbmRzIHR5cGVkIGluIG1lc3NhZ2VzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCAtIFRoZSBpbnB1dCBtZXNzYWdlIGZyb20gdGhlIHRleHRhcmVhLlxuICovXG5DaGF0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICBsZXQgbWVzc2FnZSA9IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGRhdGE6IGlucHV0LFxuICAgICAgICB1c2VybmFtZTogdGhpcy51c2VyLFxuICAgICAgICBrZXk6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIlxuICAgIH07XG5cbiAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbn07XG5cbi8qKlxuICogUmVjZWl2ZXMgYW5kIGRpc3BsYXlzIG1lc3NhZ2VzIGluIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gVGhlIHJlY2VpdmVkIGRhdGEuXG4gKi9cbkNoYXQucHJvdG90eXBlLnJlY2VpdmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUNvbnRhaW5lclwiKTtcblxuICAgIGxldCB1c2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgdXNlci5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInVzZXJuYW1lXCIpO1xuICAgIHVzZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YS51c2VybmFtZSkpO1xuICAgIGxldCBwRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIHBFbGVtLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEuZGF0YSkpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHVzZXIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChwRWxlbSk7XG5cbiAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodCAtIGNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG59O1xuXG4vKipcbiAqIFJlcGxhY2VzIGNlcnRhaW4gY2hhcmFjdGVyIGNvbWJpbmF0aW9ucyB3aXRoIGVtb2ppcy5cbiAqXG4gKiBAcGFyYW0gZWxlbWVudCAtIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIHVzZXIgaW5wdXQuXG4gKi9cbkNoYXQucHJvdG90eXBlLmVtb2ppcyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBsZXQgZW1vamlzID0ge1xuICAgICAgICBcIjopXCI6IFwiXFx1RDgzRFxcdURFMEFcIixcbiAgICAgICAgXCI7KVwiOiBcIlxcdUQ4M0RcXHVERTA5XCIsXG4gICAgICAgIFwiOkRcIjogXCJcXHVEODNEXFx1REUwM1wiLFxuICAgICAgICBcIjpQXCI6IFwiXFx1RDgzRFxcdURFMUJcIixcbiAgICAgICAgXCI7UFwiOiBcIlxcdUQ4M0RcXHVERTFDXCIsXG4gICAgICAgIFwiOi9cIjogXCJcXHVEODNEXFx1REUxNVwiLFxuICAgICAgICBcIjooXCI6IFwiXFx1RDgzRFxcdURFMUVcIixcbiAgICAgICAgXCI6JyhcIjogXCJcXHVEODNEXFx1REUyMlwiLFxuICAgICAgICBcIih5KVwiOiBcIlxcdUQ4M0RcXHVEQzREXCIsXG4gICAgICAgIFwiPDNcIjogXCJcXHUyNzY0XFx1RkUwRlwiXG4gICAgfTtcblxuICAgIGZvciAobGV0IGkgaW4gZW1vamlzKSB7XG4gICAgICAgIGVsZW1lbnQudmFsdWUgPSBlbGVtZW50LnZhbHVlLnJlcGxhY2UoaSwgZW1vamlzW2ldKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge0NoYXR9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gQ2hhdDtcbiIsIi8qKlxuICogTW9kdWxlIGZvciBEZXNrdG9wV2luZG93LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIERlc2t0b3BXaW5kb3cuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdyB0byBjcmVhdGUuXG4gKiBAdGhyb3dzIHtFcnJvcn0gLSBXaW5kb3cgbXVzdCBoYXZlIGFuIGlkLlxuICovXG5mdW5jdGlvbiBEZXNrdG9wV2luZG93KGlkKSB7XG4gICAgaWYgKCFpZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXaW5kb3cgbXVzdCBoYXZlIGFuIGlkLlwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIERlc2t0b3BXaW5kb3cncyB0b3AtbmFtZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNuYW1lXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwibmFtZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5uYW1lXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIERlc2t0b3BXaW5kb3cncyB0b3AtbmFtZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNpY29uXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiaWNvblwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5sb2dvXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIERlc2t0b3BXaW5kb3cncyBmb290ZXIgbWVzc2FnZSBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I21lc3NhZ2VcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJtZXNzYWdlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLndpbmRvdy1mb290ZXJcIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIGRyb3Bkb3duIGxpbmsgaW4gbWVudS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNkcm9wZG93blxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImRyb3Bkb3duXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIilbMF07XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGN1cnJlbnQgRGVza3RvcFdpbmRvdy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNkaXZcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJkaXZcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIERlc2t0b3BXaW5kb3cncyBpZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2lkXG4gICAgICogQHRocm93cyB7VHlwZUVycm9yfSAtIE11c3QgYmUgYSBzdHJpbmcuXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiaWRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJXaW5kb3cgaWQgbXVzdCBiZSBhIHN0cmluZy5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5jcmVhdGUoKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHdpbmRvdyBmcm9tIHRlbXBsYXRlLlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvd1wiKTtcbiAgICBsZXQgd2luZG93RGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Rlc2t0b3BcIikuYXBwZW5kQ2hpbGQod2luZG93RGl2KTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3VuY2xhaW1lZFwiKS5pZCA9IHRoaXMuaWQ7XG5cbiAgICBsZXQgaWQgPSB0aGlzLmlkLnRvU3RyaW5nKCk7XG5cbiAgICB0aGlzLnBvc2l0aW9uKGlkKTtcbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KCk7XG5cbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5kaXYgIT09IHRoaXMuZGl2LnBhcmVudE5vZGUubGFzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICAgICAgdGhpcy5kaXYucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLmRpdik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwidGV4dGFyZWFcIikgfHxcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldCA9PT0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcImlucHV0XCIpKSB7XG4gICAgICAgICAgICBldmVudC50YXJnZXQuZm9jdXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VDb250YWluZXJcIik7XG4gICAgICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gY29udGFpbmVyLmNsaWVudEhlaWdodDtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLyoqXG4gKiBQb3NpdGlvbnMgdGhlIHdpbmRvdyBpbiB0aGUgZGVza3RvcCwgc3RhY2tzIGlmIG5lY2Vzc2FyeS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUucG9zaXRpb24gPSBmdW5jdGlvbihpZCkge1xuICAgIGxldCBzdGFja1dpbmRvd3MgPSAoYXBwKSA9PiB7XG4gICAgICAgIGlmIChpZC5pbmRleE9mKFwiMVwiKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGxldCBpZE5yID0gaWQuY2hhckF0KDEpIC0gMTtcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhcHAgKyBpZE5yKSkge1xuICAgICAgICAgICAgICAgIGxldCBlbGVtZW50QmVmb3JlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXBwICsgaWROcik7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUudG9wID0gKGVsZW1lbnRCZWZvcmUub2Zmc2V0VG9wICsgMzUpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRMZWZ0ICsgMzUpICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGlmIChpZC5pbmRleE9mKFwiY1wiKSAhPT0gLTEpIHtcbiAgICAgICAgc3RhY2tXaW5kb3dzKFwiY1wiKTtcbiAgICB9IGVsc2UgaWYgKGlkLmluZGV4T2YoXCJtXCIpICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gKHRoaXMuZGl2Lm9mZnNldExlZnQgKyAyMDApICsgXCJweFwiO1xuICAgICAgICBzdGFja1dpbmRvd3MoXCJtXCIpO1xuICAgIH0gZWxzZSBpZiAoaWQuaW5kZXhPZihcInJcIikgIT09IC0xKSB7XG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAodGhpcy5kaXYub2Zmc2V0TGVmdCArIDQwMCkgKyBcInB4XCI7XG4gICAgICAgIHN0YWNrV2luZG93cyhcInJcIik7XG4gICAgfSBlbHNlIGlmIChpZC5pbmRleE9mKFwiaVwiKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9ICh0aGlzLmRpdi5vZmZzZXRMZWZ0ICsgNjAwKSArIFwicHhcIjtcbiAgICAgICAgc3RhY2tXaW5kb3dzKFwiaVwiKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgZHJhZ2dpbmcgbW92ZW1lbnRzIG9mIHRoZSB3aW5kb3cuXG4gKi9cbkRlc2t0b3BXaW5kb3cucHJvdG90eXBlLmhhbmRsZU1vdmVtZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHBvc1ggPSAwO1xuICAgIGxldCBwb3NZID0gMDtcblxuICAgIGxldCBzY3JvbGxVcCA9ICgpID0+IHtcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICAgICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGxldCBtb3ZlV2luZG93ID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCA9IChldmVudC5jbGllbnRZIC0gcG9zWSkgKyBcInB4XCI7XG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAoZXZlbnQuY2xpZW50WCAtIHBvc1gpICsgXCJweFwiO1xuICAgICAgICBzY3JvbGxVcCh0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VDb250YWluZXJcIikpO1xuICAgIH07XG5cbiAgICBsZXQgZ2V0UG9zaXRpb24gPSAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlXCIpKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKHRoaXMuZGl2KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWluaW1pemVcIikpIHtcbiAgICAgICAgICAgIHRoaXMubWluaW1pemUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZGl2LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5kaXYpO1xuICAgICAgICBwb3NYID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuZGl2Lm9mZnNldExlZnQ7XG4gICAgICAgIHBvc1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5kaXYub2Zmc2V0VG9wO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlV2luZG93KTtcbiAgICAgICAgc2Nyb2xsVXAoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5kaXYuZmlyc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBnZXRQb3NpdGlvbik7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKCkgPT4ge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlV2luZG93KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogTWluaW1pemVzIHdpbmRvdywgb3IgbWF4aW1pemVzIGlmIGNsaWNrZWQgb24gdGhlIHJlZmVyZW5jZS5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUubWluaW1pemUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmRpdi5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcblxuICAgIGxldCBhVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgYVRhZy5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiI1wiKTtcblxuICAgIGxldCBhZGRXaW5kb3cgPSAoaWNvbk1lbnUsIGFwcCkgPT4ge1xuICAgICAgICBpY29uTWVudS5hcHBlbmRDaGlsZChhVGFnKTtcbiAgICAgICAgaWNvbk1lbnUuY2xhc3NMaXN0LmFkZChcIm1pbmltaXplZFwiKTtcbiAgICAgICAgaWNvbk1lbnUubGFzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IGFwcCArIFwiIFwiICsgKHRoaXMuaWQuY2hhckF0KDEpKTtcblxuICAgICAgICBpY29uTWVudS5sYXN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgICBpY29uTWVudS5yZW1vdmVDaGlsZChldmVudC50YXJnZXQpO1xuXG4gICAgICAgICAgICBpZiAoIWljb25NZW51LmZpcnN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgICAgICAgICAgaWNvbk1lbnUuY2xhc3NMaXN0LnJlbW92ZShcIm1pbmltaXplZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGxldCBpY29uTWVudXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwibmF2IC5pY29uLW1lbnVcIik7XG5cbiAgICBpZiAodGhpcy5pZC5pbmRleE9mKFwiY1wiKSAhPT0gLTEpIHtcbiAgICAgICAgYWRkV2luZG93KGljb25NZW51c1swXSwgXCJDaGF0XCIpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pZC5pbmRleE9mKFwibVwiKSAhPT0gLTEpIHtcbiAgICAgICAgYWRkV2luZG93KGljb25NZW51c1sxXSwgXCJNZW1vcnlcIik7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlkLmluZGV4T2YoXCJyXCIpICE9PSAtMSkge1xuICAgICAgICBhZGRXaW5kb3coaWNvbk1lbnVzWzJdLCBcIlJlbWVtYmVyXCIpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pZC5pbmRleE9mKFwiaVwiKSAhPT0gLTEpIHtcbiAgICAgICAgYWRkV2luZG93KGljb25NZW51c1szXSwgXCJJbmZvXCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgd2luZG93IHRvIGNsb3NlLlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG5cbiAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge0Rlc2t0b3BXaW5kb3d9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gRGVza3RvcFdpbmRvdztcbiIsIi8qKlxuICogTW9kdWxlIGZvciBNZW1vcnkuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgTWVtb3J5IGdhbWUuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gTWVtb3J5KGlkKSB7XG4gICAgRGVza3RvcFdpbmRvdy5jYWxsKHRoaXMsIGlkKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzaXplIG9mIHRoZSBib2FyZC5cbiAgICAgKi9cbiAgICB0aGlzLnNpemUgPSAxNjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBhcnJheSB0byBjb250YWluIHRoZSBicmljayBpbWFnZXMuXG4gICAgICovXG4gICAgdGhpcy5pbWFnZXMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBmaXJzdCB0dXJuZWQgYnJpY2suXG4gICAgICovXG4gICAgdGhpcy50dXJuMSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2Vjb25kIHR1cm5lZCBicmljay5cbiAgICAgKi9cbiAgICB0aGlzLnR1cm4yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgcGFpcnMuXG4gICAgICovXG4gICAgdGhpcy5wYWlycyA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIGNsaWNrcy5cbiAgICAgKi9cbiAgICB0aGlzLm5yT2ZDbGlja3MgPSAwO1xuXG4gICAgdGhpcy5zdGFydCgpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5NZW1vcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNrdG9wV2luZG93LnByb3RvdHlwZSk7XG5NZW1vcnkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVtb3J5O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgZ2FtZSBhbmQgYWRkcyBldmVudCBsaXN0ZW5lcnMuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNodWZmbGUoKTtcbiAgICB0aGlzLnNldFNpemUoKTtcbiAgICB0aGlzLnNldE1lbnUoKTtcblxuICAgIHRoaXMuZHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnJlc3RhcnQoKTtcbiAgICB9KTtcblxuICAgIGxldCBsaW5rcyA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMV0ucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpO1xuICAgIGxpbmtzLmZvckVhY2goKGN1cnJlbnQpID0+IHtcbiAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC50YXJnZXQudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiM3gyXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCI0eDNcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gMTI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCI0eDRcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gMTY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJlc3RhcnQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFNldHMgZWxlbWVudHMgZm9yIHRoZSBkcm9wLWRvd24gbWVudSB0byBhbGxvdyBjaGFuZ2luZyBzaXplIG9mIHRoZSBib2FyZC5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zZXRNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lbnVsaW5rXCIpO1xuICAgIGxldCBtZW51Q2xvbmUgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQobWVudUNsb25lKTtcblxuICAgIGxldCBuZXdMaW5rID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXTtcbiAgICBuZXdMaW5rLmZpcnN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gXCJTaXplXCI7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI7IGkgKz0gMSkge1xuICAgICAgICBsZXQgZHJvcGRvd25DbG9uZSA9IG5ld0xpbmsucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93biBhXCIpLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgbmV3TGluay5sYXN0RWxlbWVudENoaWxkLmFwcGVuZENoaWxkKGRyb3Bkb3duQ2xvbmUpO1xuICAgIH1cblxuICAgIGxldCBkcm9wZG93bkxpbmtzID0gbmV3TGluay5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIik7XG4gICAgZHJvcGRvd25MaW5rc1swXS50ZXh0Q29udGVudCA9IFwiM3gyXCI7XG4gICAgZHJvcGRvd25MaW5rc1sxXS50ZXh0Q29udGVudCA9IFwiNHgzXCI7XG4gICAgZHJvcGRvd25MaW5rc1syXS50ZXh0Q29udGVudCA9IFwiNHg0XCI7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHNpemUgb2YgdGhlIGJvYXJkLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGVEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeVwiKS5jb250ZW50O1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLCBmYWxzZSk7XG4gICAgbGV0IHJlc3VsdEVsZW0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2Lmxhc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgc3dpdGNoICh0aGlzLnNpemUpIHtcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDZcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiYm9hcmQxMlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDE2XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbGV0IGE7XG4gICAgdGhpcy5pbWFnZXMuZm9yRWFjaCgoaW1hZ2UsIGluZGV4KSA9PiB7XG4gICAgICAgIGEgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgYS5maXJzdEVsZW1lbnRDaGlsZC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWJyaWNrTnJcIiwgaW5kZXgpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYSk7XG5cbiAgICB9KTtcblxuICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgbGV0IGltZztcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSBcIkFcIikge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICAgICAgICAgIGltZyA9IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSBcIklNR1wiKSB7XG4gICAgICAgICAgICBpbWcgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW1nKSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbWcuZ2V0QXR0cmlidXRlKFwiZGF0YS1icmlja05yXCIpKTtcbiAgICAgICAgICAgIHRoaXMudHVybkJyaWNrKHRoaXMuaW1hZ2VzW2luZGV4XSwgaW1nKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFwcGVuZENoaWxkKGRpdik7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFwcGVuZENoaWxkKHJlc3VsdEVsZW0pO1xufTtcblxuLyoqXG4gKiBTaHVmZmxlcyB0aGUgYXJyYXkgd2l0aCBpbWFnZXMuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc2h1ZmZsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW1hZ2VzID0gWzEsMSwyLDIsMywzLDQsNCw1LDUsNiw2LDcsNyw4LDhdO1xuXG4gICAgbGV0IGluZGV4VG9Td2FwO1xuICAgIGxldCB0ZW1wSW1nO1xuICAgIGxldCBpbWdzO1xuXG4gICAgc3dpdGNoICh0aGlzLnNpemUpIHtcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgaW1ncyA9IHRoaXMuaW1hZ2VzLnNsaWNlKDAsIDYpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBpbWdzID0gdGhpcy5pbWFnZXMuc2xpY2UoMCwgMTIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICBpbWdzID0gdGhpcy5pbWFnZXM7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IHRoaXMuc2l6ZSAtIDE7IGkgPiAwOyBpIC09IDEpIHtcbiAgICAgICAgaW5kZXhUb1N3YXAgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKTtcbiAgICAgICAgdGVtcEltZyA9IGltZ3NbaV07XG4gICAgICAgIGltZ3NbaV0gPSBpbWdzW2luZGV4VG9Td2FwXTtcbiAgICAgICAgaW1nc1tpbmRleFRvU3dhcF0gPSB0ZW1wSW1nO1xuICAgIH1cblxuICAgIHRoaXMuaW1hZ2VzID0gaW1ncztcbn07XG5cbi8qKlxuICogSGFuZGxlcyB0aGUgZXZlbnQgb2YgdHVybmluZyBhIGJyaWNrLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBicmlja0ltZyAtIFRoZSBpbWFnZSBvZiB0aGUgdHVybmVkIGJyaWNrLlxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSB0dXJuZWQgYnJpY2suXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGltZyAtIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGJyaWNrLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnR1cm5CcmljayA9IGZ1bmN0aW9uKGJyaWNrSW1nLCBpbWcpIHtcbiAgICBpZiAodGhpcy50dXJuMikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaW1nLnNyYyA9IFwiL2ltYWdlL21lbW9yeS9cIiArIGJyaWNrSW1nICsgXCIucG5nXCI7XG5cbiAgICBpZiAoIXRoaXMudHVybjEpIHtcbiAgICAgICAgdGhpcy50dXJuMSA9IGltZztcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaW1nID09PSB0aGlzLnR1cm4xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5yT2ZDbGlja3MgKz0gMTtcbiAgICAgICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi50cmllc1wiKS50ZXh0Q29udGVudCA9IHRoaXMubnJPZkNsaWNrcy50b1N0cmluZygpO1xuXG4gICAgICAgIHRoaXMudHVybjIgPSBpbWc7XG4gICAgICAgIGlmICh0aGlzLnR1cm4xLnNyYyA9PT0gdGhpcy50dXJuMi5zcmMpIHtcbiAgICAgICAgICAgIHRoaXMucGFpcnMgKz0gMTtcbiAgICAgICAgICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIucGFpcnNcIikudGV4dENvbnRlbnQgPSB0aGlzLnBhaXJzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhaXJzID09PSB0aGlzLnNpemUgLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmRHYW1lKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjEucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwiZW1wdHlcIik7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMi5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJlbXB0eVwiKTtcblxuICAgICAgICAgICAgICAgIHRoaXMudHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIgPSBudWxsO1xuICAgICAgICAgICAgfSwgNDAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjEuc3JjID0gXCIvaW1hZ2UvbWVtb3J5LzAucG5nXCI7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMi5zcmMgPSBcIi9pbWFnZS9tZW1vcnkvMC5wbmdcIjtcblxuICAgICAgICAgICAgICAgIHRoaXMudHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIgPSBudWxsO1xuICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRW5kcyB0aGUgZ2FtZSBhbmQgZGlzcGxheXMgbWVzc2FnZS5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5lbmRHYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IG1lc3NhZ2UgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VcIik7XG5cbiAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gXCJZb3UgZmluaXNoZWQgdGhlIGdhbWUhXCI7XG59O1xuXG4vKipcbiAqIFJlc3RhcnRzIGFuZCBjbGVhcnMgdGhlIE1lbW9yeSBnYW1lLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHRoaXMucGFpcnMgPSAwO1xuICAgIHRoaXMubnJPZkNsaWNrcyA9IDA7XG4gICAgdGhpcy5zaHVmZmxlKCk7XG4gICAgdGhpcy5zZXRTaXplKCk7XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge01lbW9yeX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnk7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgUmVtZW1iZXIgYXBwbGljYXRpb24uXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcbmNvbnN0IHN0b3JhZ2UgPSByZXF1aXJlKFwiLi9sb2NhbHN0b3JhZ2VcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBSZW1lbWJlci5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSBpZFxuICovXG5mdW5jdGlvbiBSZW1lbWJlcihpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXJyYXkgdG8gaG9sZCB0aGUgbm90ZXMuXG4gICAgICovXG4gICAgdGhpcy5ub3RlcyA9IFtdO1xuXG4gICAgdGhpcy5uZXcoKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNrdG9wV2luZG93LnByb3RvdHlwZSk7XG5SZW1lbWJlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZW1lbWJlcjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG5vdGUuXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBub3RGaXJzdCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjcmVhdGVkIG5vdGUgaXMgdGhlIGZpcnN0IG9yIG5vdC5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLm5ldyA9IGZ1bmN0aW9uKG5vdEZpcnN0KSB7XG4gICAgaWYgKG5vdEZpcnN0KSB7XG4gICAgICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG4gICAgICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubm90ZXMgPSBbXTtcbiAgICB9XG5cbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JlbWVtYmVyXCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLCB0cnVlKTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICBsZXQgaW5wdXQgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5vdGUtaW5wdXRcIik7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcImJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBpZiAoIWlucHV0LnZhbHVlKSB7XG4gICAgICAgICAgICBpbnB1dC5jbGFzc0xpc3QuYWRkKFwicmVkYmdcIik7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIllvdSBuZWVkIHRvIHdyaXRlIGFuIGl0ZW0gZm9yIHRoZSBsaXN0LlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5wdXQuY2xhc3NMaXN0LnJlbW92ZShcInJlZGJnXCIpO1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICAgICAgICAgIHRoaXMuYWRkKGlucHV0LnZhbHVlKTtcbiAgICAgICAgICAgIGlucHV0LnZhbHVlID0gXCJcIjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCFub3RGaXJzdCkge1xuICAgICAgICB0aGlzLnNldE1lbnUoKTtcbiAgICAgICAgaWYgKHN0b3JhZ2UuZ2V0KFwibm90ZXNcIikgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZSh0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJvcGRvd24udGV4dENvbnRlbnQgPSBcIlNhdmVcIjtcbiAgICAgICAgdGhpcy5kcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubm90ZSBwXCIpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJOb3RlIGlzIGVtcHR5LlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIGRpZmZlcmVudCBkcm9wZG93biBtZW51cy5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLnNldE1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVudWxpbmtcIik7XG4gICAgbGV0IG1lbnVDbG9uZSA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIGVsZW1lbnQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChtZW51Q2xvbmUpO1xuXG4gICAgbGV0IG5ld0xpbmsgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzFdO1xuICAgIG5ld0xpbmsuZmlyc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBcIk5vdGVzXCI7XG4gICAgbmV3TGluay5xdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duXCIpLnJlbW92ZUNoaWxkKG5ld0xpbmsucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93biBhXCIpKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjsgaSArPSAxKSB7XG4gICAgICAgIGxldCBkcm9wZG93bkNsb25lID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVswXS5xdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duIGFcIikuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzBdLmxhc3RFbGVtZW50Q2hpbGQuYXBwZW5kQ2hpbGQoZHJvcGRvd25DbG9uZSk7XG4gICAgfVxuXG4gICAgbGV0IGRyb3Bkb3duTGlua3MgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKTtcbiAgICBkcm9wZG93bkxpbmtzWzFdLnRleHRDb250ZW50ID0gXCJOZXdcIjtcbiAgICBkcm9wZG93bkxpbmtzWzJdLnRleHRDb250ZW50ID0gXCJEZWxldGUgQWxsXCI7XG5cbiAgICBkcm9wZG93bkxpbmtzWzFdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5uZXcodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBkcm9wZG93bkxpbmtzWzJdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJub3Rlc1wiKTtcblxuICAgICAgICBsZXQgY29udGFpbmVyID0gbmV3TGluay5sYXN0RWxlbWVudENoaWxkO1xuICAgICAgICB3aGlsZSAoY29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5ldyh0cnVlKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQWRkcyBpbnB1dCB0byB0aGUgbm90ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgLSBVc2VyIGlucHV0IGZyb20gZWxlbWVudC5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgbGV0IG5vdGVFbGVtID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5ub3RlIHBcIilbMF0uY2xvbmVOb2RlKHRydWUpO1xuICAgIG5vdGVFbGVtLnRleHRDb250ZW50ID0gaW5wdXQ7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5ub3RlXCIpLmFwcGVuZENoaWxkKG5vdGVFbGVtKTtcblxuICAgIHRoaXMubm90ZXMucHVzaChpbnB1dCk7XG59O1xuXG4vKipcbiAqIFNhdmVzIGN1cnJlbnQgbm90ZSB0byBsb2NhbCBzdG9yYWdlIG9yIGdldHMgb2xkIG5vdGVzLlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb2xkTm90ZXMgLSBXaGV0aGVyIG9yIG5vdCB0aGVyZSBhcmUgb2xkIG5vdGVzIGluIGxvY2FsIHN0b3JhZ2UuXG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24ob2xkTm90ZXMpIHtcbiAgICBsZXQgbmV3TGluaztcbiAgICBsZXQgZHJvcGRvd25MaW5rO1xuXG4gICAgbGV0IGFkZE1lbnVOb3RlID0gKCkgPT4ge1xuICAgICAgICBuZXdMaW5rID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXTtcbiAgICAgICAgbGV0IGRyb3Bkb3duQ2xvbmUgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzBdLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd24gYVwiKS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5ld0xpbmsubGFzdEVsZW1lbnRDaGlsZC5hcHBlbmRDaGlsZChkcm9wZG93bkNsb25lKTtcblxuICAgICAgICBkcm9wZG93bkxpbmsgPSBuZXdMaW5rLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd25cIikubGFzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgZHJvcGRvd25MaW5rLnRleHRDb250ZW50ID0gXCJOb3RlIFwiICsgKG5ld0xpbmsucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpLmxlbmd0aCk7XG5cbiAgICAgICAgZHJvcGRvd25MaW5rLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsZXQgbnIgPSBldmVudC50YXJnZXQudGV4dENvbnRlbnQuY2hhckF0KGV2ZW50LnRhcmdldC50ZXh0Q29udGVudC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0KG5yKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGxldCBub3RlcyA9IChzdG9yYWdlLmdldChcIm5vdGVzXCIpID09PSBudWxsKSA/IDAgOiBzdG9yYWdlLmdldChcIm5vdGVzXCIpLm5vdGVzO1xuICAgIGlmIChvbGROb3Rlcykge1xuICAgICAgICBub3Rlcy5mb3JFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGFkZE1lbnVOb3RlKCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChub3RlcyA9PT0gMCB8fCBub3Rlcy5sZW5ndGggPD0gNCkge1xuICAgICAgICAgICAgc3RvcmFnZS5zZXQoXCJub3Rlc1wiLCB0aGlzLm5vdGVzKTtcbiAgICAgICAgICAgIGFkZE1lbnVOb3RlKCk7XG4gICAgICAgICAgICB0aGlzLm5ldyh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiWW91IGFscmVhZHkgaGF2ZSA1IHNhdmVkIG5vdGVzLlwiO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBpdGVtIHRoYXQgd2FzIGNsaWNrZWQgb24gZnJvbSBsaXN0LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuciAtIFRoZSBudW1iZXIgb2YgdGhlIGNsaWNrZWQgaXRlbSBpbiBsb2NhbCBzdG9yYWdlIGFycmF5LlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obnIpIHtcbiAgICBsZXQgbm90ZXMgPSBzdG9yYWdlLmdldChcIm5vdGVzXCIpLm5vdGVzO1xuICAgIGxldCBub3RlQ29udGVudCA9IG5vdGVzWyhuciAtIDEpXTtcblxuICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5vdGVcIik7XG4gICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZW1lbWJlclwiKS5jb250ZW50O1xuICAgIGxldCBjb250ZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5maXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuXG4gICAgbm90ZUNvbnRlbnQuZm9yRWFjaCgoY3VycmVudCkgPT4ge1xuICAgICAgICBsZXQgbm90ZUVsZW0gPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm5vdGUgcFwiKVswXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5vdGVFbGVtLnRleHRDb250ZW50ID0gY3VycmVudDtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vdGVFbGVtKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7UmVtZW1iZXJ9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gUmVtZW1iZXI7XG4iLCIvKipcbiAqIFN0YXJ0IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuY29uc3QgZGVza3RvcCA9IHJlcXVpcmUoXCIuL2Rlc2t0b3BcIik7XG5cbmRlc2t0b3AuaW5pdCgpO1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIGRlc2t0b3AuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERlc2t0b3BXaW5kb3cgPSByZXF1aXJlKFwiLi9EZXNrdG9wV2luZG93XCIpO1xuY29uc3QgQ2hhdCA9IHJlcXVpcmUoXCIuL0NoYXRcIik7XG5jb25zdCBNZW1vcnkgPSByZXF1aXJlKFwiLi9NZW1vcnlcIik7XG5jb25zdCBSZW1lbWJlciA9IHJlcXVpcmUoXCIuL1JlbWVtYmVyXCIpO1xuXG4vKipcbiAqIEdldHMgdGhlIGN1cnJlbnQgdGltZSBhbmQgcHJlc2VudHMgaXQgaW4gdGhlIGdpdmVuIGNvbnRhaW5lci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciAtIFRoZSBjb250YWluZXIgb2YgdGhlIGNsb2NrLlxuICovXG5mdW5jdGlvbiBkZXNrdG9wQ2xvY2soY29udGFpbmVyKSB7XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjbG9ja1wiKTtcbiAgICB9XG5cbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBob3VycyA9IHRvZGF5LmdldEhvdXJzKCk7XG4gICAgbGV0IG1pbnMgPSB0b2RheS5nZXRNaW51dGVzKCk7XG5cbiAgICBpZiAobWlucyA8IDEwKSB7XG4gICAgICAgIG1pbnMgPSBcIjBcIiArIG1pbnM7XG4gICAgfVxuXG4gICAgaWYgKGhvdXJzIDwgMTApIHtcbiAgICAgICAgaG91cnMgPSBcIjBcIiArIGhvdXJzO1xuICAgIH1cblxuICAgIGNvbnRhaW5lci50ZXh0Q29udGVudCA9IGhvdXJzICsgXCI6XCIgKyBtaW5zO1xufVxuXG4vKipcbiAqIEdldHMgdG9kYXkncyBkYXRlIGFuZCBwcmVzZW50cyBpdCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIC0gVGhlIGNvbnRhaW5lciBvZiB0aGUgY2xvY2suXG4gKi9cbmZ1bmN0aW9uIGdldERhdGUoY29udGFpbmVyKSB7XG4gICAgbGV0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBsZXQgbW9udGggPSBbXCJqYW5cIiwgXCJmZWJcIiwgXCJtYXJcIiwgXCJhcHJcIiwgXCJtYXlcIiwgXCJqdW5lXCIsIFwianVseVwiLCBcImF1Z1wiLCBcInNlcHRcIiwgXCJvY3RcIiwgXCJub3ZcIiwgXCJkZWNcIl07XG4gICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gdG9kYXkuZ2V0RGF0ZSgpICsgXCIgXCIgKyBtb250aFt0b2RheS5nZXRNb250aCgpXSArIFwiIFwiICsgdG9kYXkuZ2V0RnVsbFllYXIoKTtcbn1cblxuLyoqXG4gKiBHZXRzIGFwcGxpY2F0aW9uIGluZm9ybWF0aW9uIGZvciBpbmZvIHdpbmRvdy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHRvIGRpc3BsYXkgdGhlIGluZm9ybWF0aW9uIGluLlxuICovXG5mdW5jdGlvbiBpbmZvKGVsZW1lbnQpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luZm9cIikuY29udGVudDtcbiAgICBsZXQgY29udGFpbmVyID0gZWxlbWVudC5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUsIHRydWUpKTtcbiAgICBsZXQgbWVudSA9IGVsZW1lbnQuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVudVwiKTtcbiAgICBtZW51LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobWVudSk7XG59XG5cbi8qKlxuICogSW5pdGlhdGVzIGRlc2t0b3AgYnkgYWRkaW5nIG5lY2Vzc2FyeSBldmVudCBsaXN0ZW5lcnMuXG4gKi9cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgbGV0IG5ld1dpbmRvdztcbiAgICBsZXQgY05yID0gMTtcbiAgICBsZXQgbU5yID0gMTtcbiAgICBsZXQgck5yID0gMTtcbiAgICBsZXQgaU5yID0gMTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwibmF2IC5pY29uc1wiKS5mb3JFYWNoKChjdXJyZW50LCBpbmRleCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGluZGV4KXtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IENoYXQoXCJjXCIgKyBjTnIpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cubmFtZS50ZXh0Q29udGVudCA9IFwiQ2hhdFwiO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cuaWNvbi5zcmMgPSBcIi9pbWFnZS9jaGF0LnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICBjTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgTWVtb3J5KFwibVwiICsgbU5yKTtcbiAgICAgICAgICAgICAgICAgICAgbU5yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IFJlbWVtYmVyKFwiclwiICsgck5yKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lm5hbWUudGV4dENvbnRlbnQgPSBcIlJlbWVtYmVyXCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL25vdGVzLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICByTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgRGVza3RvcFdpbmRvdyhcImlcIiArIGlOcik7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5uYW1lLnRleHRDb250ZW50ID0gXCJBcHBsaWNhdGlvbiBpbmZvXCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL2luZm8ucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIGluZm8obmV3V2luZG93KTtcbiAgICAgICAgICAgICAgICAgICAgaU5yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZ2V0RGF0ZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RhdGVcIikpO1xuICAgIGRlc2t0b3BDbG9jayhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Nsb2NrXCIpKTtcbiAgICBzZXRJbnRlcnZhbChkZXNrdG9wQ2xvY2ssIDUwMDApO1xufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgZ2V0Q2xvY2s6IGRlc2t0b3BDbG9jayxcbiAgICBnZXREYXRlOiBnZXREYXRlLFxuICAgIGdldEluZm86IGluZm9cbn07XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgaGFuZGxpbmcgbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogR2V0cyBhbiBpdGVtIGZyb20gbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpdGVtIHRvIGdldC5cbiAqIEByZXR1cm5zIGl0ZW0gLSBUaGUgcmVxdWVzdGVkIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZ2V0KG5hbWUpIHtcbiAgICBpZiAobmFtZSA9PT0gXCJub3Rlc1wiKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKG5hbWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFNldHMgYW4gaXRlbSBpbiBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpdGVtTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpdGVtIHRvIHNldC5cbiAqIEBwYXJhbSBpdGVtIC0gVGhlIGl0ZW0uXG4gKi9cbmZ1bmN0aW9uIHNldChpdGVtTmFtZSwgaXRlbSkge1xuICAgIGlmIChpdGVtTmFtZSA9PT0gXCJub3Rlc1wiKSB7XG4gICAgICAgIGxldCBub3RlcyA9IChnZXQoaXRlbU5hbWUpKSA/IGdldChpdGVtTmFtZSkubm90ZXMgOiBbXTtcbiAgICAgICAgbm90ZXMucHVzaChpdGVtKTtcblxuICAgICAgICBsZXQgYWxsTm90ZXMgPSB7XG4gICAgICAgICAgICBub3Rlczogbm90ZXNcbiAgICAgICAgfTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShpdGVtTmFtZSwgSlNPTi5zdHJpbmdpZnkoYWxsTm90ZXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShpdGVtTmFtZSwgaXRlbSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0OiBzZXQsXG4gICAgZ2V0OiBnZXRcbn07XG4iXX0=
