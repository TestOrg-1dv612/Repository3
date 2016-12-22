(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
};

/**
 * Exports.
 *
 * @type {Chat}
 */
module.exports = Chat;

},{"./DesktopWindow":2}],2:[function(require,module,exports){
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

    div.addEventListener("click", function(event) {
        if (div !== div.parentNode.lastElementChild) {
            div.parentNode.appendChild(div);
        }

        if (event.target === div.querySelector(".close")) {
            event.preventDefault();
            this.close(div);
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
        div.parentNode.appendChild(div);
        posX = event.clientX - div.offsetLeft;
        posY = event.clientY - div.offsetTop;
        window.addEventListener("mousemove", moveWindow);
    };

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

},{"./Chat":1,"./DesktopWindow":2,"./Memory":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2Rlc2t0b3AuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogTW9kdWxlIGZvciBDaGF0LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIENoYXQuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gQ2hhdChpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgIHRoaXMub3BlbigpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5DaGF0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGVza3RvcFdpbmRvdy5wcm90b3R5cGUpO1xuQ2hhdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGF0O1xuXG4vKipcbiAqXG4gKi9cbkNoYXQucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXRcIikuY29udGVudDtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUsIHRydWUpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChjb250ZW50KTtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7Q2hhdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIERlc2t0b3BXaW5kb3cuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgd2luZG93IHRvIGNyZWF0ZS5cbiAqIEB0aHJvd3Mge0Vycm9yfSAtIFdpbmRvdyBtdXN0IGhhdmUgYW4gaWQuXG4gKi9cbmZ1bmN0aW9uIERlc2t0b3BXaW5kb3coaWQpIHtcbiAgICBpZiAoIWlkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIldpbmRvdyBtdXN0IGhhdmUgYW4gaWQuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIHRvcC1uYW1lLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I25hbWVcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJuYW1lXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLm5hbWVcIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIHRvcC1uYW1lLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2ljb25cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpY29uXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLmxvZ29cIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIGlkLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjaWRcbiAgICAgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IC0gTXVzdCBiZSBhIHN0cmluZy5cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpZFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIldpbmRvdyBpZCBtdXN0IGJlIGEgc3RyaW5nLlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmNyZWF0ZSgpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgd2luZG93IGZyb20gdGVtcGxhdGUuXG4gKi9cbkRlc2t0b3BXaW5kb3cucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93XCIpO1xuICAgIGxldCB3aW5kb3dEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVza3RvcFwiKS5hcHBlbmRDaGlsZCh3aW5kb3dEaXYpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdW5jbGFpbWVkXCIpLmlkID0gdGhpcy5pZDtcblxuICAgIGxldCBpZCA9IHRoaXMuaWQudG9TdHJpbmcoKTtcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCk7XG5cbiAgICB0aGlzLnBvc2l0aW9uKGlkLCBkaXYpO1xuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQoZGl2KTtcblxuICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGRpdiAhPT0gZGl2LnBhcmVudE5vZGUubGFzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICAgICAgZGl2LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGRpdi5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlXCIpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5jbG9zZShkaXYpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8qKlxuICogUG9zaXRpb25zIHRoZSB3aW5kb3cgaW4gdGhlIGRlc2t0b3AsIHN0YWNrcyBpZiBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpdiAtIFRoZSB3aW5kb3cgZWxlbWVudC5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUucG9zaXRpb24gPSBmdW5jdGlvbihpZCwgZGl2KSB7XG4gICAgbGV0IHN0YWNrV2luZG93cyA9IGZ1bmN0aW9uKGFwcCkge1xuICAgICAgICBpZiAoaWQuaW5kZXhPZihcIjFcIikgPT09IC0xKSB7XG4gICAgICAgICAgICBsZXQgaWROciA9IGlkLmNoYXJBdCgxKSAtIDE7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXBwICsgaWROcikpIHtcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudEJlZm9yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFwcCArIGlkTnIpO1xuICAgICAgICAgICAgICAgIGRpdi5zdHlsZS50b3AgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRUb3AgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRMZWZ0ICsgMzUpICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGlmIChpZC5pbmRleE9mKFwiY1wiKSAhPT0gLTEpIHtcbiAgICAgICAgc3RhY2tXaW5kb3dzKFwiY1wiKTtcbiAgICB9IGVsc2UgaWYgKGlkLmluZGV4T2YoXCJtXCIpICE9PSAtMSkge1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChkaXYub2Zmc2V0TGVmdCArIDI1MCkgKyBcInB4XCI7XG4gICAgICAgIHN0YWNrV2luZG93cyhcIm1cIik7XG4gICAgfSBlbHNlIGlmIChpZC5pbmRleE9mKFwiaVwiKSAhPT0gLTEpIHtcbiAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSAoZGl2Lm9mZnNldExlZnQgKyA1MDApICsgXCJweFwiO1xuICAgICAgICBzdGFja1dpbmRvd3MoXCJpXCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBkcmFnZ2luZyBtb3ZlbWVudHMgb2YgdGhlIHdpbmRvdy5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpdiAtIFRoZSBkaXYgY29udGFpbmluZyB0aGUgd2luZG93LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5oYW5kbGVNb3ZlbWVudCA9IGZ1bmN0aW9uKGRpdikge1xuICAgIGxldCBwb3NYID0gMDtcbiAgICBsZXQgcG9zWSA9IDA7XG5cbiAgICBsZXQgbW92ZVdpbmRvdyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGRpdi5zdHlsZS50b3AgPSAoZXZlbnQuY2xpZW50WSAtIHBvc1kpICsgXCJweFwiO1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChldmVudC5jbGllbnRYIC0gcG9zWCkgKyBcInB4XCI7XG4gICAgfTtcblxuICAgIGxldCBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgIHBvc1ggPSBldmVudC5jbGllbnRYIC0gZGl2Lm9mZnNldExlZnQ7XG4gICAgICAgIHBvc1kgPSBldmVudC5jbGllbnRZIC0gZGl2Lm9mZnNldFRvcDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgfTtcblxuICAgIGRpdi5maXJzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGdldFBvc2l0aW9uKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIENsb3NlcyB0aGUgd2luZG93LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHdpbmRvdyB0byBjbG9zZS5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IERlc2t0b3BXaW5kb3c7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgTWVtb3J5LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIE1lbW9yeSBnYW1lLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKi9cbmZ1bmN0aW9uIE1lbW9yeShpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2l6ZSBvZiB0aGUgYm9hcmQuXG4gICAgICovXG4gICAgdGhpcy5zaXplID0gMTY7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXJyYXkgdG8gY29udGFpbiB0aGUgYnJpY2sgaW1hZ2VzLlxuICAgICAqL1xuICAgIHRoaXMuaW1hZ2VzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZmlyc3QgdHVybmVkIGJyaWNrLlxuICAgICAqL1xuICAgIHRoaXMudHVybjEgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNlY29uZCB0dXJuZWQgYnJpY2suXG4gICAgICovXG4gICAgdGhpcy50dXJuMiA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIHBhaXJzLlxuICAgICAqL1xuICAgIHRoaXMucGFpcnMgPSAwO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBjbGlja3MuXG4gICAgICovXG4gICAgdGhpcy5uck9mQ2xpY2tzID0gMDtcblxuICAgIHRoaXMuc3RhcnQoKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xuTWVtb3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGVza3RvcFdpbmRvdy5wcm90b3R5cGUpO1xuTWVtb3J5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbW9yeTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGdhbWUuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNodWZmbGUoKTtcbiAgICB0aGlzLnNldFNpemUoKTtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgc2l6ZSBvZiB0aGUgYm9hcmQuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc2V0U2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wbGF0ZURpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5XCIpLmNvbnRlbnQ7XG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQsIGZhbHNlKTtcbiAgICBsZXQgcmVzdWx0RWxlbSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYubGFzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKHRoaXMuc2l6ZSkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImJvYXJkNFwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImJvYXJkNlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDE2XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbGV0IGE7XG4gICAgbGV0IF90aGlzID0gdGhpcztcbiAgICB0aGlzLmltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlLCBpbmRleCkge1xuICAgICAgICBhID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuc2V0QXR0cmlidXRlKFwiZGF0YS1icmlja05yXCIsIGluZGV4KTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGEpO1xuXG4gICAgfSk7XG5cbiAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgbGV0IGltZyA9IChldmVudC50YXJnZXQubm9kZU5hbWUgPT09IFwiSU1HXCIpID8gZXZlbnQudGFyZ2V0IDogZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbWcuZ2V0QXR0cmlidXRlKFwiZGF0YS1icmlja05yXCIpKTtcbiAgICAgICAgX3RoaXMudHVybkJyaWNrKHRoaXMuaW1hZ2VzW2luZGV4XSwgaW5kZXgsIGltZyk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChyZXN1bHRFbGVtKTtcbn07XG5cbi8qKlxuICogU2h1ZmZsZXMgdGhlIGFycmF5IHdpdGggaW1hZ2VzLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnNodWZmbGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmltYWdlcyA9IFsxLDEsMiwyLDMsMyw0LDQsNSw1LDYsNiw3LDcsOCw4XTtcblxuICAgIGxldCBpbmRleFRvU3dhcDtcbiAgICBsZXQgdGVtcEltZztcbiAgICBsZXQgaW1ncztcblxuICAgIHN3aXRjaCAodGhpcy5zaXplKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcy5zbGljZSgwLCA0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBpbWdzID0gdGhpcy5pbWFnZXMuc2xpY2UoMCwgNik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcztcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gdGhpcy5zaXplIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICBpbmRleFRvU3dhcCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpO1xuICAgICAgICB0ZW1wSW1nID0gaW1nc1tpXTtcbiAgICAgICAgaW1nc1tpXSA9IGltZ3NbaW5kZXhUb1N3YXBdO1xuICAgICAgICBpbWdzW2luZGV4VG9Td2FwXSA9IHRlbXBJbWc7XG4gICAgfVxuXG4gICAgdGhpcy5pbWFnZXMgPSBpbWdzO1xufTtcblxuLyoqXG4gKiBIYW5kbGVzIHRoZSBldmVudCBvZiB0dXJuaW5nIGEgYnJpY2suXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGJyaWNrSW1nIC0gVGhlIGltYWdlIG9mIHRoZSB0dXJuZWQgYnJpY2suXG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHR1cm5lZCBicmljay5cbiAqIEBwYXJhbSB7RWxlbWVudH0gaW1nIC0gVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgYnJpY2suXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUudHVybkJyaWNrID0gZnVuY3Rpb24oYnJpY2tJbWcsIGluZGV4LCBpbWcpIHtcbiAgICBpZiAodGhpcy50dXJuMikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaW1nLnNyYyA9IFwiL2ltYWdlL21lbW9yeS9cIiArIGJyaWNrSW1nICsgXCIucG5nXCI7XG5cbiAgICBpZiAoIXRoaXMudHVybjEpIHtcbiAgICAgICAgdGhpcy50dXJuMSA9IGltZztcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaW1nID09PSB0aGlzLnR1cm4xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5yT2ZDbGlja3MgKz0gMTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi50cmllc1wiKS50ZXh0Q29udGVudCA9IHRoaXMubnJPZkNsaWNrcy50b1N0cmluZygpO1xuXG4gICAgICAgIHRoaXMudHVybjIgPSBpbWc7XG4gICAgICAgIGlmICh0aGlzLnR1cm4xLnNyYyA9PT0gdGhpcy50dXJuMi5zcmMpIHtcbiAgICAgICAgICAgIHRoaXMucGFpcnMgKz0gMTtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIucGFpcnNcIikudGV4dENvbnRlbnQgPSB0aGlzLnBhaXJzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhaXJzID09PSB0aGlzLnNpemUgLyAyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmRHYW1lKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJlbXB0eVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcImVtcHR5XCIpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMiA9IG51bGw7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDQwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjEuc3JjID0gXCIvaW1hZ2UvbWVtb3J5LzAucG5nXCI7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMi5zcmMgPSBcIi9pbWFnZS9tZW1vcnkvMC5wbmdcIjtcblxuICAgICAgICAgICAgICAgIHRoaXMudHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIgPSBudWxsO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1MDApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBFbmRzIHRoZSBnYW1lIGFuZCBkaXNwbGF5cyBtZXNzYWdlLlxuICovXG5NZW1vcnkucHJvdG90eXBlLmVuZEdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbWVzc2FnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZVwiKTtcblxuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIllvdSBmaW5pc2hlZCB0aGUgZ2FtZSFcIjtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7TWVtb3J5fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeTtcbiIsIi8qKlxuICogU3RhcnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5jb25zdCBkZXNrdG9wID0gcmVxdWlyZShcIi4vZGVza3RvcFwiKTtcblxuZGVza3RvcC5pbml0KCk7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgZGVza3RvcC5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5jb25zdCBDaGF0ID0gcmVxdWlyZShcIi4vQ2hhdFwiKTtcbmNvbnN0IE1lbW9yeSA9IHJlcXVpcmUoXCIuL01lbW9yeVwiKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBjdXJyZW50IHRpbWUgYW5kIHByZXNlbnRzIGl0IGluIHRoZSBnaXZlbiBjb250YWluZXIuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIgLSBUaGUgY29udGFpbmVyIG9mIHRoZSBjbG9jay5cbiAqL1xuZnVuY3Rpb24gZGVza3RvcENsb2NrKGNvbnRhaW5lcikge1xuICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2xvY2tcIik7XG4gICAgfVxuXG4gICAgbGV0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBsZXQgaG91cnMgPSB0b2RheS5nZXRIb3VycygpO1xuICAgIGxldCBtaW5zID0gdG9kYXkuZ2V0TWludXRlcygpO1xuXG4gICAgaWYgKG1pbnMgPCAxMCkge1xuICAgICAgICBtaW5zID0gXCIwXCIgKyBtaW5zO1xuICAgIH1cblxuICAgIGNvbnRhaW5lci50ZXh0Q29udGVudCA9IGhvdXJzICsgXCI6XCIgKyBtaW5zO1xufVxuXG4vKipcbiAqIEdldHMgdG9kYXkncyBkYXRlIGFuZCBwcmVzZW50cyBpdCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIC0gVGhlIGNvbnRhaW5lciBvZiB0aGUgY2xvY2suXG4gKi9cbmZ1bmN0aW9uIGdldERhdGUoY29udGFpbmVyKSB7XG4gICAgbGV0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBsZXQgbW9udGggPSBbXCJqYW5cIiwgXCJmZWJcIiwgXCJtYXJcIiwgXCJhcHJcIiwgXCJtYXlcIiwgXCJqdW5lXCIsIFwianVseVwiLCBcImF1Z1wiLCBcInNlcHRcIiwgXCJvY3RcIiwgXCJub3ZcIiwgXCJkZWNcIl07XG4gICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gdG9kYXkuZ2V0RGF0ZSgpICsgXCIgXCIgKyBtb250aFt0b2RheS5nZXRNb250aCgpXSArIFwiIFwiICsgdG9kYXkuZ2V0RnVsbFllYXIoKTtcbn1cblxuLyoqXG4gKiBHZXRzIGFwcGxpY2F0aW9uIGluZm9ybWF0aW9uIGZvciBpbmZvIHdpbmRvdy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHRvIGRpc3BsYXkgdGhlIGluZm9ybWF0aW9uIGluLlxuICovXG5mdW5jdGlvbiBpbmZvKGVsZW1lbnQpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luZm9cIikuY29udGVudDtcbiAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudC5pZCkucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUsIHRydWUpKTtcbn1cblxuLyoqXG4gKiBJbml0aWF0ZXMgZGVza3RvcCBieSBhZGRpbmcgbmVjZXNzYXJ5IGV2ZW50IGxpc3RlbmVycy5cbiAqL1xuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBsZXQgbmV3V2luZG93O1xuICAgIGxldCBjTnIgPSAxO1xuICAgIGxldCBtTnIgPSAxO1xuICAgIGxldCBpTnIgPSAxO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJuYXYgYVwiKS5mb3JFYWNoKGZ1bmN0aW9uKGN1cnJlbnQsIGluZGV4KSB7XG4gICAgICAgIHN3aXRjaCAoaW5kZXgpe1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBDaGF0KFwiY1wiICsgY05yKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lm5hbWUudGV4dENvbnRlbnQgPSBcIkNoYXRcIjtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lmljb24uc3JjID0gXCIvaW1hZ2UvY2hhdC5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgY05yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgTWVtb3J5KFwibVwiICsgbU5yKTtcbiAgICAgICAgICAgICAgICAgICAgbU5yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgRGVza3RvcFdpbmRvdyhcImlcIiArIGlOcik7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5uYW1lLnRleHRDb250ZW50ID0gXCJBcHBsaWNhdGlvbiBpbmZvXCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL2luZm8ucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIGluZm8obmV3V2luZG93KTtcbiAgICAgICAgICAgICAgICAgICAgaU5yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZ2V0RGF0ZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RhdGVcIikpO1xuICAgIGRlc2t0b3BDbG9jayhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Nsb2NrXCIpKTtcbiAgICBzZXRJbnRlcnZhbChkZXNrdG9wQ2xvY2ssIDUwMDApO1xufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgZ2V0Q2xvY2s6IGRlc2t0b3BDbG9jayxcbiAgICBnZXREYXRlOiBnZXREYXRlLFxuICAgIGdldEluZm86IGluZm9cbn07XG4iXX0=
