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

    this.dropdown.addEventListener("click", function(event) {
        event.preventDefault();
        this.restart();
    }.bind(this));

    let links = this.div.querySelectorAll(".menulink")[1].querySelectorAll(".dropdown a");
    links.forEach(function(current) {
        current.addEventListener("click", function(event) {
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
        }.bind(this));
    }.bind(this));
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
    this.images.forEach(function(image, index) {
        a = document.importNode(templateDiv.firstElementChild.firstElementChild, true);
        a.firstElementChild.setAttribute("data-brickNr", index);
        div.appendChild(a);

    });

    div.addEventListener("click", function(event) {
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
            this.turnBrick(this.images[index], index, img);
        }
    }.bind(this));

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
Memory.prototype.turnBrick = function(brickImg, index, img) {
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

            setTimeout(function() {
                this.turn1.parentNode.classList.add("empty");
                this.turn2.parentNode.classList.add("empty");

                this.turn1 = null;
                this.turn2 = null;
            }.bind(this), 400);
        } else {
            setTimeout(function() {
                this.turn1.src = "/image/memory/0.png";
                this.turn2.src = "/image/memory/0.png";

                this.turn1 = null;
                this.turn2 = null;
            }.bind(this), 500);
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
     *
     * @type {Array}
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
    this.div.querySelector("button").addEventListener("click", function() {
        if (!input.value) {
            input.classList.add("redbg");
            this.message.textContent = "You need to write an item for the list.";
        } else {
            input.classList.remove("redbg");
            this.message.textContent = "";
            this.add(input.value);
            input.value = "";
        }
    }.bind(this));

    if (!notFirst) {
        this.setMenu();
        if (storage.get("notes") !== null) {
            this.save(true);
        }

        this.dropdown.textContent = "Save";
        this.dropdown.addEventListener("click", function(event) {
            event.preventDefault();
            if (this.div.querySelectorAll(".note p").length > 1) {
                this.save();
            } else {
                this.message.textContent = "Note is empty.";
            }
        }.bind(this));
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

    dropdownLinks[1].addEventListener("click", function(event) {
        event.preventDefault();
        this.new(true);
    }.bind(this));

    dropdownLinks[2].addEventListener("click", function(event) {
        event.preventDefault();
        localStorage.removeItem("notes");

        let container = newLink.lastElementChild;
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        this.new(true);
    }.bind(this));
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

    let addMenuNote = function() {
        newLink = this.div.querySelectorAll(".menulink")[1];
        let dropdownClone = this.div.querySelectorAll(".menulink")[0].
            querySelector(".dropdown a").cloneNode(true);
        newLink.lastElementChild.appendChild(dropdownClone);

        dropdownLink = newLink.querySelector(".dropdown").lastElementChild;
        dropdownLink.textContent = "Note " + (newLink.querySelectorAll(".dropdown a").length);

        dropdownLink.addEventListener("click", function(event) {
            event.preventDefault();
            let nr = event.target.textContent.charAt(event.target.textContent.length - 1);
            if (nr === 0) {
                nr = 9;
            }

            this.get(nr);
        }.bind(this));
    }.bind(this);

    let notes = (storage.get("notes") === null) ? 0 : storage.get("notes").notes;
    if (oldNotes) {
        notes.forEach(function() {
            addMenuNote();
        }.bind(this));
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

    noteContent.forEach(function(current) {
        let noteElem = this.div.querySelectorAll(".note p")[0].cloneNode(true);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZW1lbWJlci5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9sb2NhbHN0b3JhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBNb2R1bGUgZm9yIENoYXQuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcbmNvbnN0IHN0b3JhZ2UgPSByZXF1aXJlKFwiLi9sb2NhbHN0b3JhZ2VcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIENoYXQuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gQ2hhdChpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgdXNlci4gXCJVbmtub3duXCIgYnkgZGVmYXVsdC5cbiAgICAgKi9cbiAgICB0aGlzLnVzZXIgPSBcIlVua25vd25cIjtcblxuICAgIC8qKlxuICAgICAqIFRoZSB3ZWIgc29ja2V0IGZvciB0aGUgY2hhdC5cbiAgICAgKi9cbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiKTtcblxuICAgIHRoaXMub3BlbigpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5DaGF0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGVza3RvcFdpbmRvdy5wcm90b3R5cGUpO1xuQ2hhdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGF0O1xuXG4vKipcbiAqIEluaXRpYXRlcyB0aGUgYXBwbGljYXRpb24uXG4gKi9cbkNoYXQucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXRcIikuY29udGVudDtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUsIHRydWUpO1xuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuICAgIGxldCBtZXNzYWdlSW5wdXQgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNoYXRNZXNzYWdlXCIpO1xuICAgIGxldCB1c2VySW5mbyA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIudXNlclwiKTtcbiAgICB0aGlzLmdldFVzZXIodXNlckluZm8pO1xuXG4gICAgbWVzc2FnZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5lbW9qaXMobWVzc2FnZUlucHV0KTtcblxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMgfHwgZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy51c2VyICE9PSBcIlVua25vd25cIikge1xuICAgICAgICAgICAgICAgIGlmICghbWVzc2FnZUlucHV0LnZhbHVlIHx8IG1lc3NhZ2VJbnB1dC52YWx1ZS50cmltKCkgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJXcml0ZSB5b3VyIG1lc3NhZ2UuXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kKG1lc3NhZ2VJbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJbnB1dC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1c2VySW5mby5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuYWRkKFwicmVkYmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIChldmVudCkgPT4ge1xuICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG5cbiAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gXCJtZXNzYWdlXCIgfHwgZGF0YS50eXBlID09PSBcIm5vdGlmaWNhdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzLnJlY2VpdmUoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgdXNlciBmb3IgdGhlIGNoYXQgYXBwbGljYXRpb24uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBkaXYgLSBUaGUgZGl2IGhvbGRpbmcgdGhlIHVzZXIgaW5mb3JtYXRpb24uXG4gKi9cbkNoYXQucHJvdG90eXBlLmdldFVzZXIgPSBmdW5jdGlvbihkaXYpIHtcbiAgICBsZXQgaW5wdXQgPSBkaXYuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgbGV0IGJ1dHRvbiA9IGRpdi5sYXN0RWxlbWVudENoaWxkO1xuXG4gICAgbGV0IHJlbW92ZVVzZXJFbGVtID0gKCkgPT4ge1xuICAgICAgICBkaXYucmVtb3ZlQ2hpbGQoaW5wdXQpO1xuICAgICAgICBkaXYucmVtb3ZlQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJsb2dnZWRJblwiKTtcbiAgICAgICAgZGl2LnRleHRDb250ZW50ID0gXCJMb2dnZWQgaW4gYXMgXCIgKyB0aGlzLnVzZXI7XG4gICAgfTtcblxuICAgIGxldCBnZXRVc2VybmFtZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKGRpdi5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy51c2VyID0gZGl2LmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICAgICAgaW5wdXQuY2xhc3NMaXN0LnJlbW92ZShcInJlZGJnXCIpO1xuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgcmVtb3ZlVXNlckVsZW0oKTtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KFwidXNlcm5hbWVcIiwgdGhpcy51c2VyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoIXN0b3JhZ2UuZ2V0KFwidXNlcm5hbWVcIikpIHtcbiAgICAgICAgZGl2Lmxhc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldFVzZXJuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVzZXIgPSBzdG9yYWdlLmdldChcInVzZXJuYW1lXCIpO1xuICAgICAgICByZW1vdmVVc2VyRWxlbSgpO1xuICAgIH1cblxuICAgIHRoaXMuZHJvcGRvd24udGV4dENvbnRlbnQgPSBcIkNoYW5nZSB1c2VyXCI7XG4gICAgdGhpcy5kcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IFwiVXNlcjogXCI7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QucmVtb3ZlKFwibG9nZ2VkSW5cIik7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB0aGlzLnVzZXIgPSBcIlVua25vd25cIjtcbiAgICAgICAgZGl2Lmxhc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldFVzZXJuYW1lKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogU2VuZHMgdHlwZWQgaW4gbWVzc2FnZXMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IC0gVGhlIGlucHV0IG1lc3NhZ2UgZnJvbSB0aGUgdGV4dGFyZWEuXG4gKi9cbkNoYXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgZGF0YTogaW5wdXQsXG4gICAgICAgIHVzZXJuYW1lOiB0aGlzLnVzZXIsXG4gICAgICAgIGtleTogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xufTtcblxuLyoqXG4gKiBSZWNlaXZlcyBhbmQgZGlzcGxheXMgbWVzc2FnZXMgaW4gYXBwbGljYXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSBUaGUgcmVjZWl2ZWQgZGF0YS5cbiAqL1xuQ2hhdC5wcm90b3R5cGUucmVjZWl2ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlQ29udGFpbmVyXCIpO1xuXG4gICAgbGV0IHVzZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICB1c2VyLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwidXNlcm5hbWVcIik7XG4gICAgdXNlci5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhLnVzZXJuYW1lKSk7XG4gICAgbGV0IHBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgcEVsZW0uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YS5kYXRhKSk7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodXNlcik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHBFbGVtKTtcblxuICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gY29udGFpbmVyLmNsaWVudEhlaWdodDtcbn07XG5cbi8qKlxuICogUmVwbGFjZXMgY2VydGFpbiBjaGFyYWN0ZXIgY29tYmluYXRpb25zIHdpdGggZW1vamlzLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdXNlciBpbnB1dC5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuZW1vamlzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGxldCBlbW9qaXMgPSB7XG4gICAgICAgIFwiOilcIjogXCJcXHVEODNEXFx1REUwQVwiLFxuICAgICAgICBcIjspXCI6IFwiXFx1RDgzRFxcdURFMDlcIixcbiAgICAgICAgXCI6RFwiOiBcIlxcdUQ4M0RcXHVERTAzXCIsXG4gICAgICAgIFwiOlBcIjogXCJcXHVEODNEXFx1REUxQlwiLFxuICAgICAgICBcIjtQXCI6IFwiXFx1RDgzRFxcdURFMUNcIixcbiAgICAgICAgXCI6L1wiOiBcIlxcdUQ4M0RcXHVERTE1XCIsXG4gICAgICAgIFwiOihcIjogXCJcXHVEODNEXFx1REUxRVwiLFxuICAgICAgICBcIjonKFwiOiBcIlxcdUQ4M0RcXHVERTIyXCIsXG4gICAgICAgIFwiKHkpXCI6IFwiXFx1RDgzRFxcdURDNERcIixcbiAgICAgICAgXCI8M1wiOiBcIlxcdTI3NjRcXHVGRTBGXCJcbiAgICB9O1xuXG4gICAgZm9yIChsZXQgaSBpbiBlbW9qaXMpIHtcbiAgICAgICAgZWxlbWVudC52YWx1ZSA9IGVsZW1lbnQudmFsdWUucmVwbGFjZShpLCBlbW9qaXNbaV0pO1xuICAgIH1cbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7Q2hhdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIERlc2t0b3BXaW5kb3cuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgd2luZG93IHRvIGNyZWF0ZS5cbiAqIEB0aHJvd3Mge0Vycm9yfSAtIFdpbmRvdyBtdXN0IGhhdmUgYW4gaWQuXG4gKi9cbmZ1bmN0aW9uIERlc2t0b3BXaW5kb3coaWQpIHtcbiAgICBpZiAoIWlkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIldpbmRvdyBtdXN0IGhhdmUgYW4gaWQuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIHRvcC1uYW1lLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I25hbWVcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJuYW1lXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5hbWVcIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIHRvcC1uYW1lLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2ljb25cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpY29uXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmxvZ29cIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIGZvb3RlciBtZXNzYWdlIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjbWVzc2FnZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIm1lc3NhZ2VcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWZvb3RlclwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgZHJvcGRvd24gbGluayBpbiBtZW51LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2Ryb3Bkb3duXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZHJvcGRvd25cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKVswXTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgY3VycmVudCBEZXNrdG9wV2luZG93LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2RpdlxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImRpdlwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIGlkLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjaWRcbiAgICAgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IC0gTXVzdCBiZSBhIHN0cmluZy5cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpZFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIldpbmRvdyBpZCBtdXN0IGJlIGEgc3RyaW5nLlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmNyZWF0ZSgpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgd2luZG93IGZyb20gdGVtcGxhdGUuXG4gKi9cbkRlc2t0b3BXaW5kb3cucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93XCIpO1xuICAgIGxldCB3aW5kb3dEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVza3RvcFwiKS5hcHBlbmRDaGlsZCh3aW5kb3dEaXYpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdW5jbGFpbWVkXCIpLmlkID0gdGhpcy5pZDtcblxuICAgIGxldCBpZCA9IHRoaXMuaWQudG9TdHJpbmcoKTtcblxuICAgIHRoaXMucG9zaXRpb24oaWQpO1xuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQoKTtcblxuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmRpdiAhPT0gdGhpcy5kaXYucGFyZW50Tm9kZS5sYXN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgICAgICB0aGlzLmRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMuZGl2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCJ0ZXh0YXJlYVwiKSB8fFxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0ID09PSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIikpIHtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICAgICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFBvc2l0aW9ucyB0aGUgd2luZG93IGluIHRoZSBkZXNrdG9wLCBzdGFja3MgaWYgbmVjZXNzYXJ5LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgd2luZG93LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgbGV0IHN0YWNrV2luZG93cyA9IChhcHApID0+IHtcbiAgICAgICAgaWYgKGlkLmluZGV4T2YoXCIxXCIpID09PSAtMSkge1xuICAgICAgICAgICAgbGV0IGlkTnIgPSBpZC5jaGFyQXQoMSkgLSAxO1xuICAgICAgICAgICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFwcCArIGlkTnIpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGVsZW1lbnRCZWZvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhcHAgKyBpZE5yKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRUb3AgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IChlbGVtZW50QmVmb3JlLm9mZnNldExlZnQgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKGlkLmluZGV4T2YoXCJjXCIpICE9PSAtMSkge1xuICAgICAgICBzdGFja1dpbmRvd3MoXCJjXCIpO1xuICAgIH0gZWxzZSBpZiAoaWQuaW5kZXhPZihcIm1cIikgIT09IC0xKSB7XG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAodGhpcy5kaXYub2Zmc2V0TGVmdCArIDIwMCkgKyBcInB4XCI7XG4gICAgICAgIHN0YWNrV2luZG93cyhcIm1cIik7XG4gICAgfSBlbHNlIGlmIChpZC5pbmRleE9mKFwiclwiKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9ICh0aGlzLmRpdi5vZmZzZXRMZWZ0ICsgNDAwKSArIFwicHhcIjtcbiAgICAgICAgc3RhY2tXaW5kb3dzKFwiclwiKTtcbiAgICB9IGVsc2UgaWYgKGlkLmluZGV4T2YoXCJpXCIpICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gKHRoaXMuZGl2Lm9mZnNldExlZnQgKyA2MDApICsgXCJweFwiO1xuICAgICAgICBzdGFja1dpbmRvd3MoXCJpXCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBkcmFnZ2luZyBtb3ZlbWVudHMgb2YgdGhlIHdpbmRvdy5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUuaGFuZGxlTW92ZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgcG9zWCA9IDA7XG4gICAgbGV0IHBvc1kgPSAwO1xuXG4gICAgbGV0IHNjcm9sbFVwID0gKCkgPT4ge1xuICAgICAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlQ29udGFpbmVyXCIpO1xuICAgICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodCAtIGNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbGV0IG1vdmVXaW5kb3cgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUudG9wID0gKGV2ZW50LmNsaWVudFkgLSBwb3NZKSArIFwicHhcIjtcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IChldmVudC5jbGllbnRYIC0gcG9zWCkgKyBcInB4XCI7XG4gICAgICAgIHNjcm9sbFVwKHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUNvbnRhaW5lclwiKSk7XG4gICAgfTtcblxuICAgIGxldCBnZXRQb3NpdGlvbiA9IChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VcIikpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UodGhpcy5kaXYpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5taW5pbWl6ZVwiKSkge1xuICAgICAgICAgICAgdGhpcy5taW5pbWl6ZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kaXYucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLmRpdik7XG4gICAgICAgIHBvc1ggPSBldmVudC5jbGllbnRYIC0gdGhpcy5kaXYub2Zmc2V0TGVmdDtcbiAgICAgICAgcG9zWSA9IGV2ZW50LmNsaWVudFkgLSB0aGlzLmRpdi5vZmZzZXRUb3A7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVXaW5kb3cpO1xuICAgICAgICBzY3JvbGxVcCgpO1xuICAgIH07XG5cbiAgICB0aGlzLmRpdi5maXJzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGdldFBvc2l0aW9uKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVXaW5kb3cpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBNaW5pbWl6ZXMgd2luZG93LCBvciBtYXhpbWl6ZXMgaWYgY2xpY2tlZCBvbiB0aGUgcmVmZXJlbmNlLlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5taW5pbWl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZGl2LnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuXG4gICAgbGV0IGFUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhVGFnLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCIjXCIpO1xuXG4gICAgbGV0IGFkZFdpbmRvdyA9IChpY29uTWVudSwgYXBwKSA9PiB7XG4gICAgICAgIGljb25NZW51LmFwcGVuZENoaWxkKGFUYWcpO1xuICAgICAgICBpY29uTWVudS5jbGFzc0xpc3QuYWRkKFwibWluaW1pemVkXCIpO1xuICAgICAgICBpY29uTWVudS5sYXN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gYXBwICsgXCIgXCIgKyAodGhpcy5pZC5jaGFyQXQoMSkpO1xuXG4gICAgICAgIGljb25NZW51Lmxhc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgICAgIGljb25NZW51LnJlbW92ZUNoaWxkKGV2ZW50LnRhcmdldCk7XG5cbiAgICAgICAgICAgIGlmICghaWNvbk1lbnUuZmlyc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICBpY29uTWVudS5jbGFzc0xpc3QucmVtb3ZlKFwibWluaW1pemVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgbGV0IGljb25NZW51cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJuYXYgLmljb24tbWVudVwiKTtcblxuICAgIGlmICh0aGlzLmlkLmluZGV4T2YoXCJjXCIpICE9PSAtMSkge1xuICAgICAgICBhZGRXaW5kb3coaWNvbk1lbnVzWzBdLCBcIkNoYXRcIik7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlkLmluZGV4T2YoXCJtXCIpICE9PSAtMSkge1xuICAgICAgICBhZGRXaW5kb3coaWNvbk1lbnVzWzFdLCBcIk1lbW9yeVwiKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaWQuaW5kZXhPZihcInJcIikgIT09IC0xKSB7XG4gICAgICAgIGFkZFdpbmRvdyhpY29uTWVudXNbMl0sIFwiUmVtZW1iZXJcIik7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlkLmluZGV4T2YoXCJpXCIpICE9PSAtMSkge1xuICAgICAgICBhZGRXaW5kb3coaWNvbk1lbnVzWzNdLCBcIkluZm9cIik7XG4gICAgfVxufTtcblxuLyoqXG4gKiBDbG9zZXMgdGhlIHdpbmRvdy5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgLSBUaGUgZWxlbWVudCB3aW5kb3cgdG8gY2xvc2UuXG4gKi9cbkRlc2t0b3BXaW5kb3cucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtZW50KTtcblxuICAgIGlmICh0aGlzLnNvY2tldCkge1xuICAgICAgICB0aGlzLnNvY2tldC5jbG9zZSgpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBEZXNrdG9wV2luZG93O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIE1lbW9yeS5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERlc2t0b3BXaW5kb3cgPSByZXF1aXJlKFwiLi9EZXNrdG9wV2luZG93XCIpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYSBNZW1vcnkgZ2FtZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgd2luZG93LlxuICovXG5mdW5jdGlvbiBNZW1vcnkoaWQpIHtcbiAgICBEZXNrdG9wV2luZG93LmNhbGwodGhpcywgaWQpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNpemUgb2YgdGhlIGJvYXJkLlxuICAgICAqL1xuICAgIHRoaXMuc2l6ZSA9IDE2O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGFycmF5IHRvIGNvbnRhaW4gdGhlIGJyaWNrIGltYWdlcy5cbiAgICAgKi9cbiAgICB0aGlzLmltYWdlcyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGZpcnN0IHR1cm5lZCBicmljay5cbiAgICAgKi9cbiAgICB0aGlzLnR1cm4xID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzZWNvbmQgdHVybmVkIGJyaWNrLlxuICAgICAqL1xuICAgIHRoaXMudHVybjIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBwYWlycy5cbiAgICAgKi9cbiAgICB0aGlzLnBhaXJzID0gMDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgY2xpY2tzLlxuICAgICAqL1xuICAgIHRoaXMubnJPZkNsaWNrcyA9IDA7XG5cbiAgICB0aGlzLnN0YXJ0KCk7XG59XG5cbi8qKlxuICogSGFuZGxlcyBpbmhlcml0YW5jZSBmcm9tIERlc2t0b3BXaW5kb3cuXG4gKlxuICogQHR5cGUge0Rlc2t0b3BXaW5kb3d9XG4gKi9cbk1lbW9yeS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlc2t0b3BXaW5kb3cucHJvdG90eXBlKTtcbk1lbW9yeS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNZW1vcnk7XG5cbi8qKlxuICogU3RhcnRzIHRoZSBnYW1lIGFuZCBhZGRzIGV2ZW50IGxpc3RlbmVycy5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2h1ZmZsZSgpO1xuICAgIHRoaXMuc2V0U2l6ZSgpO1xuICAgIHRoaXMuc2V0TWVudSgpO1xuXG4gICAgdGhpcy5kcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5yZXN0YXJ0KCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGxldCBsaW5rcyA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMV0ucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpO1xuICAgIGxpbmtzLmZvckVhY2goZnVuY3Rpb24oY3VycmVudCkge1xuICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQudGFyZ2V0LnRleHRDb250ZW50KSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIjN4MlwiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSA2O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiNHgzXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDEyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiNHg0XCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDE2O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yZXN0YXJ0KCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8qKlxuICogU2V0cyBlbGVtZW50cyBmb3IgdGhlIGRyb3AtZG93biBtZW51IHRvIGFsbG93IGNoYW5naW5nIHNpemUgb2YgdGhlIGJvYXJkLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnNldE1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVudWxpbmtcIik7XG4gICAgbGV0IG1lbnVDbG9uZSA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIGVsZW1lbnQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChtZW51Q2xvbmUpO1xuXG4gICAgbGV0IG5ld0xpbmsgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzFdO1xuICAgIG5ld0xpbmsuZmlyc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBcIlNpemVcIjtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjsgaSArPSAxKSB7XG4gICAgICAgIGxldCBkcm9wZG93bkNsb25lID0gbmV3TGluay5xdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duIGFcIikuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBuZXdMaW5rLmxhc3RFbGVtZW50Q2hpbGQuYXBwZW5kQ2hpbGQoZHJvcGRvd25DbG9uZSk7XG4gICAgfVxuXG4gICAgbGV0IGRyb3Bkb3duTGlua3MgPSBuZXdMaW5rLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKTtcbiAgICBkcm9wZG93bkxpbmtzWzBdLnRleHRDb250ZW50ID0gXCIzeDJcIjtcbiAgICBkcm9wZG93bkxpbmtzWzFdLnRleHRDb250ZW50ID0gXCI0eDNcIjtcbiAgICBkcm9wZG93bkxpbmtzWzJdLnRleHRDb250ZW50ID0gXCI0eDRcIjtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgc2l6ZSBvZiB0aGUgYm9hcmQuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc2V0U2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wbGF0ZURpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5XCIpLmNvbnRlbnQ7XG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQsIGZhbHNlKTtcbiAgICBsZXQgcmVzdWx0RWxlbSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYubGFzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKHRoaXMuc2l6ZSkge1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImJvYXJkNlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDEyXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImJvYXJkMTZcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBsZXQgYTtcbiAgICB0aGlzLmltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlLCBpbmRleCkge1xuICAgICAgICBhID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuc2V0QXR0cmlidXRlKFwiZGF0YS1icmlja05yXCIsIGluZGV4KTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGEpO1xuXG4gICAgfSk7XG5cbiAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgbGV0IGltZztcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSBcIkFcIikge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICAgICAgICAgIGltZyA9IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSBcIklNR1wiKSB7XG4gICAgICAgICAgICBpbWcgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW1nKSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbWcuZ2V0QXR0cmlidXRlKFwiZGF0YS1icmlja05yXCIpKTtcbiAgICAgICAgICAgIHRoaXMudHVybkJyaWNrKHRoaXMuaW1hZ2VzW2luZGV4XSwgaW5kZXgsIGltZyk7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFwcGVuZENoaWxkKGRpdik7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFwcGVuZENoaWxkKHJlc3VsdEVsZW0pO1xufTtcblxuLyoqXG4gKiBTaHVmZmxlcyB0aGUgYXJyYXkgd2l0aCBpbWFnZXMuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc2h1ZmZsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW1hZ2VzID0gWzEsMSwyLDIsMywzLDQsNCw1LDUsNiw2LDcsNyw4LDhdO1xuXG4gICAgbGV0IGluZGV4VG9Td2FwO1xuICAgIGxldCB0ZW1wSW1nO1xuICAgIGxldCBpbWdzO1xuXG4gICAgc3dpdGNoICh0aGlzLnNpemUpIHtcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgaW1ncyA9IHRoaXMuaW1hZ2VzLnNsaWNlKDAsIDYpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBpbWdzID0gdGhpcy5pbWFnZXMuc2xpY2UoMCwgMTIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICBpbWdzID0gdGhpcy5pbWFnZXM7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IHRoaXMuc2l6ZSAtIDE7IGkgPiAwOyBpIC09IDEpIHtcbiAgICAgICAgaW5kZXhUb1N3YXAgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKTtcbiAgICAgICAgdGVtcEltZyA9IGltZ3NbaV07XG4gICAgICAgIGltZ3NbaV0gPSBpbWdzW2luZGV4VG9Td2FwXTtcbiAgICAgICAgaW1nc1tpbmRleFRvU3dhcF0gPSB0ZW1wSW1nO1xuICAgIH1cblxuICAgIHRoaXMuaW1hZ2VzID0gaW1ncztcbn07XG5cbi8qKlxuICogSGFuZGxlcyB0aGUgZXZlbnQgb2YgdHVybmluZyBhIGJyaWNrLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBicmlja0ltZyAtIFRoZSBpbWFnZSBvZiB0aGUgdHVybmVkIGJyaWNrLlxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSB0dXJuZWQgYnJpY2suXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGltZyAtIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGJyaWNrLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnR1cm5CcmljayA9IGZ1bmN0aW9uKGJyaWNrSW1nLCBpbmRleCwgaW1nKSB7XG4gICAgaWYgKHRoaXMudHVybjIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGltZy5zcmMgPSBcIi9pbWFnZS9tZW1vcnkvXCIgKyBicmlja0ltZyArIFwiLnBuZ1wiO1xuXG4gICAgaWYgKCF0aGlzLnR1cm4xKSB7XG4gICAgICAgIHRoaXMudHVybjEgPSBpbWc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGltZyA9PT0gdGhpcy50dXJuMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uck9mQ2xpY2tzICs9IDE7XG4gICAgICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIudHJpZXNcIikudGV4dENvbnRlbnQgPSB0aGlzLm5yT2ZDbGlja3MudG9TdHJpbmcoKTtcblxuICAgICAgICB0aGlzLnR1cm4yID0gaW1nO1xuICAgICAgICBpZiAodGhpcy50dXJuMS5zcmMgPT09IHRoaXMudHVybjIuc3JjKSB7XG4gICAgICAgICAgICB0aGlzLnBhaXJzICs9IDE7XG4gICAgICAgICAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLnBhaXJzXCIpLnRleHRDb250ZW50ID0gdGhpcy5wYWlycy50b1N0cmluZygpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYWlycyA9PT0gdGhpcy5zaXplIC8gMikge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5kR2FtZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjEucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwiZW1wdHlcIik7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMi5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJlbXB0eVwiKTtcblxuICAgICAgICAgICAgICAgIHRoaXMudHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIgPSBudWxsO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA0MDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4xLnNyYyA9IFwiL2ltYWdlL21lbW9yeS8wLnBuZ1wiO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIuc3JjID0gXCIvaW1hZ2UvbWVtb3J5LzAucG5nXCI7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNTAwKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRW5kcyB0aGUgZ2FtZSBhbmQgZGlzcGxheXMgbWVzc2FnZS5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5lbmRHYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IG1lc3NhZ2UgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VcIik7XG5cbiAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gXCJZb3UgZmluaXNoZWQgdGhlIGdhbWUhXCI7XG59O1xuXG4vKipcbiAqIFJlc3RhcnRzIGFuZCBjbGVhcnMgdGhlIE1lbW9yeSBnYW1lLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHRoaXMucGFpcnMgPSAwO1xuICAgIHRoaXMubnJPZkNsaWNrcyA9IDA7XG4gICAgdGhpcy5zaHVmZmxlKCk7XG4gICAgdGhpcy5zZXRTaXplKCk7XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge01lbW9yeX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnk7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgUmVtZW1iZXIgYXBwbGljYXRpb24uXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcbmNvbnN0IHN0b3JhZ2UgPSByZXF1aXJlKFwiLi9sb2NhbHN0b3JhZ2VcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBSZW1lbWJlci5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSBpZFxuICovXG5mdW5jdGlvbiBSZW1lbWJlcihpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXJyYXkgdG8gaG9sZCB0aGUgbm90ZXMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICovXG4gICAgdGhpcy5ub3RlcyA9IFtdO1xuXG4gICAgdGhpcy5uZXcoKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNrdG9wV2luZG93LnByb3RvdHlwZSk7XG5SZW1lbWJlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZW1lbWJlcjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG5vdGUuXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBub3RGaXJzdCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjcmVhdGVkIG5vdGUgaXMgdGhlIGZpcnN0IG9yIG5vdC5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLm5ldyA9IGZ1bmN0aW9uKG5vdEZpcnN0KSB7XG4gICAgaWYgKG5vdEZpcnN0KSB7XG4gICAgICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG4gICAgICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubm90ZXMgPSBbXTtcbiAgICB9XG5cbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JlbWVtYmVyXCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLCB0cnVlKTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICBsZXQgaW5wdXQgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5vdGUtaW5wdXRcIik7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcImJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghaW5wdXQudmFsdWUpIHtcbiAgICAgICAgICAgIGlucHV0LmNsYXNzTGlzdC5hZGQoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiWW91IG5lZWQgdG8gd3JpdGUgYW4gaXRlbSBmb3IgdGhlIGxpc3QuXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dC5jbGFzc0xpc3QucmVtb3ZlKFwicmVkYmdcIik7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgdGhpcy5hZGQoaW5wdXQudmFsdWUpO1xuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGlmICghbm90Rmlyc3QpIHtcbiAgICAgICAgdGhpcy5zZXRNZW51KCk7XG4gICAgICAgIGlmIChzdG9yYWdlLmdldChcIm5vdGVzXCIpICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmUodHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRyb3Bkb3duLnRleHRDb250ZW50ID0gXCJTYXZlXCI7XG4gICAgICAgIHRoaXMuZHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubm90ZSBwXCIpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJOb3RlIGlzIGVtcHR5LlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cbn07XG5cbi8qKlxuICogU2V0cyB0aGUgZGlmZmVyZW50IGRyb3Bkb3duIG1lbnVzLlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUuc2V0TWVudSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBlbGVtZW50ID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZW51bGlua1wiKTtcbiAgICBsZXQgbWVudUNsb25lID0gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgZWxlbWVudC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKG1lbnVDbG9uZSk7XG5cbiAgICBsZXQgbmV3TGluayA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMV07XG4gICAgbmV3TGluay5maXJzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IFwiTm90ZXNcIjtcbiAgICBuZXdMaW5rLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd25cIikucmVtb3ZlQ2hpbGQobmV3TGluay5xdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duIGFcIikpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyOyBpICs9IDEpIHtcbiAgICAgICAgbGV0IGRyb3Bkb3duQ2xvbmUgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzBdLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd24gYVwiKS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMF0ubGFzdEVsZW1lbnRDaGlsZC5hcHBlbmRDaGlsZChkcm9wZG93bkNsb25lKTtcbiAgICB9XG5cbiAgICBsZXQgZHJvcGRvd25MaW5rcyA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMF0ucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpO1xuICAgIGRyb3Bkb3duTGlua3NbMV0udGV4dENvbnRlbnQgPSBcIk5ld1wiO1xuICAgIGRyb3Bkb3duTGlua3NbMl0udGV4dENvbnRlbnQgPSBcIkRlbGV0ZSBBbGxcIjtcblxuICAgIGRyb3Bkb3duTGlua3NbMV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMubmV3KHRydWUpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICBkcm9wZG93bkxpbmtzWzJdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcIm5vdGVzXCIpO1xuXG4gICAgICAgIGxldCBjb250YWluZXIgPSBuZXdMaW5rLmxhc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubmV3KHRydWUpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG4vKipcbiAqIEFkZHMgaW5wdXQgdG8gdGhlIG5vdGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IC0gVXNlciBpbnB1dCBmcm9tIGVsZW1lbnQuXG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgIGxldCBub3RlRWxlbSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubm90ZSBwXCIpWzBdLmNsb25lTm9kZSh0cnVlKTtcbiAgICBub3RlRWxlbS50ZXh0Q29udGVudCA9IGlucHV0O1xuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubm90ZVwiKS5hcHBlbmRDaGlsZChub3RlRWxlbSk7XG5cbiAgICB0aGlzLm5vdGVzLnB1c2goaW5wdXQpO1xufTtcblxuLyoqXG4gKiBTYXZlcyBjdXJyZW50IG5vdGUgdG8gbG9jYWwgc3RvcmFnZSBvciBnZXRzIG9sZCBub3Rlcy5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9sZE5vdGVzIC0gV2hldGhlciBvciBub3QgdGhlcmUgYXJlIG9sZCBub3RlcyBpbiBsb2NhbCBzdG9yYWdlLlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uKG9sZE5vdGVzKSB7XG4gICAgbGV0IG5ld0xpbms7XG4gICAgbGV0IGRyb3Bkb3duTGluaztcblxuICAgIGxldCBhZGRNZW51Tm90ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBuZXdMaW5rID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXTtcbiAgICAgICAgbGV0IGRyb3Bkb3duQ2xvbmUgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzBdLlxuICAgICAgICAgICAgcXVlcnlTZWxlY3RvcihcIi5kcm9wZG93biBhXCIpLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgbmV3TGluay5sYXN0RWxlbWVudENoaWxkLmFwcGVuZENoaWxkKGRyb3Bkb3duQ2xvbmUpO1xuXG4gICAgICAgIGRyb3Bkb3duTGluayA9IG5ld0xpbmsucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93blwiKS5sYXN0RWxlbWVudENoaWxkO1xuICAgICAgICBkcm9wZG93bkxpbmsudGV4dENvbnRlbnQgPSBcIk5vdGUgXCIgKyAobmV3TGluay5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIikubGVuZ3RoKTtcblxuICAgICAgICBkcm9wZG93bkxpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbGV0IG5yID0gZXZlbnQudGFyZ2V0LnRleHRDb250ZW50LmNoYXJBdChldmVudC50YXJnZXQudGV4dENvbnRlbnQubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICBpZiAobnIgPT09IDApIHtcbiAgICAgICAgICAgICAgICBuciA9IDk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZ2V0KG5yKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICBsZXQgbm90ZXMgPSAoc3RvcmFnZS5nZXQoXCJub3Rlc1wiKSA9PT0gbnVsbCkgPyAwIDogc3RvcmFnZS5nZXQoXCJub3Rlc1wiKS5ub3RlcztcbiAgICBpZiAob2xkTm90ZXMpIHtcbiAgICAgICAgbm90ZXMuZm9yRWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFkZE1lbnVOb3RlKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5vdGVzID09PSAwIHx8IG5vdGVzLmxlbmd0aCA8PSA0KSB7XG4gICAgICAgICAgICBzdG9yYWdlLnNldChcIm5vdGVzXCIsIHRoaXMubm90ZXMpO1xuICAgICAgICAgICAgYWRkTWVudU5vdGUoKTtcbiAgICAgICAgICAgIHRoaXMubmV3KHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJZb3UgYWxyZWFkeSBoYXZlIDUgc2F2ZWQgbm90ZXMuXCI7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIGl0ZW0gdGhhdCB3YXMgY2xpY2tlZCBvbiBmcm9tIGxpc3QuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5yIC0gVGhlIG51bWJlciBvZiB0aGUgY2xpY2tlZCBpdGVtIGluIGxvY2FsIHN0b3JhZ2UgYXJyYXkuXG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihucikge1xuICAgIGxldCBub3RlcyA9IHN0b3JhZ2UuZ2V0KFwibm90ZXNcIikubm90ZXM7XG4gICAgbGV0IG5vdGVDb250ZW50ID0gbm90ZXNbKG5yIC0gMSldO1xuXG4gICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubm90ZVwiKTtcbiAgICB3aGlsZSAoY29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JlbWVtYmVyXCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICBub3RlQ29udGVudC5mb3JFYWNoKGZ1bmN0aW9uKGN1cnJlbnQpIHtcbiAgICAgICAgbGV0IG5vdGVFbGVtID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5ub3RlIHBcIilbMF0uY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBub3RlRWxlbS50ZXh0Q29udGVudCA9IGN1cnJlbnQ7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub3RlRWxlbSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7UmVtZW1iZXJ9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gUmVtZW1iZXI7XG4iLCIvKipcbiAqIFN0YXJ0IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuY29uc3QgZGVza3RvcCA9IHJlcXVpcmUoXCIuL2Rlc2t0b3BcIik7XG5cbmRlc2t0b3AuaW5pdCgpO1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIGRlc2t0b3AuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERlc2t0b3BXaW5kb3cgPSByZXF1aXJlKFwiLi9EZXNrdG9wV2luZG93XCIpO1xuY29uc3QgQ2hhdCA9IHJlcXVpcmUoXCIuL0NoYXRcIik7XG5jb25zdCBNZW1vcnkgPSByZXF1aXJlKFwiLi9NZW1vcnlcIik7XG5jb25zdCBSZW1lbWJlciA9IHJlcXVpcmUoXCIuL1JlbWVtYmVyXCIpO1xuXG4vKipcbiAqIEdldHMgdGhlIGN1cnJlbnQgdGltZSBhbmQgcHJlc2VudHMgaXQgaW4gdGhlIGdpdmVuIGNvbnRhaW5lci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciAtIFRoZSBjb250YWluZXIgb2YgdGhlIGNsb2NrLlxuICovXG5mdW5jdGlvbiBkZXNrdG9wQ2xvY2soY29udGFpbmVyKSB7XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjbG9ja1wiKTtcbiAgICB9XG5cbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBob3VycyA9IHRvZGF5LmdldEhvdXJzKCk7XG4gICAgbGV0IG1pbnMgPSB0b2RheS5nZXRNaW51dGVzKCk7XG5cbiAgICBpZiAobWlucyA8IDEwKSB7XG4gICAgICAgIG1pbnMgPSBcIjBcIiArIG1pbnM7XG4gICAgfVxuXG4gICAgaWYgKGhvdXJzIDwgMTApIHtcbiAgICAgICAgaG91cnMgPSBcIjBcIiArIGhvdXJzO1xuICAgIH1cblxuICAgIGNvbnRhaW5lci50ZXh0Q29udGVudCA9IGhvdXJzICsgXCI6XCIgKyBtaW5zO1xufVxuXG4vKipcbiAqIEdldHMgdG9kYXkncyBkYXRlIGFuZCBwcmVzZW50cyBpdCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIC0gVGhlIGNvbnRhaW5lciBvZiB0aGUgY2xvY2suXG4gKi9cbmZ1bmN0aW9uIGdldERhdGUoY29udGFpbmVyKSB7XG4gICAgbGV0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBsZXQgbW9udGggPSBbXCJqYW5cIiwgXCJmZWJcIiwgXCJtYXJcIiwgXCJhcHJcIiwgXCJtYXlcIiwgXCJqdW5lXCIsIFwianVseVwiLCBcImF1Z1wiLCBcInNlcHRcIiwgXCJvY3RcIiwgXCJub3ZcIiwgXCJkZWNcIl07XG4gICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gdG9kYXkuZ2V0RGF0ZSgpICsgXCIgXCIgKyBtb250aFt0b2RheS5nZXRNb250aCgpXSArIFwiIFwiICsgdG9kYXkuZ2V0RnVsbFllYXIoKTtcbn1cblxuLyoqXG4gKiBHZXRzIGFwcGxpY2F0aW9uIGluZm9ybWF0aW9uIGZvciBpbmZvIHdpbmRvdy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHRvIGRpc3BsYXkgdGhlIGluZm9ybWF0aW9uIGluLlxuICovXG5mdW5jdGlvbiBpbmZvKGVsZW1lbnQpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luZm9cIikuY29udGVudDtcbiAgICBsZXQgY29udGFpbmVyID0gZWxlbWVudC5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUsIHRydWUpKTtcbiAgICBsZXQgbWVudSA9IGVsZW1lbnQuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVudVwiKTtcbiAgICBtZW51LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobWVudSk7XG59XG5cbi8qKlxuICogSW5pdGlhdGVzIGRlc2t0b3AgYnkgYWRkaW5nIG5lY2Vzc2FyeSBldmVudCBsaXN0ZW5lcnMuXG4gKi9cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgbGV0IG5ld1dpbmRvdztcbiAgICBsZXQgY05yID0gMTtcbiAgICBsZXQgbU5yID0gMTtcbiAgICBsZXQgck5yID0gMTtcbiAgICBsZXQgaU5yID0gMTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwibmF2IC5pY29uc1wiKS5mb3JFYWNoKChjdXJyZW50LCBpbmRleCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGluZGV4KXtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IENoYXQoXCJjXCIgKyBjTnIpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cubmFtZS50ZXh0Q29udGVudCA9IFwiQ2hhdFwiO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cuaWNvbi5zcmMgPSBcIi9pbWFnZS9jaGF0LnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICBjTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgTWVtb3J5KFwibVwiICsgbU5yKTtcbiAgICAgICAgICAgICAgICAgICAgbU5yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IFJlbWVtYmVyKFwiclwiICsgck5yKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lm5hbWUudGV4dENvbnRlbnQgPSBcIlJlbWVtYmVyXCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL25vdGVzLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICByTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgRGVza3RvcFdpbmRvdyhcImlcIiArIGlOcik7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5uYW1lLnRleHRDb250ZW50ID0gXCJBcHBsaWNhdGlvbiBpbmZvXCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL2luZm8ucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIGluZm8obmV3V2luZG93KTtcbiAgICAgICAgICAgICAgICAgICAgaU5yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZ2V0RGF0ZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RhdGVcIikpO1xuICAgIGRlc2t0b3BDbG9jayhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Nsb2NrXCIpKTtcbiAgICBzZXRJbnRlcnZhbChkZXNrdG9wQ2xvY2ssIDUwMDApO1xufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgZ2V0Q2xvY2s6IGRlc2t0b3BDbG9jayxcbiAgICBnZXREYXRlOiBnZXREYXRlLFxuICAgIGdldEluZm86IGluZm9cbn07XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgaGFuZGxpbmcgbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogR2V0cyBhbiBpdGVtIGZyb20gbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpdGVtIHRvIGdldC5cbiAqIEByZXR1cm5zIGl0ZW0gLSBUaGUgcmVxdWVzdGVkIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZ2V0KG5hbWUpIHtcbiAgICBpZiAobmFtZSA9PT0gXCJub3Rlc1wiKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKG5hbWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFNldHMgYW4gaXRlbSBpbiBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpdGVtTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpdGVtIHRvIHNldC5cbiAqIEBwYXJhbSBpdGVtIC0gVGhlIGl0ZW0uXG4gKi9cbmZ1bmN0aW9uIHNldChpdGVtTmFtZSwgaXRlbSkge1xuICAgIGlmIChpdGVtTmFtZSA9PT0gXCJub3Rlc1wiKSB7XG4gICAgICAgIGxldCBub3RlcyA9IChnZXQoaXRlbU5hbWUpKSA/IGdldChpdGVtTmFtZSkubm90ZXMgOiBbXTtcbiAgICAgICAgbm90ZXMucHVzaChpdGVtKTtcblxuICAgICAgICBsZXQgYWxsTm90ZXMgPSB7XG4gICAgICAgICAgICBub3Rlczogbm90ZXNcbiAgICAgICAgfTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShpdGVtTmFtZSwgSlNPTi5zdHJpbmdpZnkoYWxsTm90ZXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShpdGVtTmFtZSwgaXRlbSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0OiBzZXQsXG4gICAgZ2V0OiBnZXRcbn07XG4iXX0=
