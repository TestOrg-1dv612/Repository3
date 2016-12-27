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
function Chat(id, user) {
    DesktopWindow.call(this, id);

    this.user = user || "Unknown";
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
    document.getElementById(this.id).querySelector(".content").appendChild(content);

    let messageInput = document.getElementById(this.id).querySelector(".chatMessage");
    let userInfo = document.getElementById(this.id).querySelector(".user");
    this.getUser(userInfo);

    messageInput.addEventListener("keypress", function(event) {
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
            storage.set(this.user);
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
    let container = document.getElementById(this.id).querySelector(".messageContainer");

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
 * Exports.
 *
 * @type {Chat}
 */
module.exports = Chat;

},{"./DesktopWindow":2,"./localstorage":6}],2:[function(require,module,exports){
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
            return document.getElementById(this.id).querySelector(".name");
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
            return document.getElementById(this.id).querySelector(".logo");
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
            return document.getElementById(this.id).querySelector(".dropdown a");
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
    let div = document.getElementById(this.id);

    this.position(id, div);
    this.handleMovement(div);

    div.querySelector(".content").addEventListener("click", function(event) {
        if (div !== div.parentNode.lastElementChild) {
            div.parentNode.appendChild(div);
        }

        if (event.target === document.getElementById(this.id).querySelector("textarea") ||
            event.target === document.getElementById(this.id).querySelector("input")) {
            event.target.focus();
        }

        let container = document.getElementById(this.id).querySelector(".messageContainer");
        if (container) {
            container.scrollTop = container.scrollHeight - container.clientHeight;
        }
    }.bind(this));
};

/**
 * Positions the window in the desktop, stacks if necessary.
 *
 * @param {String} id - The id of the window.
 * @param {Element} div - The window element.
 */
DesktopWindow.prototype.position = function(id, div) {
    let stackWindows = function(app) {
        if (id.indexOf("1") === -1) {
            let idNr = id.charAt(1) - 1;
            if (document.getElementById(app + idNr)) {
                let elementBefore = document.getElementById(app + idNr);
                div.style.top = (elementBefore.offsetTop + 35) + "px";
                div.style.left = (elementBefore.offsetLeft + 35) + "px";
            }
        }
    };

    if (id.indexOf("c") !== -1) {
        stackWindows("c");
    } else if (id.indexOf("m") !== -1) {
        div.style.left = (div.offsetLeft + 250) + "px";
        stackWindows("m");
    } else if (id.indexOf("i") !== -1) {
        div.style.left = (div.offsetLeft + 500) + "px";
        stackWindows("i");
    }
};

/**
 * Handles dragging movements of the window.
 *
 * @param {Element} div - The div containing the window.
 */
DesktopWindow.prototype.handleMovement = function(div) {
    let posX = 0;
    let posY = 0;

    let moveWindow = function(event) {
        div.style.top = (event.clientY - posY) + "px";
        div.style.left = (event.clientX - posX) + "px";
    };

    let getPosition = function(event) {
        event.preventDefault();

        if (event.target === div.querySelector(".close")) {
            this.close(div);
            return;
        }

        div.parentNode.appendChild(div);
        posX = event.clientX - div.offsetLeft;
        posY = event.clientY - div.offsetTop;
        window.addEventListener("mousemove", moveWindow);
    }.bind(this);

    div.firstElementChild.addEventListener("mousedown", getPosition);

    window.addEventListener("mouseup", function() {
        window.removeEventListener("mousemove", moveWindow);
    });
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
 * Starts the game.
 */
Memory.prototype.start = function() {
    this.shuffle();
    this.setSize();

    this.dropdown.addEventListener("click", function(event) {
        event.preventDefault();
        this.restart(document.getElementById(this.id).querySelector(".content"));
    }.bind(this));
};

/**
 * Sets the size of the board.
 */
Memory.prototype.setSize = function() {
    let templateDiv = document.querySelector("#memory").content;
    let div = document.importNode(templateDiv.firstElementChild, false);
    let resultElem = document.importNode(templateDiv.lastElementChild, true);

    switch (this.size) {
        case 4:
            div.classList.add("board4");
            break;
        case 6:
            div.classList.add("board6");
            break;
        case 16:
            div.classList.add("board16");
            break;
    }

    let a;
    let _this = this;
    this.images.forEach(function(image, index) {
        a = document.importNode(templateDiv.firstElementChild.firstElementChild, true);
        a.firstElementChild.setAttribute("data-brickNr", index);
        div.appendChild(a);

    });

    div.addEventListener("click", function(event) {
        event.preventDefault();

        let img = (event.target.nodeName === "IMG") ? event.target : event.target.firstElementChild;
        let index = parseInt(img.getAttribute("data-brickNr"));
        _this.turnBrick(this.images[index], index, img);
    }.bind(this));

    document.getElementById(this.id).querySelector(".content").appendChild(div);
    document.getElementById(this.id).querySelector(".content").appendChild(resultElem);
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
        case 4:
            imgs = this.images.slice(0, 4);
            break;
        case 6:
            imgs = this.images.slice(0, 6);
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
        document.getElementById(this.id).querySelector(".tries").textContent = this.nrOfClicks.toString();

        this.turn2 = img;
        if (this.turn1.src === this.turn2.src) {
            this.pairs += 1;
            document.getElementById(this.id).querySelector(".pairs").textContent = this.pairs.toString();

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
    let message = document.getElementById(this.id).querySelector(".message");

    message.textContent = "You finished the game!";
};

/**
 * Restarts the Memory game.
 *
 * @param {Element} container - The container to remove elements from.
 */
Memory.prototype.restart = function(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    this.pairs = 0;
    this.nrOfClicks = 0;
    this.start();
};

/**
 * Exports.
 *
 * @type {Memory}
 */
module.exports = Memory;

},{"./DesktopWindow":2}],4:[function(require,module,exports){
/**
 * Start of the application.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

const desktop = require("./desktop");

desktop.init();

},{"./desktop":5}],5:[function(require,module,exports){
/**
 * Module for desktop.
 */

"use strict";

const DesktopWindow = require("./DesktopWindow");
const Chat = require("./Chat");
const Memory = require("./Memory");

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
    let container = document.getElementById(element.id).querySelector(".content");

    container.appendChild(document.importNode(template, true));
}

/**
 * Initiates desktop by adding necessary event listeners.
 */
function init() {
    let newWindow;
    let cNr = 1;
    let mNr = 1;
    let iNr = 1;
    document.querySelectorAll("nav a").forEach(function(current, index) {
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

},{"./Chat":1,"./DesktopWindow":2,"./Memory":3}],6:[function(require,module,exports){
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

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL2xvY2Fsc3RvcmFnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogTW9kdWxlIGZvciBDaGF0LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5jb25zdCBzdG9yYWdlID0gcmVxdWlyZShcIi4vbG9jYWxzdG9yYWdlXCIpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYSBDaGF0LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKi9cbmZ1bmN0aW9uIENoYXQoaWQsIHVzZXIpIHtcbiAgICBEZXNrdG9wV2luZG93LmNhbGwodGhpcywgaWQpO1xuXG4gICAgdGhpcy51c2VyID0gdXNlciB8fCBcIlVua25vd25cIjtcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiKTtcbiAgICB0aGlzLm9wZW4oKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xuQ2hhdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlc2t0b3BXaW5kb3cucHJvdG90eXBlKTtcbkNoYXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2hhdDtcblxuLyoqXG4gKiBJbml0aWF0ZXMgdGhlIGFwcGxpY2F0aW9uLlxuICovXG5DaGF0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLCB0cnVlKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICBsZXQgbWVzc2FnZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5jaGF0TWVzc2FnZVwiKTtcbiAgICBsZXQgdXNlckluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLnVzZXJcIik7XG4gICAgdGhpcy5nZXRVc2VyKHVzZXJJbmZvKTtcblxuICAgIG1lc3NhZ2VJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzIHx8IGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudXNlciAhPT0gXCJVbmtub3duXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQobWVzc2FnZUlucHV0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlSW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1c2VySW5mby5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuYWRkKFwicmVkYmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgIGlmIChkYXRhLnR5cGUgPT09IFwibWVzc2FnZVwiIHx8IGRhdGEudHlwZSA9PT0gXCJub3RpZmljYXRpb25cIikge1xuICAgICAgICAgICAgdGhpcy5yZWNlaXZlKGRhdGEpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgdXNlciBmb3IgdGhlIGNoYXQgYXBwbGljYXRpb24uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBkaXYgLSBUaGUgZGl2IGhvbGRpbmcgdGhlIHVzZXIgaW5mb3JtYXRpb24uXG4gKi9cbkNoYXQucHJvdG90eXBlLmdldFVzZXIgPSBmdW5jdGlvbihkaXYpIHtcbiAgICBsZXQgaW5wdXQgPSBkaXYuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgbGV0IGJ1dHRvbiA9IGRpdi5sYXN0RWxlbWVudENoaWxkO1xuICAgIGxldCByZW1vdmVVc2VyRWxlbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBkaXYucmVtb3ZlQ2hpbGQoaW5wdXQpO1xuICAgICAgICBkaXYucmVtb3ZlQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJsb2dnZWRJblwiKTtcbiAgICAgICAgZGl2LnRleHRDb250ZW50ID0gXCJMb2dnZWQgaW4gYXMgXCIgKyB0aGlzLnVzZXI7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgbGV0IGdldFVzZXJuYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChkaXYuZmlyc3RFbGVtZW50Q2hpbGQudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IGRpdi5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcbiAgICAgICAgICAgIGlucHV0LmNsYXNzTGlzdC5yZW1vdmUoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIGlucHV0LnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgIHJlbW92ZVVzZXJFbGVtKCk7XG4gICAgICAgICAgICBzdG9yYWdlLnNldCh0aGlzLnVzZXIpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgaWYgKCFzdG9yYWdlLmdldChcInVzZXJuYW1lXCIpKSB7XG4gICAgICAgIGRpdi5sYXN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXRVc2VybmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51c2VyID0gc3RvcmFnZS5nZXQoXCJ1c2VybmFtZVwiKTtcbiAgICAgICAgcmVtb3ZlVXNlckVsZW0oKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyb3Bkb3duLnRleHRDb250ZW50ID0gXCJDaGFuZ2UgdXNlclwiO1xuICAgIHRoaXMuZHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IFwiVXNlcjogXCI7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QucmVtb3ZlKFwibG9nZ2VkSW5cIik7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB0aGlzLnVzZXIgPSBcIlVua25vd25cIjtcbiAgICAgICAgZGl2Lmxhc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldFVzZXJuYW1lKTtcbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBTZW5kcyB0eXBlZCBpbiBtZXNzYWdlcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgLSBUaGUgaW5wdXQgbWVzc2FnZSBmcm9tIHRoZSB0ZXh0YXJlYS5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICBkYXRhOiBpbnB1dCxcbiAgICAgICAgdXNlcm5hbWU6IHRoaXMudXNlcixcbiAgICAgICAga2V5OiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG59O1xuXG4vKipcbiAqIFJlY2VpdmVzIGFuZCBkaXNwbGF5cyBtZXNzYWdlcyBpbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIFRoZSByZWNlaXZlZCBkYXRhLlxuICovXG5DaGF0LnByb3RvdHlwZS5yZWNlaXZlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VDb250YWluZXJcIik7XG5cbiAgICBsZXQgdXNlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIHVzZXIuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJ1c2VybmFtZVwiKTtcbiAgICB1c2VyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEudXNlcm5hbWUpKTtcbiAgICBsZXQgcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBwRWxlbS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhLmRhdGEpKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh1c2VyKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocEVsZW0pO1xuXG4gICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtDaGF0fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEZXNrdG9wV2luZG93LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cgdG8gY3JlYXRlLlxuICogQHRocm93cyB7RXJyb3J9IC0gV2luZG93IG11c3QgaGF2ZSBhbiBpZC5cbiAqL1xuZnVuY3Rpb24gRGVza3RvcFdpbmRvdyhpZCkge1xuICAgIGlmICghaWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2luZG93IG11c3QgaGF2ZSBhbiBpZC5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgdG9wLW5hbWUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjbmFtZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIm5hbWVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIubmFtZVwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgdG9wLW5hbWUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjaWNvblxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImljb25cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIubG9nb1wiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgZHJvcGRvd24gbGluayBpbiBtZW51LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2Ryb3Bkb3duXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZHJvcGRvd25cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd24gYVwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgaWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNpZFxuICAgICAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gLSBNdXN0IGJlIGEgc3RyaW5nLlxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImlkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiV2luZG93IGlkIG11c3QgYmUgYSBzdHJpbmcuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuY3JlYXRlKCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB3aW5kb3cgZnJvbSB0ZW1wbGF0ZS5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dcIik7XG4gICAgbGV0IHdpbmRvd0RpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZXNrdG9wXCIpLmFwcGVuZENoaWxkKHdpbmRvd0Rpdik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN1bmNsYWltZWRcIikuaWQgPSB0aGlzLmlkO1xuXG4gICAgbGV0IGlkID0gdGhpcy5pZC50b1N0cmluZygpO1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKTtcblxuICAgIHRoaXMucG9zaXRpb24oaWQsIGRpdik7XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChkaXYpO1xuXG4gICAgZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGRpdiAhPT0gZGl2LnBhcmVudE5vZGUubGFzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICAgICAgZGl2LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCJ0ZXh0YXJlYVwiKSB8fFxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0ID09PSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIikpIHtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICAgICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8qKlxuICogUG9zaXRpb25zIHRoZSB3aW5kb3cgaW4gdGhlIGRlc2t0b3AsIHN0YWNrcyBpZiBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpdiAtIFRoZSB3aW5kb3cgZWxlbWVudC5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUucG9zaXRpb24gPSBmdW5jdGlvbihpZCwgZGl2KSB7XG4gICAgbGV0IHN0YWNrV2luZG93cyA9IGZ1bmN0aW9uKGFwcCkge1xuICAgICAgICBpZiAoaWQuaW5kZXhPZihcIjFcIikgPT09IC0xKSB7XG4gICAgICAgICAgICBsZXQgaWROciA9IGlkLmNoYXJBdCgxKSAtIDE7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXBwICsgaWROcikpIHtcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudEJlZm9yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFwcCArIGlkTnIpO1xuICAgICAgICAgICAgICAgIGRpdi5zdHlsZS50b3AgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRUb3AgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRMZWZ0ICsgMzUpICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGlmIChpZC5pbmRleE9mKFwiY1wiKSAhPT0gLTEpIHtcbiAgICAgICAgc3RhY2tXaW5kb3dzKFwiY1wiKTtcbiAgICB9IGVsc2UgaWYgKGlkLmluZGV4T2YoXCJtXCIpICE9PSAtMSkge1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChkaXYub2Zmc2V0TGVmdCArIDI1MCkgKyBcInB4XCI7XG4gICAgICAgIHN0YWNrV2luZG93cyhcIm1cIik7XG4gICAgfSBlbHNlIGlmIChpZC5pbmRleE9mKFwiaVwiKSAhPT0gLTEpIHtcbiAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSAoZGl2Lm9mZnNldExlZnQgKyA1MDApICsgXCJweFwiO1xuICAgICAgICBzdGFja1dpbmRvd3MoXCJpXCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBkcmFnZ2luZyBtb3ZlbWVudHMgb2YgdGhlIHdpbmRvdy5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpdiAtIFRoZSBkaXYgY29udGFpbmluZyB0aGUgd2luZG93LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5oYW5kbGVNb3ZlbWVudCA9IGZ1bmN0aW9uKGRpdikge1xuICAgIGxldCBwb3NYID0gMDtcbiAgICBsZXQgcG9zWSA9IDA7XG5cbiAgICBsZXQgbW92ZVdpbmRvdyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGRpdi5zdHlsZS50b3AgPSAoZXZlbnQuY2xpZW50WSAtIHBvc1kpICsgXCJweFwiO1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChldmVudC5jbGllbnRYIC0gcG9zWCkgKyBcInB4XCI7XG4gICAgfTtcblxuICAgIGxldCBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VcIikpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoZGl2KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgIHBvc1ggPSBldmVudC5jbGllbnRYIC0gZGl2Lm9mZnNldExlZnQ7XG4gICAgICAgIHBvc1kgPSBldmVudC5jbGllbnRZIC0gZGl2Lm9mZnNldFRvcDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgZGl2LmZpcnN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZ2V0UG9zaXRpb24pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlV2luZG93KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgd2luZG93IHRvIGNsb3NlLlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG5cbiAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge0Rlc2t0b3BXaW5kb3d9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gRGVza3RvcFdpbmRvdztcbiIsIi8qKlxuICogTW9kdWxlIGZvciBNZW1vcnkuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgTWVtb3J5IGdhbWUuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gTWVtb3J5KGlkKSB7XG4gICAgRGVza3RvcFdpbmRvdy5jYWxsKHRoaXMsIGlkKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzaXplIG9mIHRoZSBib2FyZC5cbiAgICAgKi9cbiAgICB0aGlzLnNpemUgPSAxNjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBhcnJheSB0byBjb250YWluIHRoZSBicmljayBpbWFnZXMuXG4gICAgICovXG4gICAgdGhpcy5pbWFnZXMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBmaXJzdCB0dXJuZWQgYnJpY2suXG4gICAgICovXG4gICAgdGhpcy50dXJuMSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2Vjb25kIHR1cm5lZCBicmljay5cbiAgICAgKi9cbiAgICB0aGlzLnR1cm4yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgcGFpcnMuXG4gICAgICovXG4gICAgdGhpcy5wYWlycyA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIGNsaWNrcy5cbiAgICAgKi9cbiAgICB0aGlzLm5yT2ZDbGlja3MgPSAwO1xuXG4gICAgdGhpcy5zdGFydCgpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5NZW1vcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNrdG9wV2luZG93LnByb3RvdHlwZSk7XG5NZW1vcnkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVtb3J5O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgZ2FtZS5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2h1ZmZsZSgpO1xuICAgIHRoaXMuc2V0U2l6ZSgpO1xuXG4gICAgdGhpcy5kcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5yZXN0YXJ0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgc2l6ZSBvZiB0aGUgYm9hcmQuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc2V0U2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wbGF0ZURpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5XCIpLmNvbnRlbnQ7XG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQsIGZhbHNlKTtcbiAgICBsZXQgcmVzdWx0RWxlbSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYubGFzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKHRoaXMuc2l6ZSkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImJvYXJkNFwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImJvYXJkNlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDE2XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbGV0IGE7XG4gICAgbGV0IF90aGlzID0gdGhpcztcbiAgICB0aGlzLmltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlLCBpbmRleCkge1xuICAgICAgICBhID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuc2V0QXR0cmlidXRlKFwiZGF0YS1icmlja05yXCIsIGluZGV4KTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGEpO1xuXG4gICAgfSk7XG5cbiAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgbGV0IGltZyA9IChldmVudC50YXJnZXQubm9kZU5hbWUgPT09IFwiSU1HXCIpID8gZXZlbnQudGFyZ2V0IDogZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbWcuZ2V0QXR0cmlidXRlKFwiZGF0YS1icmlja05yXCIpKTtcbiAgICAgICAgX3RoaXMudHVybkJyaWNrKHRoaXMuaW1hZ2VzW2luZGV4XSwgaW5kZXgsIGltZyk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChyZXN1bHRFbGVtKTtcbn07XG5cbi8qKlxuICogU2h1ZmZsZXMgdGhlIGFycmF5IHdpdGggaW1hZ2VzLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnNodWZmbGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmltYWdlcyA9IFsxLDEsMiwyLDMsMyw0LDQsNSw1LDYsNiw3LDcsOCw4XTtcblxuICAgIGxldCBpbmRleFRvU3dhcDtcbiAgICBsZXQgdGVtcEltZztcbiAgICBsZXQgaW1ncztcblxuICAgIHN3aXRjaCAodGhpcy5zaXplKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcy5zbGljZSgwLCA0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBpbWdzID0gdGhpcy5pbWFnZXMuc2xpY2UoMCwgNik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcztcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gdGhpcy5zaXplIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICBpbmRleFRvU3dhcCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpO1xuICAgICAgICB0ZW1wSW1nID0gaW1nc1tpXTtcbiAgICAgICAgaW1nc1tpXSA9IGltZ3NbaW5kZXhUb1N3YXBdO1xuICAgICAgICBpbWdzW2luZGV4VG9Td2FwXSA9IHRlbXBJbWc7XG4gICAgfVxuXG4gICAgdGhpcy5pbWFnZXMgPSBpbWdzO1xufTtcblxuLyoqXG4gKiBIYW5kbGVzIHRoZSBldmVudCBvZiB0dXJuaW5nIGEgYnJpY2suXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGJyaWNrSW1nIC0gVGhlIGltYWdlIG9mIHRoZSB0dXJuZWQgYnJpY2suXG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHR1cm5lZCBicmljay5cbiAqIEBwYXJhbSB7RWxlbWVudH0gaW1nIC0gVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgYnJpY2suXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUudHVybkJyaWNrID0gZnVuY3Rpb24oYnJpY2tJbWcsIGluZGV4LCBpbWcpIHtcbiAgICBpZiAodGhpcy50dXJuMikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaW1nLnNyYyA9IFwiL2ltYWdlL21lbW9yeS9cIiArIGJyaWNrSW1nICsgXCIucG5nXCI7XG5cbiAgICBpZiAoIXRoaXMudHVybjEpIHtcbiAgICAgICAgdGhpcy50dXJuMSA9IGltZztcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaW1nID09PSB0aGlzLnR1cm4xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5yT2ZDbGlja3MgKz0gMTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi50cmllc1wiKS50ZXh0Q29udGVudCA9IHRoaXMubnJPZkNsaWNrcy50b1N0cmluZygpO1xuXG4gICAgICAgIHRoaXMudHVybjIgPSBpbWc7XG4gICAgICAgIGlmICh0aGlzLnR1cm4xLnNyYyA9PT0gdGhpcy50dXJuMi5zcmMpIHtcbiAgICAgICAgICAgIHRoaXMucGFpcnMgKz0gMTtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIucGFpcnNcIikudGV4dENvbnRlbnQgPSB0aGlzLnBhaXJzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhaXJzID09PSB0aGlzLnNpemUgLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmRHYW1lKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJlbXB0eVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcImVtcHR5XCIpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMiA9IG51bGw7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDQwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjEuc3JjID0gXCIvaW1hZ2UvbWVtb3J5LzAucG5nXCI7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMi5zcmMgPSBcIi9pbWFnZS9tZW1vcnkvMC5wbmdcIjtcblxuICAgICAgICAgICAgICAgIHRoaXMudHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIgPSBudWxsO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1MDApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBFbmRzIHRoZSBnYW1lIGFuZCBkaXNwbGF5cyBtZXNzYWdlLlxuICovXG5NZW1vcnkucHJvdG90eXBlLmVuZEdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbWVzc2FnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZVwiKTtcblxuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIllvdSBmaW5pc2hlZCB0aGUgZ2FtZSFcIjtcbn07XG5cbi8qKlxuICogUmVzdGFydHMgdGhlIE1lbW9yeSBnYW1lLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIC0gVGhlIGNvbnRhaW5lciB0byByZW1vdmUgZWxlbWVudHMgZnJvbS5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5yZXN0YXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgdGhpcy5wYWlycyA9IDA7XG4gICAgdGhpcy5uck9mQ2xpY2tzID0gMDtcbiAgICB0aGlzLnN0YXJ0KCk7XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge01lbW9yeX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnk7XG4iLCIvKipcbiAqIFN0YXJ0IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuY29uc3QgZGVza3RvcCA9IHJlcXVpcmUoXCIuL2Rlc2t0b3BcIik7XG5cbmRlc2t0b3AuaW5pdCgpO1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIGRlc2t0b3AuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERlc2t0b3BXaW5kb3cgPSByZXF1aXJlKFwiLi9EZXNrdG9wV2luZG93XCIpO1xuY29uc3QgQ2hhdCA9IHJlcXVpcmUoXCIuL0NoYXRcIik7XG5jb25zdCBNZW1vcnkgPSByZXF1aXJlKFwiLi9NZW1vcnlcIik7XG5cbi8qKlxuICogR2V0cyB0aGUgY3VycmVudCB0aW1lIGFuZCBwcmVzZW50cyBpdCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIC0gVGhlIGNvbnRhaW5lciBvZiB0aGUgY2xvY2suXG4gKi9cbmZ1bmN0aW9uIGRlc2t0b3BDbG9jayhjb250YWluZXIpIHtcbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Nsb2NrXCIpO1xuICAgIH1cblxuICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IGhvdXJzID0gdG9kYXkuZ2V0SG91cnMoKTtcbiAgICBsZXQgbWlucyA9IHRvZGF5LmdldE1pbnV0ZXMoKTtcblxuICAgIGlmIChtaW5zIDwgMTApIHtcbiAgICAgICAgbWlucyA9IFwiMFwiICsgbWlucztcbiAgICB9XG5cbiAgICBjb250YWluZXIudGV4dENvbnRlbnQgPSBob3VycyArIFwiOlwiICsgbWlucztcbn1cblxuLyoqXG4gKiBHZXRzIHRvZGF5J3MgZGF0ZSBhbmQgcHJlc2VudHMgaXQgaW4gdGhlIGdpdmVuIGNvbnRhaW5lci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciAtIFRoZSBjb250YWluZXIgb2YgdGhlIGNsb2NrLlxuICovXG5mdW5jdGlvbiBnZXREYXRlKGNvbnRhaW5lcikge1xuICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IG1vbnRoID0gW1wiamFuXCIsIFwiZmViXCIsIFwibWFyXCIsIFwiYXByXCIsIFwibWF5XCIsIFwianVuZVwiLCBcImp1bHlcIiwgXCJhdWdcIiwgXCJzZXB0XCIsIFwib2N0XCIsIFwibm92XCIsIFwiZGVjXCJdO1xuICAgIGNvbnRhaW5lci50ZXh0Q29udGVudCA9IHRvZGF5LmdldERhdGUoKSArIFwiIFwiICsgbW9udGhbdG9kYXkuZ2V0TW9udGgoKV0gKyBcIiBcIiArIHRvZGF5LmdldEZ1bGxZZWFyKCk7XG59XG5cbi8qKlxuICogR2V0cyBhcHBsaWNhdGlvbiBpbmZvcm1hdGlvbiBmb3IgaW5mbyB3aW5kb3cuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBUaGUgZWxlbWVudCB0byBkaXNwbGF5IHRoZSBpbmZvcm1hdGlvbiBpbi5cbiAqL1xuZnVuY3Rpb24gaW5mbyhlbGVtZW50KSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNpbmZvXCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnQuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLCB0cnVlKSk7XG59XG5cbi8qKlxuICogSW5pdGlhdGVzIGRlc2t0b3AgYnkgYWRkaW5nIG5lY2Vzc2FyeSBldmVudCBsaXN0ZW5lcnMuXG4gKi9cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgbGV0IG5ld1dpbmRvdztcbiAgICBsZXQgY05yID0gMTtcbiAgICBsZXQgbU5yID0gMTtcbiAgICBsZXQgaU5yID0gMTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwibmF2IGFcIikuZm9yRWFjaChmdW5jdGlvbihjdXJyZW50LCBpbmRleCkge1xuICAgICAgICBzd2l0Y2ggKGluZGV4KXtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgQ2hhdChcImNcIiArIGNOcik7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5uYW1lLnRleHRDb250ZW50ID0gXCJDaGF0XCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL2NoYXQucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIGNOciArPSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IE1lbW9yeShcIm1cIiArIG1Ocik7XG4gICAgICAgICAgICAgICAgICAgIG1OciArPSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IERlc2t0b3BXaW5kb3coXCJpXCIgKyBpTnIpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cubmFtZS50ZXh0Q29udGVudCA9IFwiQXBwbGljYXRpb24gaW5mb1wiO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cuaWNvbi5zcmMgPSBcIi9pbWFnZS9pbmZvLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICBpbmZvKG5ld1dpbmRvdyk7XG4gICAgICAgICAgICAgICAgICAgIGlOciArPSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGdldERhdGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkYXRlXCIpKTtcbiAgICBkZXNrdG9wQ2xvY2soZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjbG9ja1wiKSk7XG4gICAgc2V0SW50ZXJ2YWwoZGVza3RvcENsb2NrLCA1MDAwKTtcbn1cblxuLyoqXG4gKiBFeHBvcnRzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBpbml0LFxuICAgIGdldENsb2NrOiBkZXNrdG9wQ2xvY2ssXG4gICAgZ2V0RGF0ZTogZ2V0RGF0ZSxcbiAgICBnZXRJbmZvOiBpbmZvXG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIGhhbmRsaW5nIGxvY2FsIHN0b3JhZ2UuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEdldHMgYW4gaXRlbSBmcm9tIGxvY2FsIHN0b3JhZ2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgaXRlbSB0byBnZXQuXG4gKiBAcmV0dXJucyB1c2VyIC0gVGhlIHNldCB1c2VybmFtZS5cbiAqL1xuZnVuY3Rpb24gZ2V0KG5hbWUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSk7XG59XG5cbi8qKlxuICogU2V0cyBhbiBpdGVtIGluIGxvY2FsIHN0b3JhZ2UuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHVzZXJuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHVzZXIuXG4gKi9cbmZ1bmN0aW9uIHNldCh1c2VybmFtZSkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlcm5hbWVcIiwgdXNlcm5hbWUpO1xufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0OiBzZXQsXG4gICAgZ2V0OiBnZXRcbn07XG4iXX0=
