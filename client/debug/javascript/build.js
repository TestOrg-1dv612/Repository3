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
            return document.getElementById(this.id).querySelectorAll(".dropdown a")[0];
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

    let links = document.getElementById(this.id).querySelectorAll(".menulink")[1].querySelectorAll(".dropdown a");
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
    let element = document.getElementById(this.id).querySelector(".menulink");
    let menuClone = element.cloneNode(true);
    element.parentNode.appendChild(menuClone);

    let newLink = document.getElementById(this.id).querySelectorAll(".menulink")[1];
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

        let img = (event.target.nodeName === "IMG") ? event.target : event.target.firstElementChild;
        let index = parseInt(img.getAttribute("data-brickNr"));
        this.turnBrick(this.images[index], index, img);
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
 * Restarts and clears the Memory game.
 */
Memory.prototype.restart = function() {
    let container = document.getElementById(this.id).querySelector(".content");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2Rlc2t0b3AuanMiLCJjbGllbnQvc291cmNlL2pzL2xvY2Fsc3RvcmFnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogTW9kdWxlIGZvciBDaGF0LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5jb25zdCBzdG9yYWdlID0gcmVxdWlyZShcIi4vbG9jYWxzdG9yYWdlXCIpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYSBDaGF0LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKi9cbmZ1bmN0aW9uIENoYXQoaWQsIHVzZXIpIHtcbiAgICBEZXNrdG9wV2luZG93LmNhbGwodGhpcywgaWQpO1xuXG4gICAgdGhpcy51c2VyID0gdXNlciB8fCBcIlVua25vd25cIjtcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiKTtcbiAgICB0aGlzLm9wZW4oKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xuQ2hhdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERlc2t0b3BXaW5kb3cucHJvdG90eXBlKTtcbkNoYXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2hhdDtcblxuLyoqXG4gKiBJbml0aWF0ZXMgdGhlIGFwcGxpY2F0aW9uLlxuICovXG5DaGF0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGF0XCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLCB0cnVlKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICBsZXQgbWVzc2FnZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5jaGF0TWVzc2FnZVwiKTtcbiAgICBsZXQgdXNlckluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLnVzZXJcIik7XG4gICAgdGhpcy5nZXRVc2VyKHVzZXJJbmZvKTtcblxuICAgIG1lc3NhZ2VJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzIHx8IGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudXNlciAhPT0gXCJVbmtub3duXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQobWVzc2FnZUlucHV0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlSW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1c2VySW5mby5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuYWRkKFwicmVkYmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgIGlmIChkYXRhLnR5cGUgPT09IFwibWVzc2FnZVwiIHx8IGRhdGEudHlwZSA9PT0gXCJub3RpZmljYXRpb25cIikge1xuICAgICAgICAgICAgdGhpcy5yZWNlaXZlKGRhdGEpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgdXNlciBmb3IgdGhlIGNoYXQgYXBwbGljYXRpb24uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBkaXYgLSBUaGUgZGl2IGhvbGRpbmcgdGhlIHVzZXIgaW5mb3JtYXRpb24uXG4gKi9cbkNoYXQucHJvdG90eXBlLmdldFVzZXIgPSBmdW5jdGlvbihkaXYpIHtcbiAgICBsZXQgaW5wdXQgPSBkaXYuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgbGV0IGJ1dHRvbiA9IGRpdi5sYXN0RWxlbWVudENoaWxkO1xuICAgIGxldCByZW1vdmVVc2VyRWxlbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBkaXYucmVtb3ZlQ2hpbGQoaW5wdXQpO1xuICAgICAgICBkaXYucmVtb3ZlQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJsb2dnZWRJblwiKTtcbiAgICAgICAgZGl2LnRleHRDb250ZW50ID0gXCJMb2dnZWQgaW4gYXMgXCIgKyB0aGlzLnVzZXI7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgbGV0IGdldFVzZXJuYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChkaXYuZmlyc3RFbGVtZW50Q2hpbGQudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IGRpdi5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcbiAgICAgICAgICAgIGlucHV0LmNsYXNzTGlzdC5yZW1vdmUoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIGlucHV0LnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgIHJlbW92ZVVzZXJFbGVtKCk7XG4gICAgICAgICAgICBzdG9yYWdlLnNldCh0aGlzLnVzZXIpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgaWYgKCFzdG9yYWdlLmdldChcInVzZXJuYW1lXCIpKSB7XG4gICAgICAgIGRpdi5sYXN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnZXRVc2VybmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51c2VyID0gc3RvcmFnZS5nZXQoXCJ1c2VybmFtZVwiKTtcbiAgICAgICAgcmVtb3ZlVXNlckVsZW0oKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyb3Bkb3duLnRleHRDb250ZW50ID0gXCJDaGFuZ2UgdXNlclwiO1xuICAgIHRoaXMuZHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IFwiVXNlcjogXCI7XG4gICAgICAgIGRpdi5jbGFzc0xpc3QucmVtb3ZlKFwibG9nZ2VkSW5cIik7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB0aGlzLnVzZXIgPSBcIlVua25vd25cIjtcbiAgICAgICAgZGl2Lmxhc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldFVzZXJuYW1lKTtcbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBTZW5kcyB0eXBlZCBpbiBtZXNzYWdlcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgLSBUaGUgaW5wdXQgbWVzc2FnZSBmcm9tIHRoZSB0ZXh0YXJlYS5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICBkYXRhOiBpbnB1dCxcbiAgICAgICAgdXNlcm5hbWU6IHRoaXMudXNlcixcbiAgICAgICAga2V5OiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG59O1xuXG4vKipcbiAqIFJlY2VpdmVzIGFuZCBkaXNwbGF5cyBtZXNzYWdlcyBpbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIFRoZSByZWNlaXZlZCBkYXRhLlxuICovXG5DaGF0LnByb3RvdHlwZS5yZWNlaXZlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VDb250YWluZXJcIik7XG5cbiAgICBsZXQgdXNlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIHVzZXIuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJ1c2VybmFtZVwiKTtcbiAgICB1c2VyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEudXNlcm5hbWUpKTtcbiAgICBsZXQgcEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBwRWxlbS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhLmRhdGEpKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh1c2VyKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocEVsZW0pO1xuXG4gICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtDaGF0fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEZXNrdG9wV2luZG93LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cgdG8gY3JlYXRlLlxuICogQHRocm93cyB7RXJyb3J9IC0gV2luZG93IG11c3QgaGF2ZSBhbiBpZC5cbiAqL1xuZnVuY3Rpb24gRGVza3RvcFdpbmRvdyhpZCkge1xuICAgIGlmICghaWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2luZG93IG11c3QgaGF2ZSBhbiBpZC5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgdG9wLW5hbWUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjbmFtZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIm5hbWVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIubmFtZVwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgdG9wLW5hbWUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjaWNvblxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImljb25cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIubG9nb1wiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgZHJvcGRvd24gbGluayBpbiBtZW51LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2Ryb3Bkb3duXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZHJvcGRvd25cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKVswXTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgaWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNpZFxuICAgICAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gLSBNdXN0IGJlIGEgc3RyaW5nLlxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImlkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiV2luZG93IGlkIG11c3QgYmUgYSBzdHJpbmcuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuY3JlYXRlKCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB3aW5kb3cgZnJvbSB0ZW1wbGF0ZS5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dcIik7XG4gICAgbGV0IHdpbmRvd0RpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZXNrdG9wXCIpLmFwcGVuZENoaWxkKHdpbmRvd0Rpdik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN1bmNsYWltZWRcIikuaWQgPSB0aGlzLmlkO1xuXG4gICAgbGV0IGlkID0gdGhpcy5pZC50b1N0cmluZygpO1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKTtcblxuICAgIHRoaXMucG9zaXRpb24oaWQsIGRpdik7XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChkaXYpO1xuXG4gICAgZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGRpdiAhPT0gZGl2LnBhcmVudE5vZGUubGFzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICAgICAgZGl2LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCJ0ZXh0YXJlYVwiKSB8fFxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0ID09PSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIikpIHtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICAgICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8qKlxuICogUG9zaXRpb25zIHRoZSB3aW5kb3cgaW4gdGhlIGRlc2t0b3AsIHN0YWNrcyBpZiBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpdiAtIFRoZSB3aW5kb3cgZWxlbWVudC5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUucG9zaXRpb24gPSBmdW5jdGlvbihpZCwgZGl2KSB7XG4gICAgbGV0IHN0YWNrV2luZG93cyA9IGZ1bmN0aW9uKGFwcCkge1xuICAgICAgICBpZiAoaWQuaW5kZXhPZihcIjFcIikgPT09IC0xKSB7XG4gICAgICAgICAgICBsZXQgaWROciA9IGlkLmNoYXJBdCgxKSAtIDE7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXBwICsgaWROcikpIHtcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudEJlZm9yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFwcCArIGlkTnIpO1xuICAgICAgICAgICAgICAgIGRpdi5zdHlsZS50b3AgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRUb3AgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRMZWZ0ICsgMzUpICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGlmIChpZC5pbmRleE9mKFwiY1wiKSAhPT0gLTEpIHtcbiAgICAgICAgc3RhY2tXaW5kb3dzKFwiY1wiKTtcbiAgICB9IGVsc2UgaWYgKGlkLmluZGV4T2YoXCJtXCIpICE9PSAtMSkge1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChkaXYub2Zmc2V0TGVmdCArIDI1MCkgKyBcInB4XCI7XG4gICAgICAgIHN0YWNrV2luZG93cyhcIm1cIik7XG4gICAgfSBlbHNlIGlmIChpZC5pbmRleE9mKFwiaVwiKSAhPT0gLTEpIHtcbiAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSAoZGl2Lm9mZnNldExlZnQgKyA1MDApICsgXCJweFwiO1xuICAgICAgICBzdGFja1dpbmRvd3MoXCJpXCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBkcmFnZ2luZyBtb3ZlbWVudHMgb2YgdGhlIHdpbmRvdy5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpdiAtIFRoZSBkaXYgY29udGFpbmluZyB0aGUgd2luZG93LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5oYW5kbGVNb3ZlbWVudCA9IGZ1bmN0aW9uKGRpdikge1xuICAgIGxldCBwb3NYID0gMDtcbiAgICBsZXQgcG9zWSA9IDA7XG5cbiAgICBsZXQgbW92ZVdpbmRvdyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGRpdi5zdHlsZS50b3AgPSAoZXZlbnQuY2xpZW50WSAtIHBvc1kpICsgXCJweFwiO1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChldmVudC5jbGllbnRYIC0gcG9zWCkgKyBcInB4XCI7XG4gICAgfTtcblxuICAgIGxldCBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VcIikpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoZGl2KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgIHBvc1ggPSBldmVudC5jbGllbnRYIC0gZGl2Lm9mZnNldExlZnQ7XG4gICAgICAgIHBvc1kgPSBldmVudC5jbGllbnRZIC0gZGl2Lm9mZnNldFRvcDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgZGl2LmZpcnN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZ2V0UG9zaXRpb24pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlV2luZG93KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgd2luZG93IHRvIGNsb3NlLlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG5cbiAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge0Rlc2t0b3BXaW5kb3d9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gRGVza3RvcFdpbmRvdztcbiIsIi8qKlxuICogTW9kdWxlIGZvciBNZW1vcnkuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgTWVtb3J5IGdhbWUuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gTWVtb3J5KGlkKSB7XG4gICAgRGVza3RvcFdpbmRvdy5jYWxsKHRoaXMsIGlkKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzaXplIG9mIHRoZSBib2FyZC5cbiAgICAgKi9cbiAgICB0aGlzLnNpemUgPSAxNjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBhcnJheSB0byBjb250YWluIHRoZSBicmljayBpbWFnZXMuXG4gICAgICovXG4gICAgdGhpcy5pbWFnZXMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBmaXJzdCB0dXJuZWQgYnJpY2suXG4gICAgICovXG4gICAgdGhpcy50dXJuMSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2Vjb25kIHR1cm5lZCBicmljay5cbiAgICAgKi9cbiAgICB0aGlzLnR1cm4yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgcGFpcnMuXG4gICAgICovXG4gICAgdGhpcy5wYWlycyA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIGNsaWNrcy5cbiAgICAgKi9cbiAgICB0aGlzLm5yT2ZDbGlja3MgPSAwO1xuXG4gICAgdGhpcy5zdGFydCgpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5NZW1vcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNrdG9wV2luZG93LnByb3RvdHlwZSk7XG5NZW1vcnkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVtb3J5O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgZ2FtZSBhbmQgYWRkcyBldmVudCBsaXN0ZW5lcnMuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNodWZmbGUoKTtcbiAgICB0aGlzLnNldFNpemUoKTtcbiAgICB0aGlzLnNldE1lbnUoKTtcblxuICAgIHRoaXMuZHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMucmVzdGFydCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICBsZXQgbGlua3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzFdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKTtcbiAgICBsaW5rcy5mb3JFYWNoKGZ1bmN0aW9uKGN1cnJlbnQpIHtcbiAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LnRhcmdldC50ZXh0Q29udGVudCkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCIzeDJcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gNjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIjR4M1wiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSAxMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIjR4NFwiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSAxNjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucmVzdGFydCgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG4vKipcbiAqIFNldHMgZWxlbWVudHMgZm9yIHRoZSBkcm9wLWRvd24gbWVudSB0byBhbGxvdyBjaGFuZ2luZyBzaXplIG9mIHRoZSBib2FyZC5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zZXRNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLm1lbnVsaW5rXCIpO1xuICAgIGxldCBtZW51Q2xvbmUgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQobWVudUNsb25lKTtcblxuICAgIGxldCBuZXdMaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXTtcbiAgICBuZXdMaW5rLmZpcnN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gXCJTaXplXCI7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI7IGkgKz0gMSkge1xuICAgICAgICBsZXQgZHJvcGRvd25DbG9uZSA9IG5ld0xpbmsucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93biBhXCIpLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgbmV3TGluay5sYXN0RWxlbWVudENoaWxkLmFwcGVuZENoaWxkKGRyb3Bkb3duQ2xvbmUpO1xuICAgIH1cblxuICAgIGxldCBkcm9wZG93bkxpbmtzID0gbmV3TGluay5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIik7XG4gICAgZHJvcGRvd25MaW5rc1swXS50ZXh0Q29udGVudCA9IFwiM3gyXCI7XG4gICAgZHJvcGRvd25MaW5rc1sxXS50ZXh0Q29udGVudCA9IFwiNHgzXCI7XG4gICAgZHJvcGRvd25MaW5rc1syXS50ZXh0Q29udGVudCA9IFwiNHg0XCI7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHNpemUgb2YgdGhlIGJvYXJkLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGVEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeVwiKS5jb250ZW50O1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLCBmYWxzZSk7XG4gICAgbGV0IHJlc3VsdEVsZW0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2Lmxhc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgc3dpdGNoICh0aGlzLnNpemUpIHtcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDZcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiYm9hcmQxMlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDE2XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbGV0IGE7XG4gICAgdGhpcy5pbWFnZXMuZm9yRWFjaChmdW5jdGlvbihpbWFnZSwgaW5kZXgpIHtcbiAgICAgICAgYSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgICAgICBhLmZpcnN0RWxlbWVudENoaWxkLnNldEF0dHJpYnV0ZShcImRhdGEtYnJpY2tOclwiLCBpbmRleCk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgIH0pO1xuXG4gICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGxldCBpbWcgPSAoZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSBcIklNR1wiKSA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgbGV0IGluZGV4ID0gcGFyc2VJbnQoaW1nLmdldEF0dHJpYnV0ZShcImRhdGEtYnJpY2tOclwiKSk7XG4gICAgICAgIHRoaXMudHVybkJyaWNrKHRoaXMuaW1hZ2VzW2luZGV4XSwgaW5kZXgsIGltZyk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChyZXN1bHRFbGVtKTtcbn07XG5cbi8qKlxuICogU2h1ZmZsZXMgdGhlIGFycmF5IHdpdGggaW1hZ2VzLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnNodWZmbGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmltYWdlcyA9IFsxLDEsMiwyLDMsMyw0LDQsNSw1LDYsNiw3LDcsOCw4XTtcblxuICAgIGxldCBpbmRleFRvU3dhcDtcbiAgICBsZXQgdGVtcEltZztcbiAgICBsZXQgaW1ncztcblxuICAgIHN3aXRjaCAodGhpcy5zaXplKSB7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcy5zbGljZSgwLCA2KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgaW1ncyA9IHRoaXMuaW1hZ2VzLnNsaWNlKDAsIDEyKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgaW1ncyA9IHRoaXMuaW1hZ2VzO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSB0aGlzLnNpemUgLSAxOyBpID4gMDsgaSAtPSAxKSB7XG4gICAgICAgIGluZGV4VG9Td2FwID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSk7XG4gICAgICAgIHRlbXBJbWcgPSBpbWdzW2ldO1xuICAgICAgICBpbWdzW2ldID0gaW1nc1tpbmRleFRvU3dhcF07XG4gICAgICAgIGltZ3NbaW5kZXhUb1N3YXBdID0gdGVtcEltZztcbiAgICB9XG5cbiAgICB0aGlzLmltYWdlcyA9IGltZ3M7XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgdGhlIGV2ZW50IG9mIHR1cm5pbmcgYSBicmljay5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYnJpY2tJbWcgLSBUaGUgaW1hZ2Ugb2YgdGhlIHR1cm5lZCBicmljay5cbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgdHVybmVkIGJyaWNrLlxuICogQHBhcmFtIHtFbGVtZW50fSBpbWcgLSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBicmljay5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS50dXJuQnJpY2sgPSBmdW5jdGlvbihicmlja0ltZywgaW5kZXgsIGltZykge1xuICAgIGlmICh0aGlzLnR1cm4yKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpbWcuc3JjID0gXCIvaW1hZ2UvbWVtb3J5L1wiICsgYnJpY2tJbWcgKyBcIi5wbmdcIjtcblxuICAgIGlmICghdGhpcy50dXJuMSkge1xuICAgICAgICB0aGlzLnR1cm4xID0gaW1nO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpbWcgPT09IHRoaXMudHVybjEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubnJPZkNsaWNrcyArPSAxO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLnRyaWVzXCIpLnRleHRDb250ZW50ID0gdGhpcy5uck9mQ2xpY2tzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgdGhpcy50dXJuMiA9IGltZztcbiAgICAgICAgaWYgKHRoaXMudHVybjEuc3JjID09PSB0aGlzLnR1cm4yLnNyYykge1xuICAgICAgICAgICAgdGhpcy5wYWlycyArPSAxO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5wYWlyc1wiKS50ZXh0Q29udGVudCA9IHRoaXMucGFpcnMudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucGFpcnMgPT09IHRoaXMuc2l6ZSAvIDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZEdhbWUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4xLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcImVtcHR5XCIpO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwiZW1wdHlcIik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNDAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMS5zcmMgPSBcIi9pbWFnZS9tZW1vcnkvMC5wbmdcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yLnNyYyA9IFwiL2ltYWdlL21lbW9yeS8wLnBuZ1wiO1xuXG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMiA9IG51bGw7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDUwMCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEVuZHMgdGhlIGdhbWUgYW5kIGRpc3BsYXlzIG1lc3NhZ2UuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuZW5kR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlXCIpO1xuXG4gICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFwiWW91IGZpbmlzaGVkIHRoZSBnYW1lIVwiO1xufTtcblxuLyoqXG4gKiBSZXN0YXJ0cyBhbmQgY2xlYXJzIHRoZSBNZW1vcnkgZ2FtZS5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5yZXN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcbiAgICB3aGlsZSAoY29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICB0aGlzLnBhaXJzID0gMDtcbiAgICB0aGlzLm5yT2ZDbGlja3MgPSAwO1xuICAgIHRoaXMuc2h1ZmZsZSgpO1xuICAgIHRoaXMuc2V0U2l6ZSgpO1xufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtNZW1vcnl9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5O1xuIiwiLyoqXG4gKiBTdGFydCBvZiB0aGUgYXBwbGljYXRpb24uXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cbmNvbnN0IGRlc2t0b3AgPSByZXF1aXJlKFwiLi9kZXNrdG9wXCIpO1xuXG5kZXNrdG9wLmluaXQoKTtcbiIsIi8qKlxuICogTW9kdWxlIGZvciBkZXNrdG9wLlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcbmNvbnN0IENoYXQgPSByZXF1aXJlKFwiLi9DaGF0XCIpO1xuY29uc3QgTWVtb3J5ID0gcmVxdWlyZShcIi4vTWVtb3J5XCIpO1xuXG4vKipcbiAqIEdldHMgdGhlIGN1cnJlbnQgdGltZSBhbmQgcHJlc2VudHMgaXQgaW4gdGhlIGdpdmVuIGNvbnRhaW5lci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciAtIFRoZSBjb250YWluZXIgb2YgdGhlIGNsb2NrLlxuICovXG5mdW5jdGlvbiBkZXNrdG9wQ2xvY2soY29udGFpbmVyKSB7XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjbG9ja1wiKTtcbiAgICB9XG5cbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBob3VycyA9IHRvZGF5LmdldEhvdXJzKCk7XG4gICAgbGV0IG1pbnMgPSB0b2RheS5nZXRNaW51dGVzKCk7XG5cbiAgICBpZiAobWlucyA8IDEwKSB7XG4gICAgICAgIG1pbnMgPSBcIjBcIiArIG1pbnM7XG4gICAgfVxuXG4gICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gaG91cnMgKyBcIjpcIiArIG1pbnM7XG59XG5cbi8qKlxuICogR2V0cyB0b2RheSdzIGRhdGUgYW5kIHByZXNlbnRzIGl0IGluIHRoZSBnaXZlbiBjb250YWluZXIuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIgLSBUaGUgY29udGFpbmVyIG9mIHRoZSBjbG9jay5cbiAqL1xuZnVuY3Rpb24gZ2V0RGF0ZShjb250YWluZXIpIHtcbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBtb250aCA9IFtcImphblwiLCBcImZlYlwiLCBcIm1hclwiLCBcImFwclwiLCBcIm1heVwiLCBcImp1bmVcIiwgXCJqdWx5XCIsIFwiYXVnXCIsIFwic2VwdFwiLCBcIm9jdFwiLCBcIm5vdlwiLCBcImRlY1wiXTtcbiAgICBjb250YWluZXIudGV4dENvbnRlbnQgPSB0b2RheS5nZXREYXRlKCkgKyBcIiBcIiArIG1vbnRoW3RvZGF5LmdldE1vbnRoKCldICsgXCIgXCIgKyB0b2RheS5nZXRGdWxsWWVhcigpO1xufVxuXG4vKipcbiAqIEdldHMgYXBwbGljYXRpb24gaW5mb3JtYXRpb24gZm9yIGluZm8gd2luZG93LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgdG8gZGlzcGxheSB0aGUgaW5mb3JtYXRpb24gaW4uXG4gKi9cbmZ1bmN0aW9uIGluZm8oZWxlbWVudCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5mb1wiKS5jb250ZW50O1xuICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50LmlkKS5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZSwgdHJ1ZSkpO1xufVxuXG4vKipcbiAqIEluaXRpYXRlcyBkZXNrdG9wIGJ5IGFkZGluZyBuZWNlc3NhcnkgZXZlbnQgbGlzdGVuZXJzLlxuICovXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIGxldCBuZXdXaW5kb3c7XG4gICAgbGV0IGNOciA9IDE7XG4gICAgbGV0IG1OciA9IDE7XG4gICAgbGV0IGlOciA9IDE7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIm5hdiBhXCIpLmZvckVhY2goZnVuY3Rpb24oY3VycmVudCwgaW5kZXgpIHtcbiAgICAgICAgc3dpdGNoIChpbmRleCl7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IENoYXQoXCJjXCIgKyBjTnIpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cubmFtZS50ZXh0Q29udGVudCA9IFwiQ2hhdFwiO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cuaWNvbi5zcmMgPSBcIi9pbWFnZS9jaGF0LnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICBjTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBNZW1vcnkoXCJtXCIgKyBtTnIpO1xuICAgICAgICAgICAgICAgICAgICBtTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBEZXNrdG9wV2luZG93KFwiaVwiICsgaU5yKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lm5hbWUudGV4dENvbnRlbnQgPSBcIkFwcGxpY2F0aW9uIGluZm9cIjtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lmljb24uc3JjID0gXCIvaW1hZ2UvaW5mby5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgaW5mbyhuZXdXaW5kb3cpO1xuICAgICAgICAgICAgICAgICAgICBpTnIgKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBnZXREYXRlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGF0ZVwiKSk7XG4gICAgZGVza3RvcENsb2NrKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2xvY2tcIikpO1xuICAgIHNldEludGVydmFsKGRlc2t0b3BDbG9jaywgNTAwMCk7XG59XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogaW5pdCxcbiAgICBnZXRDbG9jazogZGVza3RvcENsb2NrLFxuICAgIGdldERhdGU6IGdldERhdGUsXG4gICAgZ2V0SW5mbzogaW5mb1xufTtcbiIsIi8qKlxuICogTW9kdWxlIGZvciBoYW5kbGluZyBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBHZXRzIGFuIGl0ZW0gZnJvbSBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGl0ZW0gdG8gZ2V0LlxuICogQHJldHVybnMgdXNlciAtIFRoZSBzZXQgdXNlcm5hbWUuXG4gKi9cbmZ1bmN0aW9uIGdldChuYW1lKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKG5hbWUpO1xufVxuXG4vKipcbiAqIFNldHMgYW4gaXRlbSBpbiBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB1c2VybmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB1c2VyLlxuICovXG5mdW5jdGlvbiBzZXQodXNlcm5hbWUpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXJuYW1lXCIsIHVzZXJuYW1lKTtcbn1cblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNldDogc2V0LFxuICAgIGdldDogZ2V0XG59O1xuIl19
