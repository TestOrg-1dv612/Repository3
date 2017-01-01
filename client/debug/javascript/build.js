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

    this.user = "Unknown";
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

    messageInput.addEventListener("keypress", function(event) {
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
    }.bind(this));

    this.socket.addEventListener("message", function(event) {
        let data = JSON.parse(event.data);

        if (data.type === "message" || data.type === "notification") {
            this.receive(data);
        }
    }.bind(this));
};

/**
 * Gets the user for the chat application.
 *
 * @param {Element} div - The div holding the user information.
 */
Chat.prototype.getUser = function(div) {
    let input = div.firstElementChild;
    let button = div.lastElementChild;
    let removeUserElem = function() {
        div.removeChild(input);
        div.removeChild(button);
        div.classList.add("loggedIn");
        div.textContent = "Logged in as " + this.user;
    }.bind(this);

    let getUsername = function() {
        if (div.firstElementChild.value) {
            this.user = div.firstElementChild.value;
            input.classList.remove("redbg");
            input.value = "";
            removeUserElem();
            storage.set("username", this.user);
        }
    }.bind(this);

    if (!storage.get("username")) {
        div.lastElementChild.addEventListener("click", getUsername);
    } else {
        this.user = storage.get("username");
        removeUserElem();
    }

    this.dropdown.textContent = "Change user";
    this.dropdown.addEventListener("click", function(event) {
        event.preventDefault();
        div.textContent = "User: ";
        div.classList.remove("loggedIn");
        div.appendChild(input);
        div.appendChild(button);
        this.user = "Unknown";
        div.lastElementChild.addEventListener("click", getUsername);
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

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZW1lbWJlci5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9sb2NhbHN0b3JhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogTW9kdWxlIGZvciBDaGF0LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5jb25zdCBzdG9yYWdlID0gcmVxdWlyZShcIi4vbG9jYWxzdG9yYWdlXCIpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYSBDaGF0LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKi9cbmZ1bmN0aW9uIENoYXQoaWQpIHtcbiAgICBEZXNrdG9wV2luZG93LmNhbGwodGhpcywgaWQpO1xuXG4gICAgdGhpcy51c2VyID0gXCJVbmtub3duXCI7XG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KFwid3M6Ly92aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIik7XG4gICAgdGhpcy5vcGVuKCk7XG59XG5cbi8qKlxuICogSGFuZGxlcyBpbmhlcml0YW5jZSBmcm9tIERlc2t0b3BXaW5kb3cuXG4gKlxuICogQHR5cGUge0Rlc2t0b3BXaW5kb3d9XG4gKi9cbkNoYXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNrdG9wV2luZG93LnByb3RvdHlwZSk7XG5DaGF0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENoYXQ7XG5cbi8qKlxuICogSW5pdGlhdGVzIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xuQ2hhdC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFwiKS5jb250ZW50O1xuICAgIGxldCBjb250ZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuXG4gICAgbGV0IG1lc3NhZ2VJbnB1dCA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdE1lc3NhZ2VcIik7XG4gICAgbGV0IHVzZXJJbmZvID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi51c2VyXCIpO1xuICAgIHRoaXMuZ2V0VXNlcih1c2VySW5mbyk7XG5cbiAgICBtZXNzYWdlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZW1vamlzKG1lc3NhZ2VJbnB1dCk7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzIHx8IGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudXNlciAhPT0gXCJVbmtub3duXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW1lc3NhZ2VJbnB1dC52YWx1ZSB8fCBtZXNzYWdlSW5wdXQudmFsdWUudHJpbSgpID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiV3JpdGUgeW91ciBtZXNzYWdlLlwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZChtZXNzYWdlSW5wdXQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlSW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdXNlckluZm8uZmlyc3RFbGVtZW50Q2hpbGQuY2xhc3NMaXN0LmFkZChcInJlZGJnXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcblxuICAgICAgICBpZiAoZGF0YS50eXBlID09PSBcIm1lc3NhZ2VcIiB8fCBkYXRhLnR5cGUgPT09IFwibm90aWZpY2F0aW9uXCIpIHtcbiAgICAgICAgICAgIHRoaXMucmVjZWl2ZShkYXRhKTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHVzZXIgZm9yIHRoZSBjaGF0IGFwcGxpY2F0aW9uLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZGl2IC0gVGhlIGRpdiBob2xkaW5nIHRoZSB1c2VyIGluZm9ybWF0aW9uLlxuICovXG5DaGF0LnByb3RvdHlwZS5nZXRVc2VyID0gZnVuY3Rpb24oZGl2KSB7XG4gICAgbGV0IGlucHV0ID0gZGl2LmZpcnN0RWxlbWVudENoaWxkO1xuICAgIGxldCBidXR0b24gPSBkaXYubGFzdEVsZW1lbnRDaGlsZDtcbiAgICBsZXQgcmVtb3ZlVXNlckVsZW0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZGl2LnJlbW92ZUNoaWxkKGlucHV0KTtcbiAgICAgICAgZGl2LnJlbW92ZUNoaWxkKGJ1dHRvbik7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwibG9nZ2VkSW5cIik7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IFwiTG9nZ2VkIGluIGFzIFwiICsgdGhpcy51c2VyO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIGxldCBnZXRVc2VybmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoZGl2LmZpcnN0RWxlbWVudENoaWxkLnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBkaXYuZmlyc3RFbGVtZW50Q2hpbGQudmFsdWU7XG4gICAgICAgICAgICBpbnB1dC5jbGFzc0xpc3QucmVtb3ZlKFwicmVkYmdcIik7XG4gICAgICAgICAgICBpbnB1dC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICByZW1vdmVVc2VyRWxlbSgpO1xuICAgICAgICAgICAgc3RvcmFnZS5zZXQoXCJ1c2VybmFtZVwiLCB0aGlzLnVzZXIpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgaWYgKCFzdG9yYWdlLmdldChcInVzZXJuYW1lXCIpKSB7XG4gICAgICAgIGRpdi5sYXN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXRVc2VybmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51c2VyID0gc3RvcmFnZS5nZXQoXCJ1c2VybmFtZVwiKTtcbiAgICAgICAgcmVtb3ZlVXNlckVsZW0oKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyb3Bkb3duLnRleHRDb250ZW50ID0gXCJDaGFuZ2UgdXNlclwiO1xuICAgIHRoaXMuZHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IFwiVXNlcjogXCI7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QucmVtb3ZlKFwibG9nZ2VkSW5cIik7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB0aGlzLnVzZXIgPSBcIlVua25vd25cIjtcbiAgICAgICAgZGl2Lmxhc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldFVzZXJuYW1lKTtcbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBTZW5kcyB0eXBlZCBpbiBtZXNzYWdlcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgLSBUaGUgaW5wdXQgbWVzc2FnZSBmcm9tIHRoZSB0ZXh0YXJlYS5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICBkYXRhOiBpbnB1dCxcbiAgICAgICAgdXNlcm5hbWU6IHRoaXMudXNlcixcbiAgICAgICAga2V5OiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG59O1xuXG4vKipcbiAqIFJlY2VpdmVzIGFuZCBkaXNwbGF5cyBtZXNzYWdlcyBpbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIFRoZSByZWNlaXZlZCBkYXRhLlxuICovXG5DaGF0LnByb3RvdHlwZS5yZWNlaXZlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VDb250YWluZXJcIik7XG5cbiAgICBsZXQgdXNlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIHVzZXIuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJ1c2VybmFtZVwiKTtcbiAgICB1c2VyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEudXNlcm5hbWUpKTtcbiAgICBsZXQgcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBwRWxlbS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhLmRhdGEpKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh1c2VyKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocEVsZW0pO1xuXG4gICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xufTtcblxuLyoqXG4gKiBSZXBsYWNlcyBjZXJ0YWluIGNoYXJhY3RlciBjb21iaW5hdGlvbnMgd2l0aCBlbW9qaXMuXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgLSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSB1c2VyIGlucHV0LlxuICovXG5DaGF0LnByb3RvdHlwZS5lbW9qaXMgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgbGV0IGVtb2ppcyA9IHtcbiAgICAgICAgXCI6KVwiOiBcIlxcdUQ4M0RcXHVERTBBXCIsXG4gICAgICAgIFwiOylcIjogXCJcXHVEODNEXFx1REUwOVwiLFxuICAgICAgICBcIjpEXCI6IFwiXFx1RDgzRFxcdURFMDNcIixcbiAgICAgICAgXCI6UFwiOiBcIlxcdUQ4M0RcXHVERTFCXCIsXG4gICAgICAgIFwiO1BcIjogXCJcXHVEODNEXFx1REUxQ1wiLFxuICAgICAgICBcIjovXCI6IFwiXFx1RDgzRFxcdURFMTVcIixcbiAgICAgICAgXCI6KFwiOiBcIlxcdUQ4M0RcXHVERTFFXCIsXG4gICAgICAgIFwiOicoXCI6IFwiXFx1RDgzRFxcdURFMjJcIixcbiAgICAgICAgXCIoeSlcIjogXCJcXHVEODNEXFx1REM0RFwiLFxuICAgICAgICBcIjwzXCI6IFwiXFx1Mjc2NFxcdUZFMEZcIlxuICAgIH07XG5cbiAgICBmb3IgKGxldCBpIGluIGVtb2ppcykge1xuICAgICAgICBlbGVtZW50LnZhbHVlID0gZWxlbWVudC52YWx1ZS5yZXBsYWNlKGksIGVtb2ppc1tpXSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtDaGF0fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEZXNrdG9wV2luZG93LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cgdG8gY3JlYXRlLlxuICogQHRocm93cyB7RXJyb3J9IC0gV2luZG93IG11c3QgaGF2ZSBhbiBpZC5cbiAqL1xuZnVuY3Rpb24gRGVza3RvcFdpbmRvdyhpZCkge1xuICAgIGlmICghaWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2luZG93IG11c3QgaGF2ZSBhbiBpZC5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgdG9wLW5hbWUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjbmFtZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIm5hbWVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubmFtZVwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgdG9wLW5hbWUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjaWNvblxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImljb25cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubG9nb1wiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgZm9vdGVyIG1lc3NhZ2UgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNtZXNzYWdlXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwibWVzc2FnZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi53aW5kb3ctZm9vdGVyXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIERlc2t0b3BXaW5kb3cncyBkcm9wZG93biBsaW5rIGluIG1lbnUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjZHJvcGRvd25cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJkcm9wZG93blwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpWzBdO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBjdXJyZW50IERlc2t0b3BXaW5kb3cuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjZGl2XG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZGl2XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgaWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNpZFxuICAgICAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gLSBNdXN0IGJlIGEgc3RyaW5nLlxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImlkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiV2luZG93IGlkIG11c3QgYmUgYSBzdHJpbmcuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuY3JlYXRlKCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB3aW5kb3cgZnJvbSB0ZW1wbGF0ZS5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dcIik7XG4gICAgbGV0IHdpbmRvd0RpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZXNrdG9wXCIpLmFwcGVuZENoaWxkKHdpbmRvd0Rpdik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN1bmNsYWltZWRcIikuaWQgPSB0aGlzLmlkO1xuXG4gICAgbGV0IGlkID0gdGhpcy5pZC50b1N0cmluZygpO1xuXG4gICAgdGhpcy5wb3NpdGlvbihpZCk7XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudCgpO1xuXG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZGl2ICE9PSB0aGlzLmRpdi5wYXJlbnROb2RlLmxhc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMuZGl2LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5kaXYpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcInRleHRhcmVhXCIpIHx8XG4gICAgICAgICAgICBldmVudC50YXJnZXQgPT09IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFwiKSkge1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmZvY3VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlQ29udGFpbmVyXCIpO1xuICAgICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodCAtIGNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogUG9zaXRpb25zIHRoZSB3aW5kb3cgaW4gdGhlIGRlc2t0b3AsIHN0YWNrcyBpZiBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKi9cbkRlc2t0b3BXaW5kb3cucHJvdG90eXBlLnBvc2l0aW9uID0gZnVuY3Rpb24oaWQpIHtcbiAgICBsZXQgc3RhY2tXaW5kb3dzID0gKGFwcCkgPT4ge1xuICAgICAgICBpZiAoaWQuaW5kZXhPZihcIjFcIikgPT09IC0xKSB7XG4gICAgICAgICAgICBsZXQgaWROciA9IGlkLmNoYXJBdCgxKSAtIDE7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXBwICsgaWROcikpIHtcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudEJlZm9yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFwcCArIGlkTnIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCA9IChlbGVtZW50QmVmb3JlLm9mZnNldFRvcCArIDM1KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gKGVsZW1lbnRCZWZvcmUub2Zmc2V0TGVmdCArIDM1KSArIFwicHhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoaWQuaW5kZXhPZihcImNcIikgIT09IC0xKSB7XG4gICAgICAgIHN0YWNrV2luZG93cyhcImNcIik7XG4gICAgfSBlbHNlIGlmIChpZC5pbmRleE9mKFwibVwiKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9ICh0aGlzLmRpdi5vZmZzZXRMZWZ0ICsgMjAwKSArIFwicHhcIjtcbiAgICAgICAgc3RhY2tXaW5kb3dzKFwibVwiKTtcbiAgICB9IGVsc2UgaWYgKGlkLmluZGV4T2YoXCJyXCIpICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gKHRoaXMuZGl2Lm9mZnNldExlZnQgKyA0MDApICsgXCJweFwiO1xuICAgICAgICBzdGFja1dpbmRvd3MoXCJyXCIpO1xuICAgIH0gZWxzZSBpZiAoaWQuaW5kZXhPZihcImlcIikgIT09IC0xKSB7XG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAodGhpcy5kaXYub2Zmc2V0TGVmdCArIDYwMCkgKyBcInB4XCI7XG4gICAgICAgIHN0YWNrV2luZG93cyhcImlcIik7XG4gICAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGRyYWdnaW5nIG1vdmVtZW50cyBvZiB0aGUgd2luZG93LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5oYW5kbGVNb3ZlbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBwb3NYID0gMDtcbiAgICBsZXQgcG9zWSA9IDA7XG5cbiAgICBsZXQgc2Nyb2xsVXAgPSAoKSA9PiB7XG4gICAgICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VDb250YWluZXJcIik7XG4gICAgICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gY29udGFpbmVyLmNsaWVudEhlaWdodDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBsZXQgbW92ZVdpbmRvdyA9IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSAoZXZlbnQuY2xpZW50WSAtIHBvc1kpICsgXCJweFwiO1xuICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gKGV2ZW50LmNsaWVudFggLSBwb3NYKSArIFwicHhcIjtcbiAgICAgICAgc2Nyb2xsVXAodGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlQ29udGFpbmVyXCIpKTtcbiAgICB9O1xuXG4gICAgbGV0IGdldFBvc2l0aW9uID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jbG9zZVwiKSkge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSh0aGlzLmRpdik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0ID09PSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1pbmltaXplXCIpKSB7XG4gICAgICAgICAgICB0aGlzLm1pbmltaXplKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMuZGl2KTtcbiAgICAgICAgcG9zWCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLmRpdi5vZmZzZXRMZWZ0O1xuICAgICAgICBwb3NZID0gZXZlbnQuY2xpZW50WSAtIHRoaXMuZGl2Lm9mZnNldFRvcDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgICAgIHNjcm9sbFVwKCk7XG4gICAgfTtcblxuICAgIHRoaXMuZGl2LmZpcnN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZ2V0UG9zaXRpb24pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsICgpID0+IHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIE1pbmltaXplcyB3aW5kb3csIG9yIG1heGltaXplcyBpZiBjbGlja2VkIG9uIHRoZSByZWZlcmVuY2UuXG4gKi9cbkRlc2t0b3BXaW5kb3cucHJvdG90eXBlLm1pbmltaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5kaXYuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG5cbiAgICBsZXQgYVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgIGFUYWcuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcIiNcIik7XG5cbiAgICBsZXQgYWRkV2luZG93ID0gKGljb25NZW51LCBhcHApID0+IHtcbiAgICAgICAgaWNvbk1lbnUuYXBwZW5kQ2hpbGQoYVRhZyk7XG4gICAgICAgIGljb25NZW51LmNsYXNzTGlzdC5hZGQoXCJtaW5pbWl6ZWRcIik7XG4gICAgICAgIGljb25NZW51Lmxhc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBhcHAgKyBcIiBcIiArICh0aGlzLmlkLmNoYXJBdCgxKSk7XG5cbiAgICAgICAgaWNvbk1lbnUubGFzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgICAgaWNvbk1lbnUucmVtb3ZlQ2hpbGQoZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICAgICAgaWYgKCFpY29uTWVudS5maXJzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICAgICAgICAgIGljb25NZW51LmNsYXNzTGlzdC5yZW1vdmUoXCJtaW5pbWl6ZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBsZXQgaWNvbk1lbnVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIm5hdiAuaWNvbi1tZW51XCIpO1xuXG4gICAgaWYgKHRoaXMuaWQuaW5kZXhPZihcImNcIikgIT09IC0xKSB7XG4gICAgICAgIGFkZFdpbmRvdyhpY29uTWVudXNbMF0sIFwiQ2hhdFwiKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaWQuaW5kZXhPZihcIm1cIikgIT09IC0xKSB7XG4gICAgICAgIGFkZFdpbmRvdyhpY29uTWVudXNbMV0sIFwiTWVtb3J5XCIpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pZC5pbmRleE9mKFwiclwiKSAhPT0gLTEpIHtcbiAgICAgICAgYWRkV2luZG93KGljb25NZW51c1syXSwgXCJSZW1lbWJlclwiKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaWQuaW5kZXhPZihcImlcIikgIT09IC0xKSB7XG4gICAgICAgIGFkZFdpbmRvdyhpY29uTWVudXNbM10sIFwiSW5mb1wiKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIENsb3NlcyB0aGUgd2luZG93LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHdpbmRvdyB0byBjbG9zZS5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuXG4gICAgaWYgKHRoaXMuc29ja2V0KSB7XG4gICAgICAgIHRoaXMuc29ja2V0LmNsb3NlKCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IERlc2t0b3BXaW5kb3c7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgTWVtb3J5LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIE1lbW9yeSBnYW1lLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKi9cbmZ1bmN0aW9uIE1lbW9yeShpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2l6ZSBvZiB0aGUgYm9hcmQuXG4gICAgICovXG4gICAgdGhpcy5zaXplID0gMTY7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXJyYXkgdG8gY29udGFpbiB0aGUgYnJpY2sgaW1hZ2VzLlxuICAgICAqL1xuICAgIHRoaXMuaW1hZ2VzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZmlyc3QgdHVybmVkIGJyaWNrLlxuICAgICAqL1xuICAgIHRoaXMudHVybjEgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNlY29uZCB0dXJuZWQgYnJpY2suXG4gICAgICovXG4gICAgdGhpcy50dXJuMiA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIHBhaXJzLlxuICAgICAqL1xuICAgIHRoaXMucGFpcnMgPSAwO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBjbGlja3MuXG4gICAgICovXG4gICAgdGhpcy5uck9mQ2xpY2tzID0gMDtcblxuICAgIHRoaXMuc3RhcnQoKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xuTWVtb3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGVza3RvcFdpbmRvdy5wcm90b3R5cGUpO1xuTWVtb3J5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbW9yeTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGdhbWUgYW5kIGFkZHMgZXZlbnQgbGlzdGVuZXJzLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaHVmZmxlKCk7XG4gICAgdGhpcy5zZXRTaXplKCk7XG4gICAgdGhpcy5zZXRNZW51KCk7XG5cbiAgICB0aGlzLmRyb3Bkb3duLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnJlc3RhcnQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgbGV0IGxpbmtzID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXS5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIik7XG4gICAgbGlua3MuZm9yRWFjaChmdW5jdGlvbihjdXJyZW50KSB7XG4gICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC50YXJnZXQudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiM3gyXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCI0eDNcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gMTI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCI0eDRcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gMTY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJlc3RhcnQoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBTZXRzIGVsZW1lbnRzIGZvciB0aGUgZHJvcC1kb3duIG1lbnUgdG8gYWxsb3cgY2hhbmdpbmcgc2l6ZSBvZiB0aGUgYm9hcmQuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc2V0TWVudSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBlbGVtZW50ID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZW51bGlua1wiKTtcbiAgICBsZXQgbWVudUNsb25lID0gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgZWxlbWVudC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKG1lbnVDbG9uZSk7XG5cbiAgICBsZXQgbmV3TGluayA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMV07XG4gICAgbmV3TGluay5maXJzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IFwiU2l6ZVwiO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyOyBpICs9IDEpIHtcbiAgICAgICAgbGV0IGRyb3Bkb3duQ2xvbmUgPSBuZXdMaW5rLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd24gYVwiKS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5ld0xpbmsubGFzdEVsZW1lbnRDaGlsZC5hcHBlbmRDaGlsZChkcm9wZG93bkNsb25lKTtcbiAgICB9XG5cbiAgICBsZXQgZHJvcGRvd25MaW5rcyA9IG5ld0xpbmsucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpO1xuICAgIGRyb3Bkb3duTGlua3NbMF0udGV4dENvbnRlbnQgPSBcIjN4MlwiO1xuICAgIGRyb3Bkb3duTGlua3NbMV0udGV4dENvbnRlbnQgPSBcIjR4M1wiO1xuICAgIGRyb3Bkb3duTGlua3NbMl0udGV4dENvbnRlbnQgPSBcIjR4NFwiO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBzaXplIG9mIHRoZSBib2FyZC5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlcIikuY29udGVudDtcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZCwgZmFsc2UpO1xuICAgIGxldCByZXN1bHRFbGVtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5sYXN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAodGhpcy5zaXplKSB7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiYm9hcmQ2XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImJvYXJkMTJcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiYm9hcmQxNlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCBhO1xuICAgIHRoaXMuaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UsIGluZGV4KSB7XG4gICAgICAgIGEgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgYS5maXJzdEVsZW1lbnRDaGlsZC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWJyaWNrTnJcIiwgaW5kZXgpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYSk7XG5cbiAgICB9KTtcblxuICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBsZXQgaW1nO1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUgPT09IFwiQVwiKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgICAgICAgICAgaW1nID0gZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUgPT09IFwiSU1HXCIpIHtcbiAgICAgICAgICAgIGltZyA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbWcpIHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGltZy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWJyaWNrTnJcIikpO1xuICAgICAgICAgICAgdGhpcy50dXJuQnJpY2sodGhpcy5pbWFnZXNbaW5kZXhdLCBpbmRleCwgaW1nKTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQocmVzdWx0RWxlbSk7XG59O1xuXG4vKipcbiAqIFNodWZmbGVzIHRoZSBhcnJheSB3aXRoIGltYWdlcy5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zaHVmZmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pbWFnZXMgPSBbMSwxLDIsMiwzLDMsNCw0LDUsNSw2LDYsNyw3LDgsOF07XG5cbiAgICBsZXQgaW5kZXhUb1N3YXA7XG4gICAgbGV0IHRlbXBJbWc7XG4gICAgbGV0IGltZ3M7XG5cbiAgICBzd2l0Y2ggKHRoaXMuc2l6ZSkge1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBpbWdzID0gdGhpcy5pbWFnZXMuc2xpY2UoMCwgNik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcy5zbGljZSgwLCAxMik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcztcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gdGhpcy5zaXplIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICBpbmRleFRvU3dhcCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpO1xuICAgICAgICB0ZW1wSW1nID0gaW1nc1tpXTtcbiAgICAgICAgaW1nc1tpXSA9IGltZ3NbaW5kZXhUb1N3YXBdO1xuICAgICAgICBpbWdzW2luZGV4VG9Td2FwXSA9IHRlbXBJbWc7XG4gICAgfVxuXG4gICAgdGhpcy5pbWFnZXMgPSBpbWdzO1xufTtcblxuLyoqXG4gKiBIYW5kbGVzIHRoZSBldmVudCBvZiB0dXJuaW5nIGEgYnJpY2suXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGJyaWNrSW1nIC0gVGhlIGltYWdlIG9mIHRoZSB0dXJuZWQgYnJpY2suXG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHR1cm5lZCBicmljay5cbiAqIEBwYXJhbSB7RWxlbWVudH0gaW1nIC0gVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgYnJpY2suXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUudHVybkJyaWNrID0gZnVuY3Rpb24oYnJpY2tJbWcsIGluZGV4LCBpbWcpIHtcbiAgICBpZiAodGhpcy50dXJuMikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaW1nLnNyYyA9IFwiL2ltYWdlL21lbW9yeS9cIiArIGJyaWNrSW1nICsgXCIucG5nXCI7XG5cbiAgICBpZiAoIXRoaXMudHVybjEpIHtcbiAgICAgICAgdGhpcy50dXJuMSA9IGltZztcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaW1nID09PSB0aGlzLnR1cm4xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5yT2ZDbGlja3MgKz0gMTtcbiAgICAgICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi50cmllc1wiKS50ZXh0Q29udGVudCA9IHRoaXMubnJPZkNsaWNrcy50b1N0cmluZygpO1xuXG4gICAgICAgIHRoaXMudHVybjIgPSBpbWc7XG4gICAgICAgIGlmICh0aGlzLnR1cm4xLnNyYyA9PT0gdGhpcy50dXJuMi5zcmMpIHtcbiAgICAgICAgICAgIHRoaXMucGFpcnMgKz0gMTtcbiAgICAgICAgICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIucGFpcnNcIikudGV4dENvbnRlbnQgPSB0aGlzLnBhaXJzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhaXJzID09PSB0aGlzLnNpemUgLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmRHYW1lKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJlbXB0eVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcImVtcHR5XCIpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMiA9IG51bGw7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDQwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjEuc3JjID0gXCIvaW1hZ2UvbWVtb3J5LzAucG5nXCI7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMi5zcmMgPSBcIi9pbWFnZS9tZW1vcnkvMC5wbmdcIjtcblxuICAgICAgICAgICAgICAgIHRoaXMudHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIgPSBudWxsO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1MDApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBFbmRzIHRoZSBnYW1lIGFuZCBkaXNwbGF5cyBtZXNzYWdlLlxuICovXG5NZW1vcnkucHJvdG90eXBlLmVuZEdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbWVzc2FnZSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZVwiKTtcblxuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIllvdSBmaW5pc2hlZCB0aGUgZ2FtZSFcIjtcbn07XG5cbi8qKlxuICogUmVzdGFydHMgYW5kIGNsZWFycyB0aGUgTWVtb3J5IGdhbWUuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG4gICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgdGhpcy5wYWlycyA9IDA7XG4gICAgdGhpcy5uck9mQ2xpY2tzID0gMDtcbiAgICB0aGlzLnNodWZmbGUoKTtcbiAgICB0aGlzLnNldFNpemUoKTtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7TWVtb3J5fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeTtcbiIsIi8qKlxuICogTW9kdWxlIGZvciBSZW1lbWJlciBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERlc2t0b3BXaW5kb3cgPSByZXF1aXJlKFwiLi9EZXNrdG9wV2luZG93XCIpO1xuY29uc3Qgc3RvcmFnZSA9IHJlcXVpcmUoXCIuL2xvY2Fsc3RvcmFnZVwiKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFJlbWVtYmVyLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIGlkXG4gKi9cbmZ1bmN0aW9uIFJlbWVtYmVyKGlkKSB7XG4gICAgRGVza3RvcFdpbmRvdy5jYWxsKHRoaXMsIGlkKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBhcnJheSB0byBob2xkIHRoZSBub3Rlcy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKi9cbiAgICB0aGlzLm5vdGVzID0gW107XG5cbiAgICB0aGlzLm5ldygpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5SZW1lbWJlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlc2t0b3BXaW5kb3cucHJvdG90eXBlKTtcblJlbWVtYmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlbWVtYmVyO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbm90ZS5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG5vdEZpcnN0IC0gV2hldGhlciBvciBub3QgdGhlIGNyZWF0ZWQgbm90ZSBpcyB0aGUgZmlyc3Qgb3Igbm90LlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUubmV3ID0gZnVuY3Rpb24obm90Rmlyc3QpIHtcbiAgICBpZiAobm90Rmlyc3QpIHtcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcbiAgICAgICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ub3RlcyA9IFtdO1xuICAgIH1cblxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVtZW1iZXJcIikuY29udGVudDtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUsIHRydWUpO1xuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuICAgIGxldCBpbnB1dCA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubm90ZS1pbnB1dFwiKTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFpbnB1dC52YWx1ZSkge1xuICAgICAgICAgICAgaW5wdXQuY2xhc3NMaXN0LmFkZChcInJlZGJnXCIpO1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJZb3UgbmVlZCB0byB3cml0ZSBhbiBpdGVtIGZvciB0aGUgbGlzdC5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0LmNsYXNzTGlzdC5yZW1vdmUoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgICAgICAgICB0aGlzLmFkZChpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICBpbnB1dC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgaWYgKCFub3RGaXJzdCkge1xuICAgICAgICB0aGlzLnNldE1lbnUoKTtcbiAgICAgICAgaWYgKHN0b3JhZ2UuZ2V0KFwibm90ZXNcIikgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZSh0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJvcGRvd24udGV4dENvbnRlbnQgPSBcIlNhdmVcIjtcbiAgICAgICAgdGhpcy5kcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5ub3RlIHBcIikubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIk5vdGUgaXMgZW1wdHkuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBkaWZmZXJlbnQgZHJvcGRvd24gbWVudXMuXG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZS5zZXRNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lbnVsaW5rXCIpO1xuICAgIGxldCBtZW51Q2xvbmUgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQobWVudUNsb25lKTtcblxuICAgIGxldCBuZXdMaW5rID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXTtcbiAgICBuZXdMaW5rLmZpcnN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gXCJOb3Rlc1wiO1xuICAgIG5ld0xpbmsucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93blwiKS5yZW1vdmVDaGlsZChuZXdMaW5rLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd24gYVwiKSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI7IGkgKz0gMSkge1xuICAgICAgICBsZXQgZHJvcGRvd25DbG9uZSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMF0ucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93biBhXCIpLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVswXS5sYXN0RWxlbWVudENoaWxkLmFwcGVuZENoaWxkKGRyb3Bkb3duQ2xvbmUpO1xuICAgIH1cblxuICAgIGxldCBkcm9wZG93bkxpbmtzID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIik7XG4gICAgZHJvcGRvd25MaW5rc1sxXS50ZXh0Q29udGVudCA9IFwiTmV3XCI7XG4gICAgZHJvcGRvd25MaW5rc1syXS50ZXh0Q29udGVudCA9IFwiRGVsZXRlIEFsbFwiO1xuXG4gICAgZHJvcGRvd25MaW5rc1sxXS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5uZXcodHJ1ZSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGRyb3Bkb3duTGlua3NbMl0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwibm90ZXNcIik7XG5cbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IG5ld0xpbmsubGFzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uZXcodHJ1ZSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8qKlxuICogQWRkcyBpbnB1dCB0byB0aGUgbm90ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgLSBVc2VyIGlucHV0IGZyb20gZWxlbWVudC5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgbGV0IG5vdGVFbGVtID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5ub3RlIHBcIilbMF0uY2xvbmVOb2RlKHRydWUpO1xuICAgIG5vdGVFbGVtLnRleHRDb250ZW50ID0gaW5wdXQ7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5ub3RlXCIpLmFwcGVuZENoaWxkKG5vdGVFbGVtKTtcblxuICAgIHRoaXMubm90ZXMucHVzaChpbnB1dCk7XG59O1xuXG4vKipcbiAqIFNhdmVzIGN1cnJlbnQgbm90ZSB0byBsb2NhbCBzdG9yYWdlIG9yIGdldHMgb2xkIG5vdGVzLlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb2xkTm90ZXMgLSBXaGV0aGVyIG9yIG5vdCB0aGVyZSBhcmUgb2xkIG5vdGVzIGluIGxvY2FsIHN0b3JhZ2UuXG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24ob2xkTm90ZXMpIHtcbiAgICBsZXQgbmV3TGluaztcbiAgICBsZXQgZHJvcGRvd25MaW5rO1xuXG4gICAgbGV0IGFkZE1lbnVOb3RlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG5ld0xpbmsgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzFdO1xuICAgICAgICBsZXQgZHJvcGRvd25DbG9uZSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMF0uXG4gICAgICAgICAgICBxdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duIGFcIikuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBuZXdMaW5rLmxhc3RFbGVtZW50Q2hpbGQuYXBwZW5kQ2hpbGQoZHJvcGRvd25DbG9uZSk7XG5cbiAgICAgICAgZHJvcGRvd25MaW5rID0gbmV3TGluay5xdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duXCIpLmxhc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgIGRyb3Bkb3duTGluay50ZXh0Q29udGVudCA9IFwiTm90ZSBcIiArIChuZXdMaW5rLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKS5sZW5ndGgpO1xuXG4gICAgICAgIGRyb3Bkb3duTGluay5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsZXQgbnIgPSBldmVudC50YXJnZXQudGV4dENvbnRlbnQuY2hhckF0KGV2ZW50LnRhcmdldC50ZXh0Q29udGVudC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIGlmIChuciA9PT0gMCkge1xuICAgICAgICAgICAgICAgIG5yID0gOTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5nZXQobnIpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIGxldCBub3RlcyA9IChzdG9yYWdlLmdldChcIm5vdGVzXCIpID09PSBudWxsKSA/IDAgOiBzdG9yYWdlLmdldChcIm5vdGVzXCIpLm5vdGVzO1xuICAgIGlmIChvbGROb3Rlcykge1xuICAgICAgICBub3Rlcy5mb3JFYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYWRkTWVudU5vdGUoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobm90ZXMgPT09IDAgfHwgbm90ZXMubGVuZ3RoIDw9IDQpIHtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KFwibm90ZXNcIiwgdGhpcy5ub3Rlcyk7XG4gICAgICAgICAgICBhZGRNZW51Tm90ZSgpO1xuICAgICAgICAgICAgdGhpcy5uZXcodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIllvdSBhbHJlYWR5IGhhdmUgNSBzYXZlZCBub3Rlcy5cIjtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogR2V0cyB0aGUgaXRlbSB0aGF0IHdhcyBjbGlja2VkIG9uIGZyb20gbGlzdC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbnIgLSBUaGUgbnVtYmVyIG9mIHRoZSBjbGlja2VkIGl0ZW0gaW4gbG9jYWwgc3RvcmFnZSBhcnJheS5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5yKSB7XG4gICAgbGV0IG5vdGVzID0gc3RvcmFnZS5nZXQoXCJub3Rlc1wiKS5ub3RlcztcbiAgICBsZXQgbm90ZUNvbnRlbnQgPSBub3Rlc1sobnIgLSAxKV07XG5cbiAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5ub3RlXCIpO1xuICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVtZW1iZXJcIikuY29udGVudDtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuZmlyc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuICAgIG5vdGVDb250ZW50LmZvckVhY2goZnVuY3Rpb24oY3VycmVudCkge1xuICAgICAgICBsZXQgbm90ZUVsZW0gPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm5vdGUgcFwiKVswXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5vdGVFbGVtLnRleHRDb250ZW50ID0gY3VycmVudDtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vdGVFbGVtKTtcbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtSZW1lbWJlcn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBSZW1lbWJlcjtcbiIsIi8qKlxuICogU3RhcnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5jb25zdCBkZXNrdG9wID0gcmVxdWlyZShcIi4vZGVza3RvcFwiKTtcblxuZGVza3RvcC5pbml0KCk7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgZGVza3RvcC5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5jb25zdCBDaGF0ID0gcmVxdWlyZShcIi4vQ2hhdFwiKTtcbmNvbnN0IE1lbW9yeSA9IHJlcXVpcmUoXCIuL01lbW9yeVwiKTtcbmNvbnN0IFJlbWVtYmVyID0gcmVxdWlyZShcIi4vUmVtZW1iZXJcIik7XG5cbi8qKlxuICogR2V0cyB0aGUgY3VycmVudCB0aW1lIGFuZCBwcmVzZW50cyBpdCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIC0gVGhlIGNvbnRhaW5lciBvZiB0aGUgY2xvY2suXG4gKi9cbmZ1bmN0aW9uIGRlc2t0b3BDbG9jayhjb250YWluZXIpIHtcbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Nsb2NrXCIpO1xuICAgIH1cblxuICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IGhvdXJzID0gdG9kYXkuZ2V0SG91cnMoKTtcbiAgICBsZXQgbWlucyA9IHRvZGF5LmdldE1pbnV0ZXMoKTtcblxuICAgIGlmIChtaW5zIDwgMTApIHtcbiAgICAgICAgbWlucyA9IFwiMFwiICsgbWlucztcbiAgICB9XG5cbiAgICBpZiAoaG91cnMgPCAxMCkge1xuICAgICAgICBob3VycyA9IFwiMFwiICsgaG91cnM7XG4gICAgfVxuXG4gICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gaG91cnMgKyBcIjpcIiArIG1pbnM7XG59XG5cbi8qKlxuICogR2V0cyB0b2RheSdzIGRhdGUgYW5kIHByZXNlbnRzIGl0IGluIHRoZSBnaXZlbiBjb250YWluZXIuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIgLSBUaGUgY29udGFpbmVyIG9mIHRoZSBjbG9jay5cbiAqL1xuZnVuY3Rpb24gZ2V0RGF0ZShjb250YWluZXIpIHtcbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBtb250aCA9IFtcImphblwiLCBcImZlYlwiLCBcIm1hclwiLCBcImFwclwiLCBcIm1heVwiLCBcImp1bmVcIiwgXCJqdWx5XCIsIFwiYXVnXCIsIFwic2VwdFwiLCBcIm9jdFwiLCBcIm5vdlwiLCBcImRlY1wiXTtcbiAgICBjb250YWluZXIudGV4dENvbnRlbnQgPSB0b2RheS5nZXREYXRlKCkgKyBcIiBcIiArIG1vbnRoW3RvZGF5LmdldE1vbnRoKCldICsgXCIgXCIgKyB0b2RheS5nZXRGdWxsWWVhcigpO1xufVxuXG4vKipcbiAqIEdldHMgYXBwbGljYXRpb24gaW5mb3JtYXRpb24gZm9yIGluZm8gd2luZG93LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgdG8gZGlzcGxheSB0aGUgaW5mb3JtYXRpb24gaW4uXG4gKi9cbmZ1bmN0aW9uIGluZm8oZWxlbWVudCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5mb1wiKS5jb250ZW50O1xuICAgIGxldCBjb250YWluZXIgPSBlbGVtZW50LmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZSwgdHJ1ZSkpO1xuICAgIGxldCBtZW51ID0gZWxlbWVudC5kaXYucXVlcnlTZWxlY3RvcihcIi5tZW51XCIpO1xuICAgIG1lbnUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtZW51KTtcbn1cblxuLyoqXG4gKiBJbml0aWF0ZXMgZGVza3RvcCBieSBhZGRpbmcgbmVjZXNzYXJ5IGV2ZW50IGxpc3RlbmVycy5cbiAqL1xuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBsZXQgbmV3V2luZG93O1xuICAgIGxldCBjTnIgPSAxO1xuICAgIGxldCBtTnIgPSAxO1xuICAgIGxldCByTnIgPSAxO1xuICAgIGxldCBpTnIgPSAxO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJuYXYgLmljb25zXCIpLmZvckVhY2goKGN1cnJlbnQsIGluZGV4KSA9PiB7XG4gICAgICAgIHN3aXRjaCAoaW5kZXgpe1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgQ2hhdChcImNcIiArIGNOcik7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5uYW1lLnRleHRDb250ZW50ID0gXCJDaGF0XCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL2NoYXQucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIGNOciArPSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBNZW1vcnkoXCJtXCIgKyBtTnIpO1xuICAgICAgICAgICAgICAgICAgICBtTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgUmVtZW1iZXIoXCJyXCIgKyByTnIpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cubmFtZS50ZXh0Q29udGVudCA9IFwiUmVtZW1iZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lmljb24uc3JjID0gXCIvaW1hZ2Uvbm90ZXMucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIHJOciArPSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBEZXNrdG9wV2luZG93KFwiaVwiICsgaU5yKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lm5hbWUudGV4dENvbnRlbnQgPSBcIkFwcGxpY2F0aW9uIGluZm9cIjtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lmljb24uc3JjID0gXCIvaW1hZ2UvaW5mby5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgaW5mbyhuZXdXaW5kb3cpO1xuICAgICAgICAgICAgICAgICAgICBpTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBnZXREYXRlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGF0ZVwiKSk7XG4gICAgZGVza3RvcENsb2NrKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2xvY2tcIikpO1xuICAgIHNldEludGVydmFsKGRlc2t0b3BDbG9jaywgNTAwMCk7XG59XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogaW5pdCxcbiAgICBnZXRDbG9jazogZGVza3RvcENsb2NrLFxuICAgIGdldERhdGU6IGdldERhdGUsXG4gICAgZ2V0SW5mbzogaW5mb1xufTtcbiIsIi8qKlxuICogTW9kdWxlIGZvciBoYW5kbGluZyBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBHZXRzIGFuIGl0ZW0gZnJvbSBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGl0ZW0gdG8gZ2V0LlxuICogQHJldHVybnMgaXRlbSAtIFRoZSByZXF1ZXN0ZWQgaXRlbVxuICovXG5mdW5jdGlvbiBnZXQobmFtZSkge1xuICAgIGlmIChuYW1lID09PSBcIm5vdGVzXCIpIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShuYW1lKTtcbiAgICB9XG59XG5cbi8qKlxuICogU2V0cyBhbiBpdGVtIGluIGxvY2FsIHN0b3JhZ2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGl0ZW1OYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGl0ZW0gdG8gc2V0LlxuICogQHBhcmFtIGl0ZW0gLSBUaGUgaXRlbS5cbiAqL1xuZnVuY3Rpb24gc2V0KGl0ZW1OYW1lLCBpdGVtKSB7XG4gICAgaWYgKGl0ZW1OYW1lID09PSBcIm5vdGVzXCIpIHtcbiAgICAgICAgbGV0IG5vdGVzO1xuICAgICAgICBpZiAoZ2V0KGl0ZW1OYW1lKSkge1xuICAgICAgICAgICAgbm90ZXMgPSBnZXQoaXRlbU5hbWUpLm5vdGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm90ZXMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5vdGVzLnB1c2goaXRlbSk7XG4gICAgICAgIGxldCBhbGxOb3RlcyA9IHtcbiAgICAgICAgICAgIG5vdGVzOiBub3Rlc1xuICAgICAgICB9O1xuXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGl0ZW1OYW1lLCBKU09OLnN0cmluZ2lmeShhbGxOb3RlcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGl0ZW1OYW1lLCBpdGVtKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZXQ6IHNldCxcbiAgICBnZXQ6IGdldFxufTtcbiJdfQ==
