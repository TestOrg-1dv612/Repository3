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
        div.style.left = (div.offsetLeft + 200) + "px";
        stackWindows("m");
    } else if (id.indexOf("r") !== -1) {
        div.style.left = (div.offsetLeft + 400) + "px";
        stackWindows("m");
    } else if (id.indexOf("i") !== -1) {
        div.style.left = (div.offsetLeft + 600) + "px";
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
 * Module for Remember application.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

"use strict";

const DesktopWindow = require("./DesktopWindow");

/**
 * Creates an instance of Remember.
 *
 * @constructor
 * @param id
 */
function Remember(id) {
    DesktopWindow.call(this, id);
    this.new();
};

/**
 * Handles inheritance from DesktopWindow.
 *
 * @type {DesktopWindow}
 */
Remember.prototype = Object.create(DesktopWindow.prototype);
Remember.prototype.constructor = Remember;

/**
 * Creates a new note.
 */
Remember.prototype.new = function() {
    let template = document.querySelector("#remember").content;
    let content = document.importNode(template, true);
    document.getElementById(this.id).querySelector(".content").appendChild(content);

    let input = document.getElementById(this.id).querySelector(".note-input");
    document.getElementById(this.id).querySelector("button").addEventListener("click", function() {
        if (!input.value) {
            input.classList.add("redbg");
        } else {
            input.classList.remove("redbg");
            this.add(input.value);
            input.value = "";
        }
    }.bind(this));

    this.dropdown.textContent = "Save";
};

/**
 * Adds input to the note.
 *
 * @param {String} input - User input from element.
 */
Remember.prototype.add = function(input) {
    let noteElem = document.getElementById(this.id).querySelectorAll(".note p")[0].cloneNode(true);
    noteElem.textContent = input;
    document.getElementById(this.id).querySelector(".note").appendChild(noteElem);
};

/**
 * Exports.
 *
 * @type {Remember}
 */
module.exports = Remember;

},{"./DesktopWindow":2}],5:[function(require,module,exports){
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
    let container = document.getElementById(element.id).querySelector(".content");

    container.appendChild(document.importNode(template, true));
    let menu = document.getElementById(element.id).querySelector(".menu");
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

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZW1lbWJlci5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9sb2NhbHN0b3JhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBNb2R1bGUgZm9yIENoYXQuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcbmNvbnN0IHN0b3JhZ2UgPSByZXF1aXJlKFwiLi9sb2NhbHN0b3JhZ2VcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIENoYXQuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gQ2hhdChpZCwgdXNlcikge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICB0aGlzLnVzZXIgPSB1c2VyIHx8IFwiVW5rbm93blwiO1xuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIpO1xuICAgIHRoaXMub3BlbigpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5DaGF0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGVza3RvcFdpbmRvdy5wcm90b3R5cGUpO1xuQ2hhdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGF0O1xuXG4vKipcbiAqIEluaXRpYXRlcyB0aGUgYXBwbGljYXRpb24uXG4gKi9cbkNoYXQucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYXRcIikuY29udGVudDtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUsIHRydWUpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuICAgIGxldCBtZXNzYWdlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLmNoYXRNZXNzYWdlXCIpO1xuICAgIGxldCB1c2VySW5mbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIudXNlclwiKTtcbiAgICB0aGlzLmdldFVzZXIodXNlckluZm8pO1xuXG4gICAgbWVzc2FnZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMgfHwgZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy51c2VyICE9PSBcIlVua25vd25cIikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZChtZXNzYWdlSW5wdXQudmFsdWUpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VJbnB1dC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVzZXJJbmZvLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5hZGQoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG5cbiAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gXCJtZXNzYWdlXCIgfHwgZGF0YS50eXBlID09PSBcIm5vdGlmaWNhdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzLnJlY2VpdmUoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSB1c2VyIGZvciB0aGUgY2hhdCBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpdiAtIFRoZSBkaXYgaG9sZGluZyB0aGUgdXNlciBpbmZvcm1hdGlvbi5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuZ2V0VXNlciA9IGZ1bmN0aW9uKGRpdikge1xuICAgIGxldCBpbnB1dCA9IGRpdi5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICBsZXQgYnV0dG9uID0gZGl2Lmxhc3RFbGVtZW50Q2hpbGQ7XG4gICAgbGV0IHJlbW92ZVVzZXJFbGVtID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGRpdi5yZW1vdmVDaGlsZChpbnB1dCk7XG4gICAgICAgIGRpdi5yZW1vdmVDaGlsZChidXR0b24pO1xuICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImxvZ2dlZEluXCIpO1xuICAgICAgICBkaXYudGV4dENvbnRlbnQgPSBcIkxvZ2dlZCBpbiBhcyBcIiArIHRoaXMudXNlcjtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICBsZXQgZ2V0VXNlcm5hbWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGRpdi5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy51c2VyID0gZGl2LmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICAgICAgaW5wdXQuY2xhc3NMaXN0LnJlbW92ZShcInJlZGJnXCIpO1xuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgcmVtb3ZlVXNlckVsZW0oKTtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KHRoaXMudXNlcik7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICBpZiAoIXN0b3JhZ2UuZ2V0KFwidXNlcm5hbWVcIikpIHtcbiAgICAgICAgZGl2Lmxhc3RFbGVtZW50Q2hpbGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdldFVzZXJuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVzZXIgPSBzdG9yYWdlLmdldChcInVzZXJuYW1lXCIpO1xuICAgICAgICByZW1vdmVVc2VyRWxlbSgpO1xuICAgIH1cblxuICAgIHRoaXMuZHJvcGRvd24udGV4dENvbnRlbnQgPSBcIkNoYW5nZSB1c2VyXCI7XG4gICAgdGhpcy5kcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGl2LnRleHRDb250ZW50ID0gXCJVc2VyOiBcIjtcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5yZW1vdmUoXCJsb2dnZWRJblwiKTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgIHRoaXMudXNlciA9IFwiVW5rbm93blwiO1xuICAgICAgICBkaXYubGFzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2V0VXNlcm5hbWUpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG4vKipcbiAqIFNlbmRzIHR5cGVkIGluIG1lc3NhZ2VzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCAtIFRoZSBpbnB1dCBtZXNzYWdlIGZyb20gdGhlIHRleHRhcmVhLlxuICovXG5DaGF0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICBsZXQgbWVzc2FnZSA9IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGRhdGE6IGlucHV0LFxuICAgICAgICB1c2VybmFtZTogdGhpcy51c2VyLFxuICAgICAgICBrZXk6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIlxuICAgIH07XG5cbiAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbn07XG5cbi8qKlxuICogUmVjZWl2ZXMgYW5kIGRpc3BsYXlzIG1lc3NhZ2VzIGluIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gVGhlIHJlY2VpdmVkIGRhdGEuXG4gKi9cbkNoYXQucHJvdG90eXBlLnJlY2VpdmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUNvbnRhaW5lclwiKTtcblxuICAgIGxldCB1c2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgdXNlci5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInVzZXJuYW1lXCIpO1xuICAgIHVzZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YS51c2VybmFtZSkpO1xuICAgIGxldCBwRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIHBFbGVtLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEuZGF0YSkpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHVzZXIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChwRWxlbSk7XG5cbiAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodCAtIGNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge0NoYXR9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gQ2hhdDtcbiIsIi8qKlxuICogTW9kdWxlIGZvciBEZXNrdG9wV2luZG93LlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIERlc2t0b3BXaW5kb3cuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdyB0byBjcmVhdGUuXG4gKiBAdGhyb3dzIHtFcnJvcn0gLSBXaW5kb3cgbXVzdCBoYXZlIGFuIGlkLlxuICovXG5mdW5jdGlvbiBEZXNrdG9wV2luZG93KGlkKSB7XG4gICAgaWYgKCFpZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXaW5kb3cgbXVzdCBoYXZlIGFuIGlkLlwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIERlc2t0b3BXaW5kb3cncyB0b3AtbmFtZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNuYW1lXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwibmFtZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5uYW1lXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIERlc2t0b3BXaW5kb3cncyB0b3AtbmFtZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNpY29uXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiaWNvblwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5sb2dvXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIERlc2t0b3BXaW5kb3cncyBkcm9wZG93biBsaW5rIGluIG1lbnUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjZHJvcGRvd25cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJkcm9wZG93blwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpWzBdO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIERlc2t0b3BXaW5kb3cncyBpZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2lkXG4gICAgICogQHRocm93cyB7VHlwZUVycm9yfSAtIE11c3QgYmUgYSBzdHJpbmcuXG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiaWRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJXaW5kb3cgaWQgbXVzdCBiZSBhIHN0cmluZy5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5jcmVhdGUoKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHdpbmRvdyBmcm9tIHRlbXBsYXRlLlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvd1wiKTtcbiAgICBsZXQgd2luZG93RGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Rlc2t0b3BcIikuYXBwZW5kQ2hpbGQod2luZG93RGl2KTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3VuY2xhaW1lZFwiKS5pZCA9IHRoaXMuaWQ7XG5cbiAgICBsZXQgaWQgPSB0aGlzLmlkLnRvU3RyaW5nKCk7XG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpO1xuXG4gICAgdGhpcy5wb3NpdGlvbihpZCwgZGl2KTtcbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KGRpdik7XG5cbiAgICBkaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZGl2ICE9PSBkaXYucGFyZW50Tm9kZS5sYXN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgICAgICBkaXYucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcInRleHRhcmVhXCIpIHx8XG4gICAgICAgICAgICBldmVudC50YXJnZXQgPT09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFwiKSkge1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmZvY3VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlQ29udGFpbmVyXCIpO1xuICAgICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbEhlaWdodCAtIGNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBQb3NpdGlvbnMgdGhlIHdpbmRvdyBpbiB0aGUgZGVza3RvcCwgc3RhY2tzIGlmIG5lY2Vzc2FyeS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7RWxlbWVudH0gZGl2IC0gVGhlIHdpbmRvdyBlbGVtZW50LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKGlkLCBkaXYpIHtcbiAgICBsZXQgc3RhY2tXaW5kb3dzID0gZnVuY3Rpb24oYXBwKSB7XG4gICAgICAgIGlmIChpZC5pbmRleE9mKFwiMVwiKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGxldCBpZE5yID0gaWQuY2hhckF0KDEpIC0gMTtcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhcHAgKyBpZE5yKSkge1xuICAgICAgICAgICAgICAgIGxldCBlbGVtZW50QmVmb3JlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXBwICsgaWROcik7XG4gICAgICAgICAgICAgICAgZGl2LnN0eWxlLnRvcCA9IChlbGVtZW50QmVmb3JlLm9mZnNldFRvcCArIDM1KSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChlbGVtZW50QmVmb3JlLm9mZnNldExlZnQgKyAzNSkgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKGlkLmluZGV4T2YoXCJjXCIpICE9PSAtMSkge1xuICAgICAgICBzdGFja1dpbmRvd3MoXCJjXCIpO1xuICAgIH0gZWxzZSBpZiAoaWQuaW5kZXhPZihcIm1cIikgIT09IC0xKSB7XG4gICAgICAgIGRpdi5zdHlsZS5sZWZ0ID0gKGRpdi5vZmZzZXRMZWZ0ICsgMjAwKSArIFwicHhcIjtcbiAgICAgICAgc3RhY2tXaW5kb3dzKFwibVwiKTtcbiAgICB9IGVsc2UgaWYgKGlkLmluZGV4T2YoXCJyXCIpICE9PSAtMSkge1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChkaXYub2Zmc2V0TGVmdCArIDQwMCkgKyBcInB4XCI7XG4gICAgICAgIHN0YWNrV2luZG93cyhcIm1cIik7XG4gICAgfSBlbHNlIGlmIChpZC5pbmRleE9mKFwiaVwiKSAhPT0gLTEpIHtcbiAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSAoZGl2Lm9mZnNldExlZnQgKyA2MDApICsgXCJweFwiO1xuICAgICAgICBzdGFja1dpbmRvd3MoXCJpXCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBkcmFnZ2luZyBtb3ZlbWVudHMgb2YgdGhlIHdpbmRvdy5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpdiAtIFRoZSBkaXYgY29udGFpbmluZyB0aGUgd2luZG93LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5oYW5kbGVNb3ZlbWVudCA9IGZ1bmN0aW9uKGRpdikge1xuICAgIGxldCBwb3NYID0gMDtcbiAgICBsZXQgcG9zWSA9IDA7XG5cbiAgICBsZXQgbW92ZVdpbmRvdyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGRpdi5zdHlsZS50b3AgPSAoZXZlbnQuY2xpZW50WSAtIHBvc1kpICsgXCJweFwiO1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IChldmVudC5jbGllbnRYIC0gcG9zWCkgKyBcInB4XCI7XG4gICAgfTtcblxuICAgIGxldCBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VcIikpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoZGl2KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgIHBvc1ggPSBldmVudC5jbGllbnRYIC0gZGl2Lm9mZnNldExlZnQ7XG4gICAgICAgIHBvc1kgPSBldmVudC5jbGllbnRZIC0gZGl2Lm9mZnNldFRvcDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZVdpbmRvdyk7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgZGl2LmZpcnN0RWxlbWVudENoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZ2V0UG9zaXRpb24pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlV2luZG93KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgd2luZG93IHRvIGNsb3NlLlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG5cbiAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge0Rlc2t0b3BXaW5kb3d9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gRGVza3RvcFdpbmRvdztcbiIsIi8qKlxuICogTW9kdWxlIGZvciBNZW1vcnkuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgTWVtb3J5IGdhbWUuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gTWVtb3J5KGlkKSB7XG4gICAgRGVza3RvcFdpbmRvdy5jYWxsKHRoaXMsIGlkKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzaXplIG9mIHRoZSBib2FyZC5cbiAgICAgKi9cbiAgICB0aGlzLnNpemUgPSAxNjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBhcnJheSB0byBjb250YWluIHRoZSBicmljayBpbWFnZXMuXG4gICAgICovXG4gICAgdGhpcy5pbWFnZXMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBmaXJzdCB0dXJuZWQgYnJpY2suXG4gICAgICovXG4gICAgdGhpcy50dXJuMSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2Vjb25kIHR1cm5lZCBicmljay5cbiAgICAgKi9cbiAgICB0aGlzLnR1cm4yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgcGFpcnMuXG4gICAgICovXG4gICAgdGhpcy5wYWlycyA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbnVtYmVyIG9mIGNsaWNrcy5cbiAgICAgKi9cbiAgICB0aGlzLm5yT2ZDbGlja3MgPSAwO1xuXG4gICAgdGhpcy5zdGFydCgpO1xufVxuXG4vKipcbiAqIEhhbmRsZXMgaW5oZXJpdGFuY2UgZnJvbSBEZXNrdG9wV2luZG93LlxuICpcbiAqIEB0eXBlIHtEZXNrdG9wV2luZG93fVxuICovXG5NZW1vcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNrdG9wV2luZG93LnByb3RvdHlwZSk7XG5NZW1vcnkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWVtb3J5O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgZ2FtZSBhbmQgYWRkcyBldmVudCBsaXN0ZW5lcnMuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNodWZmbGUoKTtcbiAgICB0aGlzLnNldFNpemUoKTtcbiAgICB0aGlzLnNldE1lbnUoKTtcblxuICAgIHRoaXMuZHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMucmVzdGFydCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICBsZXQgbGlua3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzFdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKTtcbiAgICBsaW5rcy5mb3JFYWNoKGZ1bmN0aW9uKGN1cnJlbnQpIHtcbiAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LnRhcmdldC50ZXh0Q29udGVudCkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCIzeDJcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gNjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIjR4M1wiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSAxMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIjR4NFwiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSAxNjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucmVzdGFydCgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG4vKipcbiAqIFNldHMgZWxlbWVudHMgZm9yIHRoZSBkcm9wLWRvd24gbWVudSB0byBhbGxvdyBjaGFuZ2luZyBzaXplIG9mIHRoZSBib2FyZC5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zZXRNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLm1lbnVsaW5rXCIpO1xuICAgIGxldCBtZW51Q2xvbmUgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQobWVudUNsb25lKTtcblxuICAgIGxldCBuZXdMaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXTtcbiAgICBuZXdMaW5rLmZpcnN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gXCJTaXplXCI7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDI7IGkgKz0gMSkge1xuICAgICAgICBsZXQgZHJvcGRvd25DbG9uZSA9IG5ld0xpbmsucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93biBhXCIpLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgbmV3TGluay5sYXN0RWxlbWVudENoaWxkLmFwcGVuZENoaWxkKGRyb3Bkb3duQ2xvbmUpO1xuICAgIH1cblxuICAgIGxldCBkcm9wZG93bkxpbmtzID0gbmV3TGluay5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIik7XG4gICAgZHJvcGRvd25MaW5rc1swXS50ZXh0Q29udGVudCA9IFwiM3gyXCI7XG4gICAgZHJvcGRvd25MaW5rc1sxXS50ZXh0Q29udGVudCA9IFwiNHgzXCI7XG4gICAgZHJvcGRvd25MaW5rc1syXS50ZXh0Q29udGVudCA9IFwiNHg0XCI7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHNpemUgb2YgdGhlIGJvYXJkLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdGVtcGxhdGVEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeVwiKS5jb250ZW50O1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLCBmYWxzZSk7XG4gICAgbGV0IHJlc3VsdEVsZW0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2Lmxhc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgc3dpdGNoICh0aGlzLnNpemUpIHtcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDZcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiYm9hcmQxMlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDE2XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbGV0IGE7XG4gICAgdGhpcy5pbWFnZXMuZm9yRWFjaChmdW5jdGlvbihpbWFnZSwgaW5kZXgpIHtcbiAgICAgICAgYSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgICAgICBhLmZpcnN0RWxlbWVudENoaWxkLnNldEF0dHJpYnV0ZShcImRhdGEtYnJpY2tOclwiLCBpbmRleCk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgIH0pO1xuXG4gICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGxldCBpbWcgPSAoZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSBcIklNR1wiKSA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgbGV0IGluZGV4ID0gcGFyc2VJbnQoaW1nLmdldEF0dHJpYnV0ZShcImRhdGEtYnJpY2tOclwiKSk7XG4gICAgICAgIHRoaXMudHVybkJyaWNrKHRoaXMuaW1hZ2VzW2luZGV4XSwgaW5kZXgsIGltZyk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hcHBlbmRDaGlsZChyZXN1bHRFbGVtKTtcbn07XG5cbi8qKlxuICogU2h1ZmZsZXMgdGhlIGFycmF5IHdpdGggaW1hZ2VzLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnNodWZmbGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmltYWdlcyA9IFsxLDEsMiwyLDMsMyw0LDQsNSw1LDYsNiw3LDcsOCw4XTtcblxuICAgIGxldCBpbmRleFRvU3dhcDtcbiAgICBsZXQgdGVtcEltZztcbiAgICBsZXQgaW1ncztcblxuICAgIHN3aXRjaCAodGhpcy5zaXplKSB7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIGltZ3MgPSB0aGlzLmltYWdlcy5zbGljZSgwLCA2KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgaW1ncyA9IHRoaXMuaW1hZ2VzLnNsaWNlKDAsIDEyKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgaW1ncyA9IHRoaXMuaW1hZ2VzO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSB0aGlzLnNpemUgLSAxOyBpID4gMDsgaSAtPSAxKSB7XG4gICAgICAgIGluZGV4VG9Td2FwID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSk7XG4gICAgICAgIHRlbXBJbWcgPSBpbWdzW2ldO1xuICAgICAgICBpbWdzW2ldID0gaW1nc1tpbmRleFRvU3dhcF07XG4gICAgICAgIGltZ3NbaW5kZXhUb1N3YXBdID0gdGVtcEltZztcbiAgICB9XG5cbiAgICB0aGlzLmltYWdlcyA9IGltZ3M7XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgdGhlIGV2ZW50IG9mIHR1cm5pbmcgYSBicmljay5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYnJpY2tJbWcgLSBUaGUgaW1hZ2Ugb2YgdGhlIHR1cm5lZCBicmljay5cbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgdHVybmVkIGJyaWNrLlxuICogQHBhcmFtIHtFbGVtZW50fSBpbWcgLSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBicmljay5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS50dXJuQnJpY2sgPSBmdW5jdGlvbihicmlja0ltZywgaW5kZXgsIGltZykge1xuICAgIGlmICh0aGlzLnR1cm4yKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpbWcuc3JjID0gXCIvaW1hZ2UvbWVtb3J5L1wiICsgYnJpY2tJbWcgKyBcIi5wbmdcIjtcblxuICAgIGlmICghdGhpcy50dXJuMSkge1xuICAgICAgICB0aGlzLnR1cm4xID0gaW1nO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpbWcgPT09IHRoaXMudHVybjEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubnJPZkNsaWNrcyArPSAxO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLnRyaWVzXCIpLnRleHRDb250ZW50ID0gdGhpcy5uck9mQ2xpY2tzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgdGhpcy50dXJuMiA9IGltZztcbiAgICAgICAgaWYgKHRoaXMudHVybjEuc3JjID09PSB0aGlzLnR1cm4yLnNyYykge1xuICAgICAgICAgICAgdGhpcy5wYWlycyArPSAxO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5wYWlyc1wiKS50ZXh0Q29udGVudCA9IHRoaXMucGFpcnMudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucGFpcnMgPT09IHRoaXMuc2l6ZSAvIDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZEdhbWUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4xLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcImVtcHR5XCIpO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwiZW1wdHlcIik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNDAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMS5zcmMgPSBcIi9pbWFnZS9tZW1vcnkvMC5wbmdcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yLnNyYyA9IFwiL2ltYWdlL21lbW9yeS8wLnBuZ1wiO1xuXG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuMiA9IG51bGw7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDUwMCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEVuZHMgdGhlIGdhbWUgYW5kIGRpc3BsYXlzIG1lc3NhZ2UuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuZW5kR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBtZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlXCIpO1xuXG4gICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFwiWW91IGZpbmlzaGVkIHRoZSBnYW1lIVwiO1xufTtcblxuLyoqXG4gKiBSZXN0YXJ0cyBhbmQgY2xlYXJzIHRoZSBNZW1vcnkgZ2FtZS5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5yZXN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcbiAgICB3aGlsZSAoY29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICB0aGlzLnBhaXJzID0gMDtcbiAgICB0aGlzLm5yT2ZDbGlja3MgPSAwO1xuICAgIHRoaXMuc2h1ZmZsZSgpO1xuICAgIHRoaXMuc2V0U2l6ZSgpO1xufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtNZW1vcnl9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIFJlbWVtYmVyIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBSZW1lbWJlci5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSBpZFxuICovXG5mdW5jdGlvbiBSZW1lbWJlcihpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG4gICAgdGhpcy5uZXcoKTtcbn07XG5cbi8qKlxuICogSGFuZGxlcyBpbmhlcml0YW5jZSBmcm9tIERlc2t0b3BXaW5kb3cuXG4gKlxuICogQHR5cGUge0Rlc2t0b3BXaW5kb3d9XG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGVza3RvcFdpbmRvdy5wcm90b3R5cGUpO1xuUmVtZW1iZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVtZW1iZXI7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBub3RlLlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUubmV3ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZW1lbWJlclwiKS5jb250ZW50O1xuICAgIGxldCBjb250ZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZSwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuXG4gICAgbGV0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCkucXVlcnlTZWxlY3RvcihcIi5ub3RlLWlucHV0XCIpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuaWQpLnF1ZXJ5U2VsZWN0b3IoXCJidXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWlucHV0LnZhbHVlKSB7XG4gICAgICAgICAgICBpbnB1dC5jbGFzc0xpc3QuYWRkKFwicmVkYmdcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dC5jbGFzc0xpc3QucmVtb3ZlKFwicmVkYmdcIik7XG4gICAgICAgICAgICB0aGlzLmFkZChpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICBpbnB1dC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5kcm9wZG93bi50ZXh0Q29udGVudCA9IFwiU2F2ZVwiO1xufTtcblxuLyoqXG4gKiBBZGRzIGlucHV0IHRvIHRoZSBub3RlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCAtIFVzZXIgaW5wdXQgZnJvbSBlbGVtZW50LlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICBsZXQgbm90ZUVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yQWxsKFwiLm5vdGUgcFwiKVswXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgbm90ZUVsZW0udGV4dENvbnRlbnQgPSBpbnB1dDtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKS5xdWVyeVNlbGVjdG9yKFwiLm5vdGVcIikuYXBwZW5kQ2hpbGQobm90ZUVsZW0pO1xufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICpcbiAqIEB0eXBlIHtSZW1lbWJlcn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBSZW1lbWJlcjtcbiIsIi8qKlxuICogU3RhcnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgbWhhbW1hcnN0ZWR0XG4gKiBAdmVyc2lvbiAxLjE2LjBcbiAqL1xuXG5jb25zdCBkZXNrdG9wID0gcmVxdWlyZShcIi4vZGVza3RvcFwiKTtcblxuZGVza3RvcC5pbml0KCk7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgZGVza3RvcC5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgRGVza3RvcFdpbmRvdyA9IHJlcXVpcmUoXCIuL0Rlc2t0b3BXaW5kb3dcIik7XG5jb25zdCBDaGF0ID0gcmVxdWlyZShcIi4vQ2hhdFwiKTtcbmNvbnN0IE1lbW9yeSA9IHJlcXVpcmUoXCIuL01lbW9yeVwiKTtcbmNvbnN0IFJlbWVtYmVyID0gcmVxdWlyZShcIi4vUmVtZW1iZXJcIik7XG5cbi8qKlxuICogR2V0cyB0aGUgY3VycmVudCB0aW1lIGFuZCBwcmVzZW50cyBpdCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIC0gVGhlIGNvbnRhaW5lciBvZiB0aGUgY2xvY2suXG4gKi9cbmZ1bmN0aW9uIGRlc2t0b3BDbG9jayhjb250YWluZXIpIHtcbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Nsb2NrXCIpO1xuICAgIH1cblxuICAgIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IGhvdXJzID0gdG9kYXkuZ2V0SG91cnMoKTtcbiAgICBsZXQgbWlucyA9IHRvZGF5LmdldE1pbnV0ZXMoKTtcblxuICAgIGlmIChtaW5zIDwgMTApIHtcbiAgICAgICAgbWlucyA9IFwiMFwiICsgbWlucztcbiAgICB9XG5cbiAgICBpZiAoaG91cnMgPCAxMCkge1xuICAgICAgICBob3VycyA9IFwiMFwiICsgaG91cnM7XG4gICAgfVxuXG4gICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gaG91cnMgKyBcIjpcIiArIG1pbnM7XG59XG5cbi8qKlxuICogR2V0cyB0b2RheSdzIGRhdGUgYW5kIHByZXNlbnRzIGl0IGluIHRoZSBnaXZlbiBjb250YWluZXIuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIgLSBUaGUgY29udGFpbmVyIG9mIHRoZSBjbG9jay5cbiAqL1xuZnVuY3Rpb24gZ2V0RGF0ZShjb250YWluZXIpIHtcbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBtb250aCA9IFtcImphblwiLCBcImZlYlwiLCBcIm1hclwiLCBcImFwclwiLCBcIm1heVwiLCBcImp1bmVcIiwgXCJqdWx5XCIsIFwiYXVnXCIsIFwic2VwdFwiLCBcIm9jdFwiLCBcIm5vdlwiLCBcImRlY1wiXTtcbiAgICBjb250YWluZXIudGV4dENvbnRlbnQgPSB0b2RheS5nZXREYXRlKCkgKyBcIiBcIiArIG1vbnRoW3RvZGF5LmdldE1vbnRoKCldICsgXCIgXCIgKyB0b2RheS5nZXRGdWxsWWVhcigpO1xufVxuXG4vKipcbiAqIEdldHMgYXBwbGljYXRpb24gaW5mb3JtYXRpb24gZm9yIGluZm8gd2luZG93LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgdG8gZGlzcGxheSB0aGUgaW5mb3JtYXRpb24gaW4uXG4gKi9cbmZ1bmN0aW9uIGluZm8oZWxlbWVudCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5mb1wiKS5jb250ZW50O1xuICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50LmlkKS5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZSwgdHJ1ZSkpO1xuICAgIGxldCBtZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudC5pZCkucXVlcnlTZWxlY3RvcihcIi5tZW51XCIpO1xuICAgIG1lbnUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtZW51KTtcbn1cblxuLyoqXG4gKiBJbml0aWF0ZXMgZGVza3RvcCBieSBhZGRpbmcgbmVjZXNzYXJ5IGV2ZW50IGxpc3RlbmVycy5cbiAqL1xuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBsZXQgbmV3V2luZG93O1xuICAgIGxldCBjTnIgPSAxO1xuICAgIGxldCBtTnIgPSAxO1xuICAgIGxldCByTnIgPSAxO1xuICAgIGxldCBpTnIgPSAxO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJuYXYgYVwiKS5mb3JFYWNoKGZ1bmN0aW9uKGN1cnJlbnQsIGluZGV4KSB7XG4gICAgICAgIHN3aXRjaCAoaW5kZXgpe1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBDaGF0KFwiY1wiICsgY05yKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lm5hbWUudGV4dENvbnRlbnQgPSBcIkNoYXRcIjtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lmljb24uc3JjID0gXCIvaW1hZ2UvY2hhdC5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgY05yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgTWVtb3J5KFwibVwiICsgbU5yKTtcbiAgICAgICAgICAgICAgICAgICAgbU5yICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgUmVtZW1iZXIoXCJyXCIgKyByTnIpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cubmFtZS50ZXh0Q29udGVudCA9IFwiUmVtZW1iZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lmljb24uc3JjID0gXCIvaW1hZ2Uvbm90ZXMucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIHJOciArPSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IERlc2t0b3BXaW5kb3coXCJpXCIgKyBpTnIpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cubmFtZS50ZXh0Q29udGVudCA9IFwiQXBwbGljYXRpb24gaW5mb1wiO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cuaWNvbi5zcmMgPSBcIi9pbWFnZS9pbmZvLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICBpbmZvKG5ld1dpbmRvdyk7XG4gICAgICAgICAgICAgICAgICAgIGlOciArPSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGdldERhdGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkYXRlXCIpKTtcbiAgICBkZXNrdG9wQ2xvY2soZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjbG9ja1wiKSk7XG4gICAgc2V0SW50ZXJ2YWwoZGVza3RvcENsb2NrLCA1MDAwKTtcbn1cblxuLyoqXG4gKiBFeHBvcnRzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBpbml0LFxuICAgIGdldENsb2NrOiBkZXNrdG9wQ2xvY2ssXG4gICAgZ2V0RGF0ZTogZ2V0RGF0ZSxcbiAgICBnZXRJbmZvOiBpbmZvXG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIGhhbmRsaW5nIGxvY2FsIHN0b3JhZ2UuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEdldHMgYW4gaXRlbSBmcm9tIGxvY2FsIHN0b3JhZ2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgaXRlbSB0byBnZXQuXG4gKiBAcmV0dXJucyB1c2VyIC0gVGhlIHNldCB1c2VybmFtZS5cbiAqL1xuZnVuY3Rpb24gZ2V0KG5hbWUpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSk7XG59XG5cbi8qKlxuICogU2V0cyBhbiBpdGVtIGluIGxvY2FsIHN0b3JhZ2UuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHVzZXJuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHVzZXIuXG4gKi9cbmZ1bmN0aW9uIHNldCh1c2VybmFtZSkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlcm5hbWVcIiwgdXNlcm5hbWUpO1xufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0OiBzZXQsXG4gICAgZ2V0OiBnZXRcbn07XG4iXX0=
