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
                this.send(messageInput.value);
                messageInput.value = "";
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

    this.div.querySelector(".content").addEventListener("click", function(event) {
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
    }.bind(this));
};

/**
 * Positions the window in the desktop, stacks if necessary.
 *
 * @param {String} id - The id of the window.
 */
DesktopWindow.prototype.position = function(id) {
    let stackWindows = function(app) {
        if (id.indexOf("1") === -1) {
            let idNr = id.charAt(1) - 1;
            if (document.getElementById(app + idNr)) {
                let elementBefore = document.getElementById(app + idNr);
                this.div.style.top = (elementBefore.offsetTop + 35) + "px";
                this.div.style.left = (elementBefore.offsetLeft + 35) + "px";
            }
        }
    }.bind(this);

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

    let moveWindow = function(event) {
        this.div.style.top = (event.clientY - posY) + "px";
        this.div.style.left = (event.clientX - posX) + "px";
    }.bind(this);

    let getPosition = function(event) {
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
    }.bind(this);

    this.div.firstElementChild.addEventListener("mousedown", getPosition);

    window.addEventListener("mouseup", function() {
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

    let addWindow = function(iconMenu, app) {
        iconMenu.appendChild(aTag);
        iconMenu.classList.add("minimized");
        iconMenu.lastElementChild.textContent = app + " " + (this.id.charAt(1));

        iconMenu.lastElementChild.addEventListener("click", function(event) {
            event.preventDefault();
            this.div.style.visibility = "visible";
            iconMenu.removeChild(event.target);

            if (!iconMenu.firstElementChild) {
                iconMenu.classList.remove("minimized");
            }
        }.bind(this));
    }.bind(this);

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
    document.querySelectorAll("nav .icons").forEach(function(current, index) {
        switch (index){
            case 0:
                current.addEventListener("click", function(event) {
                    event.preventDefault();
                    newWindow = new Chat("c" + cNr);
                    newWindow.name.textContent = "Chat";
                    newWindow.icon.src = "/image/chat.png";
                    cNr += 1;
                });

                break;
            case 1:
                current.addEventListener("click", function(event) {
                    event.preventDefault();
                    newWindow = new Memory("m" + mNr);
                    mNr += 1;
                });

                break;
            case 2:
                current.addEventListener("click", function(event) {
                    event.preventDefault();
                    newWindow = new Remember("r" + rNr);
                    newWindow.name.textContent = "Remember";
                    newWindow.icon.src = "/image/notes.png";
                    rNr += 1;
                });

                break;
            case 3:
                current.addEventListener("click", function(event) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZW1lbWJlci5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9sb2NhbHN0b3JhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBNb2R1bGUgZm9yIENoYXQuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcbmNvbnN0IHN0b3JhZ2UgPSByZXF1aXJlKFwiLi9sb2NhbHN0b3JhZ2VcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIENoYXQuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gQ2hhdChpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICB0aGlzLnVzZXIgPSBcIlVua25vd25cIjtcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiKTtcbiAgICB0aGlzLm9wZW4oKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xuQ2hhdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlc2t0b3BXaW5kb3cucHJvdG90eXBlKTtcbkNoYXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2hhdDtcblxuLyoqXG4gKiBJbml0aWF0ZXMgdGhlIGFwcGxpY2F0aW9uLlxuICovXG5DaGF0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLCB0cnVlKTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICBsZXQgbWVzc2FnZUlucHV0ID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jaGF0TWVzc2FnZVwiKTtcbiAgICBsZXQgdXNlckluZm8gPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLnVzZXJcIik7XG4gICAgdGhpcy5nZXRVc2VyKHVzZXJJbmZvKTtcblxuICAgIG1lc3NhZ2VJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdGhpcy5lbW9qaXMobWVzc2FnZUlucHV0KTtcblxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMgfHwgZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy51c2VyICE9PSBcIlVua25vd25cIikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZChtZXNzYWdlSW5wdXQudmFsdWUpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VJbnB1dC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVzZXJJbmZvLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5hZGQoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG5cbiAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gXCJtZXNzYWdlXCIgfHwgZGF0YS50eXBlID09PSBcIm5vdGlmaWNhdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzLnJlY2VpdmUoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSB1c2VyIGZvciB0aGUgY2hhdCBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpdiAtIFRoZSBkaXYgaG9sZGluZyB0aGUgdXNlciBpbmZvcm1hdGlvbi5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuZ2V0VXNlciA9IGZ1bmN0aW9uKGRpdikge1xuICAgIGxldCBpbnB1dCA9IGRpdi5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICBsZXQgYnV0dG9uID0gZGl2Lmxhc3RFbGVtZW50Q2hpbGQ7XG4gICAgbGV0IHJlbW92ZVVzZXJFbGVtID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGRpdi5yZW1vdmVDaGlsZChpbnB1dCk7XG4gICAgICAgIGRpdi5yZW1vdmVDaGlsZChidXR0b24pO1xuICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImxvZ2dlZEluXCIpO1xuICAgICAgICBkaXYudGV4dENvbnRlbnQgPSBcIkxvZ2dlZCBpbiBhcyBcIiArIHRoaXMudXNlcjtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICBsZXQgZ2V0VXNlcm5hbWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGRpdi5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy51c2VyID0gZGl2LmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICAgICAgaW5wdXQuY2xhc3NMaXN0LnJlbW92ZShcInJlZGJnXCIpO1xuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgcmVtb3ZlVXNlckVsZW0oKTtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KFwidXNlcm5hbWVcIiwgdGhpcy51c2VyKTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIGlmICghc3RvcmFnZS5nZXQoXCJ1c2VybmFtZVwiKSkge1xuICAgICAgICBkaXYubGFzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2V0VXNlcm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXNlciA9IHN0b3JhZ2UuZ2V0KFwidXNlcm5hbWVcIik7XG4gICAgICAgIHJlbW92ZVVzZXJFbGVtKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kcm9wZG93bi50ZXh0Q29udGVudCA9IFwiQ2hhbmdlIHVzZXJcIjtcbiAgICB0aGlzLmRyb3Bkb3duLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkaXYudGV4dENvbnRlbnQgPSBcIlVzZXI6IFwiO1xuICAgICAgICBkaXYuY2xhc3NMaXN0LnJlbW92ZShcImxvZ2dlZEluXCIpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgdGhpcy51c2VyID0gXCJVbmtub3duXCI7XG4gICAgICAgIGRpdi5sYXN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXRVc2VybmFtZSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8qKlxuICogU2VuZHMgdHlwZWQgaW4gbWVzc2FnZXMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IC0gVGhlIGlucHV0IG1lc3NhZ2UgZnJvbSB0aGUgdGV4dGFyZWEuXG4gKi9cbkNoYXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgZGF0YTogaW5wdXQsXG4gICAgICAgIHVzZXJuYW1lOiB0aGlzLnVzZXIsXG4gICAgICAgIGtleTogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xufTtcblxuLyoqXG4gKiBSZWNlaXZlcyBhbmQgZGlzcGxheXMgbWVzc2FnZXMgaW4gYXBwbGljYXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSBUaGUgcmVjZWl2ZWQgZGF0YS5cbiAqL1xuQ2hhdC5wcm90b3R5cGUucmVjZWl2ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlQ29udGFpbmVyXCIpO1xuXG4gICAgbGV0IHVzZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICB1c2VyLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwidXNlcm5hbWVcIik7XG4gICAgdXNlci5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhLnVzZXJuYW1lKSk7XG4gICAgbGV0IHBFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgcEVsZW0uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YS5kYXRhKSk7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodXNlcik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHBFbGVtKTtcblxuICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gY29udGFpbmVyLmNsaWVudEhlaWdodDtcbn07XG5cbi8qKlxuICogUmVwbGFjZXMgY2VydGFpbiBjaGFyYWN0ZXIgY29tYmluYXRpb25zIHdpdGggZW1vamlzLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdXNlciBpbnB1dC5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuZW1vamlzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGxldCBlbW9qaXMgPSB7XG4gICAgICAgIFwiOilcIjogXCJcXHVEODNEXFx1REUwQVwiLFxuICAgICAgICBcIjspXCI6IFwiXFx1RDgzRFxcdURFMDlcIixcbiAgICAgICAgXCI6RFwiOiBcIlxcdUQ4M0RcXHVERTAzXCIsXG4gICAgICAgIFwiOlBcIjogXCJcXHVEODNEXFx1REUxQlwiLFxuICAgICAgICBcIjtQXCI6IFwiXFx1RDgzRFxcdURFMUNcIixcbiAgICAgICAgXCI6L1wiOiBcIlxcdUQ4M0RcXHVERTE1XCIsXG4gICAgICAgIFwiOihcIjogXCJcXHVEODNEXFx1REUxRVwiLFxuICAgICAgICBcIjonKFwiOiBcIlxcdUQ4M0RcXHVERTIyXCIsXG4gICAgICAgIFwiKHkpXCI6IFwiXFx1RDgzRFxcdURDNERcIixcbiAgICAgICAgXCI8M1wiOiBcIlxcdTI3NjRcXHVGRTBGXCJcbiAgICB9O1xuXG4gICAgZm9yIChsZXQgaSBpbiBlbW9qaXMpIHtcbiAgICAgICAgZWxlbWVudC52YWx1ZSA9IGVsZW1lbnQudmFsdWUucmVwbGFjZShpLCBlbW9qaXNbaV0pO1xuICAgIH1cbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7Q2hhdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIERlc2t0b3BXaW5kb3cuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgd2luZG93IHRvIGNyZWF0ZS5cbiAqIEB0aHJvd3Mge0Vycm9yfSAtIFdpbmRvdyBtdXN0IGhhdmUgYW4gaWQuXG4gKi9cbmZ1bmN0aW9uIERlc2t0b3BXaW5kb3coaWQpIHtcbiAgICBpZiAoIWlkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIldpbmRvdyBtdXN0IGhhdmUgYW4gaWQuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIHRvcC1uYW1lLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I25hbWVcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJuYW1lXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5hbWVcIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIHRvcC1uYW1lLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2ljb25cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpY29uXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmxvZ29cIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIGZvb3RlciBtZXNzYWdlIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjbWVzc2FnZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIm1lc3NhZ2VcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWZvb3RlclwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgZHJvcGRvd24gbGluayBpbiBtZW51LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2Ryb3Bkb3duXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZHJvcGRvd25cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKVswXTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgY3VycmVudCBEZXNrdG9wV2luZG93LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2RpdlxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImRpdlwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIGlkLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjaWRcbiAgICAgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IC0gTXVzdCBiZSBhIHN0cmluZy5cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpZFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIldpbmRvdyBpZCBtdXN0IGJlIGEgc3RyaW5nLlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmNyZWF0ZSgpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgd2luZG93IGZyb20gdGVtcGxhdGUuXG4gKi9cbkRlc2t0b3BXaW5kb3cucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93XCIpO1xuICAgIGxldCB3aW5kb3dEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVza3RvcFwiKS5hcHBlbmRDaGlsZCh3aW5kb3dEaXYpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdW5jbGFpbWVkXCIpLmlkID0gdGhpcy5pZDtcblxuICAgIGxldCBpZCA9IHRoaXMuaWQudG9TdHJpbmcoKTtcblxuICAgIHRoaXMucG9zaXRpb24oaWQpO1xuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQoKTtcblxuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuZGl2ICE9PSB0aGlzLmRpdi5wYXJlbnROb2RlLmxhc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMuZGl2LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5kaXYpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcInRleHRhcmVhXCIpIHx8XG4gICAgICAgICAgICBldmVudC50YXJnZXQgPT09IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFwiKSkge1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmZvY3VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlQ29udGFpbmVyXCIpO1xuICAgICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodCAtIGNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBQb3NpdGlvbnMgdGhlIHdpbmRvdyBpbiB0aGUgZGVza3RvcCwgc3RhY2tzIGlmIG5lY2Vzc2FyeS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUucG9zaXRpb24gPSBmdW5jdGlvbihpZCkge1xuICAgIGxldCBzdGFja1dpbmRvd3MgPSBmdW5jdGlvbihhcHApIHtcbiAgICAgICAgaWYgKGlkLmluZGV4T2YoXCIxXCIpID09PSAtMSkge1xuICAgICAgICAgICAgbGV0IGlkTnIgPSBpZC5jaGFyQXQoMSkgLSAxO1xuICAgICAgICAgICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFwcCArIGlkTnIpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGVsZW1lbnRCZWZvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhcHAgKyBpZE5yKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRUb3AgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IChlbGVtZW50QmVmb3JlLm9mZnNldExlZnQgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICBpZiAoaWQuaW5kZXhPZihcImNcIikgIT09IC0xKSB7XG4gICAgICAgIHN0YWNrV2luZG93cyhcImNcIik7XG4gICAgfSBlbHNlIGlmIChpZC5pbmRleE9mKFwibVwiKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9ICh0aGlzLmRpdi5vZmZzZXRMZWZ0ICsgMjAwKSArIFwicHhcIjtcbiAgICAgICAgc3RhY2tXaW5kb3dzKFwibVwiKTtcbiAgICB9IGVsc2UgaWYgKGlkLmluZGV4T2YoXCJyXCIpICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gKHRoaXMuZGl2Lm9mZnNldExlZnQgKyA0MDApICsgXCJweFwiO1xuICAgICAgICBzdGFja1dpbmRvd3MoXCJyXCIpO1xuICAgIH0gZWxzZSBpZiAoaWQuaW5kZXhPZihcImlcIikgIT09IC0xKSB7XG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAodGhpcy5kaXYub2Zmc2V0TGVmdCArIDYwMCkgKyBcInB4XCI7XG4gICAgICAgIHN0YWNrV2luZG93cyhcImlcIik7XG4gICAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGRyYWdnaW5nIG1vdmVtZW50cyBvZiB0aGUgd2luZG93LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5oYW5kbGVNb3ZlbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBwb3NYID0gMDtcbiAgICBsZXQgcG9zWSA9IDA7XG5cbiAgICBsZXQgbW92ZVdpbmRvdyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCA9IChldmVudC5jbGllbnRZIC0gcG9zWSkgKyBcInB4XCI7XG4gICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAoZXZlbnQuY2xpZW50WCAtIHBvc1gpICsgXCJweFwiO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIGxldCBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jbG9zZVwiKSkge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSh0aGlzLmRpdik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0ID09PSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1pbmltaXplXCIpKSB7XG4gICAgICAgICAgICB0aGlzLm1pbmltaXplKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMuZGl2KTtcbiAgICAgICAgcG9zWCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLmRpdi5vZmZzZXRMZWZ0O1xuICAgICAgICBwb3NZID0gZXZlbnQuY2xpZW50WSAtIHRoaXMuZGl2Lm9mZnNldFRvcDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5kaXYuZmlyc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBnZXRQb3NpdGlvbik7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVXaW5kb3cpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBNaW5pbWl6ZXMgd2luZG93LCBvciBtYXhpbWl6ZXMgaWYgY2xpY2tlZCBvbiB0aGUgcmVmZXJlbmNlLlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5taW5pbWl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZGl2LnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuXG4gICAgbGV0IGFUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhVGFnLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCIjXCIpO1xuXG4gICAgbGV0IGFkZFdpbmRvdyA9IGZ1bmN0aW9uKGljb25NZW51LCBhcHApIHtcbiAgICAgICAgaWNvbk1lbnUuYXBwZW5kQ2hpbGQoYVRhZyk7XG4gICAgICAgIGljb25NZW51LmNsYXNzTGlzdC5hZGQoXCJtaW5pbWl6ZWRcIik7XG4gICAgICAgIGljb25NZW51Lmxhc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBhcHAgKyBcIiBcIiArICh0aGlzLmlkLmNoYXJBdCgxKSk7XG5cbiAgICAgICAgaWNvbk1lbnUubGFzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgICBpY29uTWVudS5yZW1vdmVDaGlsZChldmVudC50YXJnZXQpO1xuXG4gICAgICAgICAgICBpZiAoIWljb25NZW51LmZpcnN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgICAgICAgICAgaWNvbk1lbnUuY2xhc3NMaXN0LnJlbW92ZShcIm1pbmltaXplZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICBsZXQgaWNvbk1lbnVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIm5hdiAuaWNvbi1tZW51XCIpO1xuXG4gICAgaWYgKHRoaXMuaWQuaW5kZXhPZihcImNcIikgIT09IC0xKSB7XG4gICAgICAgIGFkZFdpbmRvdyhpY29uTWVudXNbMF0sIFwiQ2hhdFwiKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaWQuaW5kZXhPZihcIm1cIikgIT09IC0xKSB7XG4gICAgICAgIGFkZFdpbmRvdyhpY29uTWVudXNbMV0sIFwiTWVtb3J5XCIpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pZC5pbmRleE9mKFwiclwiKSAhPT0gLTEpIHtcbiAgICAgICAgYWRkV2luZG93KGljb25NZW51c1syXSwgXCJSZW1lbWJlclwiKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaWQuaW5kZXhPZihcImlcIikgIT09IC0xKSB7XG4gICAgICAgIGFkZFdpbmRvdyhpY29uTWVudXNbM10sIFwiSW5mb1wiKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIENsb3NlcyB0aGUgd2luZG93LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHdpbmRvdyB0byBjbG9zZS5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuXG4gICAgaWYgKHRoaXMuc29ja2V0KSB7XG4gICAgICAgIHRoaXMuc29ja2V0LmNsb3NlKCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IERlc2t0b3BXaW5kb3c7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgTWVtb3J5LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIE1lbW9yeSBnYW1lLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKi9cbmZ1bmN0aW9uIE1lbW9yeShpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2l6ZSBvZiB0aGUgYm9hcmQuXG4gICAgICovXG4gICAgdGhpcy5zaXplID0gMTY7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXJyYXkgdG8gY29udGFpbiB0aGUgYnJpY2sgaW1hZ2VzLlxuICAgICAqL1xuICAgIHRoaXMuaW1hZ2VzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZmlyc3QgdHVybmVkIGJyaWNrLlxuICAgICAqL1xuICAgIHRoaXMudHVybjEgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNlY29uZCB0dXJuZWQgYnJpY2suXG4gICAgICovXG4gICAgdGhpcy50dXJuMiA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIHBhaXJzLlxuICAgICAqL1xuICAgIHRoaXMucGFpcnMgPSAwO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBjbGlja3MuXG4gICAgICovXG4gICAgdGhpcy5uck9mQ2xpY2tzID0gMDtcblxuICAgIHRoaXMuc3RhcnQoKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xuTWVtb3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGVza3RvcFdpbmRvdy5wcm90b3R5cGUpO1xuTWVtb3J5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbW9yeTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGdhbWUgYW5kIGFkZHMgZXZlbnQgbGlzdGVuZXJzLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaHVmZmxlKCk7XG4gICAgdGhpcy5zZXRTaXplKCk7XG4gICAgdGhpcy5zZXRNZW51KCk7XG5cbiAgICB0aGlzLmRyb3Bkb3duLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnJlc3RhcnQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgbGV0IGxpbmtzID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXS5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIik7XG4gICAgbGlua3MuZm9yRWFjaChmdW5jdGlvbihjdXJyZW50KSB7XG4gICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC50YXJnZXQudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiM3gyXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCI0eDNcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gMTI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCI0eDRcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gMTY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJlc3RhcnQoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBTZXRzIGVsZW1lbnRzIGZvciB0aGUgZHJvcC1kb3duIG1lbnUgdG8gYWxsb3cgY2hhbmdpbmcgc2l6ZSBvZiB0aGUgYm9hcmQuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc2V0TWVudSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBlbGVtZW50ID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZW51bGlua1wiKTtcbiAgICBsZXQgbWVudUNsb25lID0gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgZWxlbWVudC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKG1lbnVDbG9uZSk7XG5cbiAgICBsZXQgbmV3TGluayA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMV07XG4gICAgbmV3TGluay5maXJzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IFwiU2l6ZVwiO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyOyBpICs9IDEpIHtcbiAgICAgICAgbGV0IGRyb3Bkb3duQ2xvbmUgPSBuZXdMaW5rLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd24gYVwiKS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5ld0xpbmsubGFzdEVsZW1lbnRDaGlsZC5hcHBlbmRDaGlsZChkcm9wZG93bkNsb25lKTtcbiAgICB9XG5cbiAgICBsZXQgZHJvcGRvd25MaW5rcyA9IG5ld0xpbmsucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpO1xuICAgIGRyb3Bkb3duTGlua3NbMF0udGV4dENvbnRlbnQgPSBcIjN4MlwiO1xuICAgIGRyb3Bkb3duTGlua3NbMV0udGV4dENvbnRlbnQgPSBcIjR4M1wiO1xuICAgIGRyb3Bkb3duTGlua3NbMl0udGV4dENvbnRlbnQgPSBcIjR4NFwiO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBzaXplIG9mIHRoZSBib2FyZC5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlcIikuY29udGVudDtcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZCwgZmFsc2UpO1xuICAgIGxldCByZXN1bHRFbGVtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5sYXN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAodGhpcy5zaXplKSB7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiYm9hcmQ2XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImJvYXJkMTJcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiYm9hcmQxNlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCBhO1xuICAgIHRoaXMuaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UsIGluZGV4KSB7XG4gICAgICAgIGEgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgYS5maXJzdEVsZW1lbnRDaGlsZC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWJyaWNrTnJcIiwgaW5kZXgpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYSk7XG5cbiAgICB9KTtcblxuICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBsZXQgaW1nO1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUgPT09IFwiQVwiKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgICAgICAgICAgaW1nID0gZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUgPT09IFwiSU1HXCIpIHtcbiAgICAgICAgICAgIGltZyA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbWcpIHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGltZy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWJyaWNrTnJcIikpO1xuICAgICAgICAgICAgdGhpcy50dXJuQnJpY2sodGhpcy5pbWFnZXNbaW5kZXhdLCBpbmRleCwgaW1nKTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQocmVzdWx0RWxlbSk7XG59O1xuXG4vKipcbiAqIFNodWZmbGVzIHRoZSBhcnJheSB3aXRoIGltYWdlcy5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zaHVmZmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pbWFnZXMgPSBbMSwxLDIsMiwzLDMsNCw0LDUsNSw2LDYsNyw3LDgsOF07XG5cbiAgICBsZXQgaW5kZXhUb1N3YXA7XG4gICAgbGV0IHRlbXBJbWc7XG4gICAgbGV0IGltZ3M7XG5cbiAgICBzd2l0Y2ggKHRoaXMuc2l6ZSkge1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBpbWdzID0gdGhpcy5pbWFnZXMuc2xpY2UoMCwgNik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcy5zbGljZSgwLCAxMik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcztcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gdGhpcy5zaXplIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICBpbmRleFRvU3dhcCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpO1xuICAgICAgICB0ZW1wSW1nID0gaW1nc1tpXTtcbiAgICAgICAgaW1nc1tpXSA9IGltZ3NbaW5kZXhUb1N3YXBdO1xuICAgICAgICBpbWdzW2luZGV4VG9Td2FwXSA9IHRlbXBJbWc7XG4gICAgfVxuXG4gICAgdGhpcy5pbWFnZXMgPSBpbWdzO1xufTtcblxuLyoqXG4gKiBIYW5kbGVzIHRoZSBldmVudCBvZiB0dXJuaW5nIGEgYnJpY2suXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGJyaWNrSW1nIC0gVGhlIGltYWdlIG9mIHRoZSB0dXJuZWQgYnJpY2suXG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHR1cm5lZCBicmljay5cbiAqIEBwYXJhbSB7RWxlbWVudH0gaW1nIC0gVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgYnJpY2suXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUudHVybkJyaWNrID0gZnVuY3Rpb24oYnJpY2tJbWcsIGluZGV4LCBpbWcpIHtcbiAgICBpZiAodGhpcy50dXJuMikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaW1nLnNyYyA9IFwiL2ltYWdlL21lbW9yeS9cIiArIGJyaWNrSW1nICsgXCIucG5nXCI7XG5cbiAgICBpZiAoIXRoaXMudHVybjEpIHtcbiAgICAgICAgdGhpcy50dXJuMSA9IGltZztcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaW1nID09PSB0aGlzLnR1cm4xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5yT2ZDbGlja3MgKz0gMTtcbiAgICAgICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi50cmllc1wiKS50ZXh0Q29udGVudCA9IHRoaXMubnJPZkNsaWNrcy50b1N0cmluZygpO1xuXG4gICAgICAgIHRoaXMudHVybjIgPSBpbWc7XG4gICAgICAgIGlmICh0aGlzLnR1cm4xLnNyYyA9PT0gdGhpcy50dXJuMi5zcmMpIHtcbiAgICAgICAgICAgIHRoaXMucGFpcnMgKz0gMTtcbiAgICAgICAgICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIucGFpcnNcIikudGV4dENvbnRlbnQgPSB0aGlzLnBhaXJzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhaXJzID09PSB0aGlzLnNpemUgLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmRHYW1lKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJlbXB0eVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcImVtcHR5XCIpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMiA9IG51bGw7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDQwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjEuc3JjID0gXCIvaW1hZ2UvbWVtb3J5LzAucG5nXCI7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMi5zcmMgPSBcIi9pbWFnZS9tZW1vcnkvMC5wbmdcIjtcblxuICAgICAgICAgICAgICAgIHRoaXMudHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIgPSBudWxsO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1MDApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBFbmRzIHRoZSBnYW1lIGFuZCBkaXNwbGF5cyBtZXNzYWdlLlxuICovXG5NZW1vcnkucHJvdG90eXBlLmVuZEdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbWVzc2FnZSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZVwiKTtcblxuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIllvdSBmaW5pc2hlZCB0aGUgZ2FtZSFcIjtcbn07XG5cbi8qKlxuICogUmVzdGFydHMgYW5kIGNsZWFycyB0aGUgTWVtb3J5IGdhbWUuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG4gICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgdGhpcy5wYWlycyA9IDA7XG4gICAgdGhpcy5uck9mQ2xpY2tzID0gMDtcbiAgICB0aGlzLnNodWZmbGUoKTtcbiAgICB0aGlzLnNldFNpemUoKTtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7TWVtb3J5fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeTtcbiIsIi8qKlxuICogTW9kdWxlIGZvciBSZW1lbWJlciBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERlc2t0b3BXaW5kb3cgPSByZXF1aXJlKFwiLi9EZXNrdG9wV2luZG93XCIpO1xuY29uc3Qgc3RvcmFnZSA9IHJlcXVpcmUoXCIuL2xvY2Fsc3RvcmFnZVwiKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFJlbWVtYmVyLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIGlkXG4gKi9cbmZ1bmN0aW9uIFJlbWVtYmVyKGlkKSB7XG4gICAgRGVza3RvcFdpbmRvdy5jYWxsKHRoaXMsIGlkKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBhcnJheSB0byBob2xkIHRoZSBub3Rlcy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKi9cbiAgICB0aGlzLm5vdGVzID0gW107XG5cbiAgICB0aGlzLm5ldygpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5SZW1lbWJlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlc2t0b3BXaW5kb3cucHJvdG90eXBlKTtcblJlbWVtYmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlbWVtYmVyO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbm90ZS5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG5vdEZpcnN0IC0gV2hldGhlciBvciBub3QgdGhlIGNyZWF0ZWQgbm90ZSBpcyB0aGUgZmlyc3Qgb3Igbm90LlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUubmV3ID0gZnVuY3Rpb24obm90Rmlyc3QpIHtcbiAgICBpZiAobm90Rmlyc3QpIHtcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcbiAgICAgICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ub3RlcyA9IFtdO1xuICAgIH1cblxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVtZW1iZXJcIikuY29udGVudDtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUsIHRydWUpO1xuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuICAgIGxldCBpbnB1dCA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubm90ZS1pbnB1dFwiKTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFpbnB1dC52YWx1ZSkge1xuICAgICAgICAgICAgaW5wdXQuY2xhc3NMaXN0LmFkZChcInJlZGJnXCIpO1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJZb3UgbmVlZCB0byB3cml0ZSBhbiBpdGVtIGZvciB0aGUgbGlzdC5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0LmNsYXNzTGlzdC5yZW1vdmUoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgICAgICAgICB0aGlzLmFkZChpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICBpbnB1dC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgaWYgKCFub3RGaXJzdCkge1xuICAgICAgICB0aGlzLnNldE1lbnUoKTtcbiAgICAgICAgaWYgKHN0b3JhZ2UuZ2V0KFwibm90ZXNcIikgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZSh0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJvcGRvd24udGV4dENvbnRlbnQgPSBcIlNhdmVcIjtcbiAgICAgICAgdGhpcy5kcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5ub3RlIHBcIikubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIk5vdGUgaXMgZW1wdHkuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBkaWZmZXJlbnQgZHJvcGRvd24gbWVudXMuXG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZS5zZXRNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lbnVsaW5rXCIpO1xuICAgIGxldCBtZW51Q2xvbmUgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQobWVudUNsb25lKTtcblxuICAgIGxldCBuZXdMaW5rID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXTtcbiAgICBuZXdMaW5rLmZpcnN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gXCJOb3Rlc1wiO1xuICAgIG5ld0xpbmsucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93blwiKS5yZW1vdmVDaGlsZChuZXdMaW5rLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd24gYVwiKSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI7IGkgKz0gMSkge1xuICAgICAgICBsZXQgZHJvcGRvd25DbG9uZSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMF0ucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93biBhXCIpLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVswXS5sYXN0RWxlbWVudENoaWxkLmFwcGVuZENoaWxkKGRyb3Bkb3duQ2xvbmUpO1xuICAgIH1cblxuICAgIGxldCBkcm9wZG93bkxpbmtzID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIik7XG4gICAgZHJvcGRvd25MaW5rc1sxXS50ZXh0Q29udGVudCA9IFwiTmV3XCI7XG4gICAgZHJvcGRvd25MaW5rc1syXS50ZXh0Q29udGVudCA9IFwiRGVsZXRlIEFsbFwiO1xuXG4gICAgZHJvcGRvd25MaW5rc1sxXS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5uZXcodHJ1ZSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGRyb3Bkb3duTGlua3NbMl0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwibm90ZXNcIik7XG5cbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IG5ld0xpbmsubGFzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uZXcodHJ1ZSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8qKlxuICogQWRkcyBpbnB1dCB0byB0aGUgbm90ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgLSBVc2VyIGlucHV0IGZyb20gZWxlbWVudC5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgbGV0IG5vdGVFbGVtID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5ub3RlIHBcIilbMF0uY2xvbmVOb2RlKHRydWUpO1xuICAgIG5vdGVFbGVtLnRleHRDb250ZW50ID0gaW5wdXQ7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5ub3RlXCIpLmFwcGVuZENoaWxkKG5vdGVFbGVtKTtcblxuICAgIHRoaXMubm90ZXMucHVzaChpbnB1dCk7XG59O1xuXG4vKipcbiAqIFNhdmVzIGN1cnJlbnQgbm90ZSB0byBsb2NhbCBzdG9yYWdlIG9yIGdldHMgb2xkIG5vdGVzLlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb2xkTm90ZXMgLSBXaGV0aGVyIG9yIG5vdCB0aGVyZSBhcmUgb2xkIG5vdGVzIGluIGxvY2FsIHN0b3JhZ2UuXG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24ob2xkTm90ZXMpIHtcbiAgICBsZXQgbmV3TGluaztcbiAgICBsZXQgZHJvcGRvd25MaW5rO1xuXG4gICAgbGV0IGFkZE1lbnVOb3RlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG5ld0xpbmsgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzFdO1xuICAgICAgICBsZXQgZHJvcGRvd25DbG9uZSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMF0uXG4gICAgICAgICAgICBxdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duIGFcIikuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBuZXdMaW5rLmxhc3RFbGVtZW50Q2hpbGQuYXBwZW5kQ2hpbGQoZHJvcGRvd25DbG9uZSk7XG5cbiAgICAgICAgZHJvcGRvd25MaW5rID0gbmV3TGluay5xdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duXCIpLmxhc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgIGRyb3Bkb3duTGluay50ZXh0Q29udGVudCA9IFwiTm90ZSBcIiArIChuZXdMaW5rLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKS5sZW5ndGgpO1xuXG4gICAgICAgIGRyb3Bkb3duTGluay5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsZXQgbnIgPSBldmVudC50YXJnZXQudGV4dENvbnRlbnQuY2hhckF0KGV2ZW50LnRhcmdldC50ZXh0Q29udGVudC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIGlmIChuciA9PT0gMCkge1xuICAgICAgICAgICAgICAgIG5yID0gOTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5nZXQobnIpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIGxldCBub3RlcyA9IChzdG9yYWdlLmdldChcIm5vdGVzXCIpID09PSBudWxsKSA/IDAgOiBzdG9yYWdlLmdldChcIm5vdGVzXCIpLm5vdGVzO1xuICAgIGlmIChvbGROb3Rlcykge1xuICAgICAgICBub3Rlcy5mb3JFYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYWRkTWVudU5vdGUoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobm90ZXMgPT09IDAgfHwgbm90ZXMubGVuZ3RoIDw9IDQpIHtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KFwibm90ZXNcIiwgdGhpcy5ub3Rlcyk7XG4gICAgICAgICAgICBhZGRNZW51Tm90ZSgpO1xuICAgICAgICAgICAgdGhpcy5uZXcodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIllvdSBhbHJlYWR5IGhhdmUgNSBzYXZlZCBub3Rlcy5cIjtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogR2V0cyB0aGUgaXRlbSB0aGF0IHdhcyBjbGlja2VkIG9uIGZyb20gbGlzdC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbnIgLSBUaGUgbnVtYmVyIG9mIHRoZSBjbGlja2VkIGl0ZW0gaW4gbG9jYWwgc3RvcmFnZSBhcnJheS5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5yKSB7XG4gICAgbGV0IG5vdGVzID0gc3RvcmFnZS5nZXQoXCJub3Rlc1wiKS5ub3RlcztcbiAgICBsZXQgbm90ZUNvbnRlbnQgPSBub3Rlc1sobnIgLSAxKV07XG5cbiAgICBsZXQgY29udGFpbmVyID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5ub3RlXCIpO1xuICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVtZW1iZXJcIikuY29udGVudDtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuZmlyc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuICAgIG5vdGVDb250ZW50LmZvckVhY2goZnVuY3Rpb24oY3VycmVudCkge1xuICAgICAgICBsZXQgbm90ZUVsZW0gPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm5vdGUgcFwiKVswXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5vdGVFbGVtLnRleHRDb250ZW50ID0gY3VycmVudDtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vdGVFbGVtKTtcbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtSZW1lbWJlcn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBSZW1lbWJlcjtcbiIsIi8qKlxuICogU3RhcnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5jb25zdCBkZXNrdG9wID0gcmVxdWlyZShcIi4vZGVza3RvcFwiKTtcblxuZGVza3RvcC5pbml0KCk7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgZGVza3RvcC5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5jb25zdCBDaGF0ID0gcmVxdWlyZShcIi4vQ2hhdFwiKTtcbmNvbnN0IE1lbW9yeSA9IHJlcXVpcmUoXCIuL01lbW9yeVwiKTtcbmNvbnN0IFJlbWVtYmVyID0gcmVxdWlyZShcIi4vUmVtZW1iZXJcIik7XG5cbi8qKlxuICogR2V0cyB0aGUgY3VycmVudCB0aW1lIGFuZCBwcmVzZW50cyBpdCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIC0gVGhlIGNvbnRhaW5lciBvZiB0aGUgY2xvY2suXG4gKi9cbmZ1bmN0aW9uIGRlc2t0b3BDbG9jayhjb250YWluZXIpIHtcbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Nsb2NrXCIpO1xuICAgIH1cblxuICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IGhvdXJzID0gdG9kYXkuZ2V0SG91cnMoKTtcbiAgICBsZXQgbWlucyA9IHRvZGF5LmdldE1pbnV0ZXMoKTtcblxuICAgIGlmIChtaW5zIDwgMTApIHtcbiAgICAgICAgbWlucyA9IFwiMFwiICsgbWlucztcbiAgICB9XG5cbiAgICBpZiAoaG91cnMgPCAxMCkge1xuICAgICAgICBob3VycyA9IFwiMFwiICsgaG91cnM7XG4gICAgfVxuXG4gICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gaG91cnMgKyBcIjpcIiArIG1pbnM7XG59XG5cbi8qKlxuICogR2V0cyB0b2RheSdzIGRhdGUgYW5kIHByZXNlbnRzIGl0IGluIHRoZSBnaXZlbiBjb250YWluZXIuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIgLSBUaGUgY29udGFpbmVyIG9mIHRoZSBjbG9jay5cbiAqL1xuZnVuY3Rpb24gZ2V0RGF0ZShjb250YWluZXIpIHtcbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBtb250aCA9IFtcImphblwiLCBcImZlYlwiLCBcIm1hclwiLCBcImFwclwiLCBcIm1heVwiLCBcImp1bmVcIiwgXCJqdWx5XCIsIFwiYXVnXCIsIFwic2VwdFwiLCBcIm9jdFwiLCBcIm5vdlwiLCBcImRlY1wiXTtcbiAgICBjb250YWluZXIudGV4dENvbnRlbnQgPSB0b2RheS5nZXREYXRlKCkgKyBcIiBcIiArIG1vbnRoW3RvZGF5LmdldE1vbnRoKCldICsgXCIgXCIgKyB0b2RheS5nZXRGdWxsWWVhcigpO1xufVxuXG4vKipcbiAqIEdldHMgYXBwbGljYXRpb24gaW5mb3JtYXRpb24gZm9yIGluZm8gd2luZG93LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgdG8gZGlzcGxheSB0aGUgaW5mb3JtYXRpb24gaW4uXG4gKi9cbmZ1bmN0aW9uIGluZm8oZWxlbWVudCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5mb1wiKS5jb250ZW50O1xuICAgIGxldCBjb250YWluZXIgPSBlbGVtZW50LmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZSwgdHJ1ZSkpO1xuICAgIGxldCBtZW51ID0gZWxlbWVudC5kaXYucXVlcnlTZWxlY3RvcihcIi5tZW51XCIpO1xuICAgIG1lbnUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtZW51KTtcbn1cblxuLyoqXG4gKiBJbml0aWF0ZXMgZGVza3RvcCBieSBhZGRpbmcgbmVjZXNzYXJ5IGV2ZW50IGxpc3RlbmVycy5cbiAqL1xuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBsZXQgbmV3V2luZG93O1xuICAgIGxldCBjTnIgPSAxO1xuICAgIGxldCBtTnIgPSAxO1xuICAgIGxldCByTnIgPSAxO1xuICAgIGxldCBpTnIgPSAxO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJuYXYgLmljb25zXCIpLmZvckVhY2goZnVuY3Rpb24oY3VycmVudCwgaW5kZXgpIHtcbiAgICAgICAgc3dpdGNoIChpbmRleCl7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IENoYXQoXCJjXCIgKyBjTnIpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cubmFtZS50ZXh0Q29udGVudCA9IFwiQ2hhdFwiO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cuaWNvbi5zcmMgPSBcIi9pbWFnZS9jaGF0LnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICBjTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBNZW1vcnkoXCJtXCIgKyBtTnIpO1xuICAgICAgICAgICAgICAgICAgICBtTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBSZW1lbWJlcihcInJcIiArIHJOcik7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5uYW1lLnRleHRDb250ZW50ID0gXCJSZW1lbWJlclwiO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cuaWNvbi5zcmMgPSBcIi9pbWFnZS9ub3Rlcy5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgck5yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgRGVza3RvcFdpbmRvdyhcImlcIiArIGlOcik7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5uYW1lLnRleHRDb250ZW50ID0gXCJBcHBsaWNhdGlvbiBpbmZvXCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL2luZm8ucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIGluZm8obmV3V2luZG93KTtcbiAgICAgICAgICAgICAgICAgICAgaU5yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZ2V0RGF0ZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RhdGVcIikpO1xuICAgIGRlc2t0b3BDbG9jayhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Nsb2NrXCIpKTtcbiAgICBzZXRJbnRlcnZhbChkZXNrdG9wQ2xvY2ssIDUwMDApO1xufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgZ2V0Q2xvY2s6IGRlc2t0b3BDbG9jayxcbiAgICBnZXREYXRlOiBnZXREYXRlLFxuICAgIGdldEluZm86IGluZm9cbn07XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgaGFuZGxpbmcgbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogR2V0cyBhbiBpdGVtIGZyb20gbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpdGVtIHRvIGdldC5cbiAqIEByZXR1cm5zIGl0ZW0gLSBUaGUgcmVxdWVzdGVkIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZ2V0KG5hbWUpIHtcbiAgICBpZiAobmFtZSA9PT0gXCJub3Rlc1wiKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKG5hbWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFNldHMgYW4gaXRlbSBpbiBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpdGVtTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpdGVtIHRvIHNldC5cbiAqIEBwYXJhbSBpdGVtIC0gVGhlIGl0ZW0uXG4gKi9cbmZ1bmN0aW9uIHNldChpdGVtTmFtZSwgaXRlbSkge1xuICAgIGlmIChpdGVtTmFtZSA9PT0gXCJub3Rlc1wiKSB7XG4gICAgICAgIGxldCBub3RlcztcbiAgICAgICAgaWYgKGdldChpdGVtTmFtZSkpIHtcbiAgICAgICAgICAgIG5vdGVzID0gZ2V0KGl0ZW1OYW1lKS5ub3RlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vdGVzID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBub3Rlcy5wdXNoKGl0ZW0pO1xuICAgICAgICBsZXQgYWxsTm90ZXMgPSB7XG4gICAgICAgICAgICBub3Rlczogbm90ZXNcbiAgICAgICAgfTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShpdGVtTmFtZSwgSlNPTi5zdHJpbmdpZnkoYWxsTm90ZXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShpdGVtTmFtZSwgaXRlbSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0OiBzZXQsXG4gICAgZ2V0OiBnZXRcbn07XG4iXX0=
