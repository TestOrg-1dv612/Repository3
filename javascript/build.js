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
     * @version 1.16.1
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
            let allWindows = document.querySelectorAll(".window-wrapper");
            let elementBefore;
            if (allWindows.length > 1) {
                for (let i = allWindows.length - 1; i >= 0; i -= 1) {
                    if (allWindows[i].id.slice(0, 1) === app && parseFloat(allWindows[i].id.slice(1)) < parseFloat(this.id.slice(1)) &&
                        !allWindows[i].style.visibility) {
                        if (elementBefore) {
                            if (Number(allWindows[i].id.slice(1)) > Number(elementBefore.id.slice(1))) {
                                elementBefore = allWindows[i];
                            }
                        } else {
                            elementBefore = allWindows[i];
                        }
                    }
                }
            }

            if (elementBefore) {
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
     * @version 1.16.1
     */

    "use strict";

    /**
     * Initiates desktop application.
     */
    const desktop = require("./desktop");
    desktop.init();

    /**
     * Registers service worker.
     */
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./worker.js", { scope: "./"}).then((registration) => {
            console.log("Service worker registered.", registration);
        }).catch((error) => {
            console.log("Service worker failed to register.", error);
        });
    }

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
                        newWindow.icon.src = "./image/chat.png";
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
                        newWindow.icon.src = "./image/notes.png";
                        numbers[2] += 1;
                    });

                    break;
                case 3:
                    current.addEventListener("click", (event) => {
                        event.preventDefault();
                        newWindow = new DesktopWindow("i" + numbers[3]);
                        newWindow.name.textContent = "Application info";
                        newWindow.icon.src = "./image/info.png";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvRGVza3RvcFdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9SZW1lbWJlci5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9sb2NhbHN0b3JhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBNb2R1bGUgZm9yIENoYXQuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBEZXNrdG9wV2luZG93ID0gcmVxdWlyZShcIi4vRGVza3RvcFdpbmRvd1wiKTtcbmNvbnN0IHN0b3JhZ2UgPSByZXF1aXJlKFwiLi9sb2NhbHN0b3JhZ2VcIik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIENoYXQuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gQ2hhdChpZCkge1xuICAgIERlc2t0b3BXaW5kb3cuY2FsbCh0aGlzLCBpZCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgdXNlci4gXCJVbmtub3duXCIgYnkgZGVmYXVsdC5cbiAgICAgKi9cbiAgICB0aGlzLnVzZXIgPSBcIlVua25vd25cIjtcblxuICAgIC8qKlxuICAgICAqIFRoZSB3ZWIgc29ja2V0IGZvciB0aGUgY2hhdC5cbiAgICAgKi9cbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiKTtcblxuICAgIC8qKlxuICAgICAqIE9wZW5zIHVwIGEgbmV3IGNoYXQuXG4gICAgICovXG4gICAgdGhpcy5vcGVuKCk7XG59XG5cbi8qKlxuICogSGFuZGxlcyBpbmhlcml0YW5jZSBmcm9tIERlc2t0b3BXaW5kb3cuXG4gKi9cbkNoYXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNrdG9wV2luZG93LnByb3RvdHlwZSk7XG5DaGF0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENoYXQ7XG5cbi8qKlxuICogSW5pdGlhdGVzIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xuQ2hhdC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFwiKS5jb250ZW50O1xuICAgIGxldCBjb250ZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuXG4gICAgbGV0IG1lc3NhZ2VJbnB1dCA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUlucHV0XCIpO1xuICAgIGxldCB1c2VySW5mbyA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIudXNlclwiKTtcbiAgICB0aGlzLmdldFVzZXIodXNlckluZm8pO1xuXG4gICAgbWVzc2FnZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5lbW9qaXMobWVzc2FnZUlucHV0KTtcblxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMgfHwgZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy51c2VyICE9PSBcIlVua25vd25cIikge1xuICAgICAgICAgICAgICAgIGlmICghbWVzc2FnZUlucHV0LnZhbHVlLnRyaW0oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIldyaXRlIHlvdXIgbWVzc2FnZS5cIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmQobWVzc2FnZUlucHV0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlucHV0LnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVzZXJJbmZvLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5hZGQoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcblxuICAgICAgICBpZiAoZGF0YS50eXBlID09PSBcIm1lc3NhZ2VcIiB8fCBkYXRhLnR5cGUgPT09IFwibm90aWZpY2F0aW9uXCIpIHtcbiAgICAgICAgICAgIHRoaXMucmVjZWl2ZShkYXRhKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSB1c2VyIGZvciB0aGUgY2hhdCBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGRpdiAtIFRoZSBkaXYgaG9sZGluZyB0aGUgdXNlciBpbmZvcm1hdGlvbi5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuZ2V0VXNlciA9IGZ1bmN0aW9uKGRpdikge1xuICAgIGxldCBpbnB1dCA9IGRpdi5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICBsZXQgYnV0dG9uID0gZGl2Lmxhc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICBsZXQgcmVtb3ZlVXNlckVsZW0gPSAoKSA9PiB7XG4gICAgICAgIGRpdi5yZW1vdmVDaGlsZChpbnB1dCk7XG4gICAgICAgIGRpdi5yZW1vdmVDaGlsZChidXR0b24pO1xuICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImxvZ2dlZEluXCIpO1xuICAgICAgICBkaXYudGV4dENvbnRlbnQgPSBcIkxvZ2dlZCBpbiBhcyBcIiArIHRoaXMudXNlcjtcbiAgICB9O1xuXG4gICAgbGV0IGdldFVzZXJuYW1lID0gKCkgPT4ge1xuICAgICAgICBpZiAoZGl2LmZpcnN0RWxlbWVudENoaWxkLnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBkaXYuZmlyc3RFbGVtZW50Q2hpbGQudmFsdWU7XG4gICAgICAgICAgICBpbnB1dC5jbGFzc0xpc3QucmVtb3ZlKFwicmVkYmdcIik7XG4gICAgICAgICAgICByZW1vdmVVc2VyRWxlbSgpO1xuICAgICAgICAgICAgc3RvcmFnZS5zZXQoXCJ1c2VybmFtZVwiLCB0aGlzLnVzZXIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGlmICghc3RvcmFnZS5nZXQoXCJ1c2VybmFtZVwiKSkge1xuICAgICAgICBkaXYubGFzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2V0VXNlcm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXNlciA9IHN0b3JhZ2UuZ2V0KFwidXNlcm5hbWVcIik7XG4gICAgICAgIHJlbW92ZVVzZXJFbGVtKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kcm9wZG93bi50ZXh0Q29udGVudCA9IFwiQ2hhbmdlIHVzZXJcIjtcbiAgICB0aGlzLmRyb3Bkb3duLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGl2LnRleHRDb250ZW50ID0gXCJVc2VyOiBcIjtcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5yZW1vdmUoXCJsb2dnZWRJblwiKTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgIHRoaXMudXNlciA9IFwiVW5rbm93blwiO1xuICAgICAgICBkaXYubGFzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2V0VXNlcm5hbWUpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBTZW5kcyB0eXBlZCBpbiBtZXNzYWdlcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgLSBUaGUgaW5wdXQgbWVzc2FnZSBmcm9tIHRoZSB0ZXh0YXJlYS5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICBkYXRhOiBpbnB1dCxcbiAgICAgICAgdXNlcm5hbWU6IHRoaXMudXNlcixcbiAgICAgICAga2V5OiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XG59O1xuXG4vKipcbiAqIFJlY2VpdmVzIGFuZCBkaXNwbGF5cyBtZXNzYWdlcyBpbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIFRoZSByZWNlaXZlZCBkYXRhLlxuICovXG5DaGF0LnByb3RvdHlwZS5yZWNlaXZlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VDb250YWluZXJcIik7XG4gICAgbGV0IG1lc3NhZ2VEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdE1lc3NhZ2VcIikuY29udGVudCwgdHJ1ZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpO1xuXG4gICAgY29udGFpbmVyLmxhc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBkYXRhLnVzZXJuYW1lO1xuICAgIGNvbnRhaW5lci5sYXN0RWxlbWVudENoaWxkLmxhc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBkYXRhLmRhdGE7XG5cbiAgICBpZiAoY29udGFpbmVyLmNoaWxkcmVuLmxlbmd0aCA+IDcwKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQpO1xuICAgIH1cblxuICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gY29udGFpbmVyLmNsaWVudEhlaWdodDtcbn07XG5cbi8qKlxuICogUmVwbGFjZXMgY2VydGFpbiBjaGFyYWN0ZXIgY29tYmluYXRpb25zIHdpdGggZW1vamlzLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdXNlciBpbnB1dC5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuZW1vamlzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGxldCBlbW9qaXMgPSB7XG4gICAgICAgIFwiOilcIjogXCJcXHVEODNEXFx1REUwQVwiLFxuICAgICAgICBcIjspXCI6IFwiXFx1RDgzRFxcdURFMDlcIixcbiAgICAgICAgXCI6RFwiOiBcIlxcdUQ4M0RcXHVERTAzXCIsXG4gICAgICAgIFwiOlBcIjogXCJcXHVEODNEXFx1REUxQlwiLFxuICAgICAgICBcIjtQXCI6IFwiXFx1RDgzRFxcdURFMUNcIixcbiAgICAgICAgXCI6L1wiOiBcIlxcdUQ4M0RcXHVERTE1XCIsXG4gICAgICAgIFwiOihcIjogXCJcXHVEODNEXFx1REUxRVwiLFxuICAgICAgICBcIjonKFwiOiBcIlxcdUQ4M0RcXHVERTIyXCIsXG4gICAgICAgIFwiKHkpXCI6IFwiXFx1RDgzRFxcdURDNERcIixcbiAgICAgICAgXCI8M1wiOiBcIlxcdTI3NjRcXHVGRTBGXCJcbiAgICB9O1xuXG4gICAgZm9yIChsZXQgaSBpbiBlbW9qaXMpIHtcbiAgICAgICAgZWxlbWVudC52YWx1ZSA9IGVsZW1lbnQudmFsdWUucmVwbGFjZShpLCBlbW9qaXNbaV0pO1xuICAgIH1cbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7Q2hhdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIERlc2t0b3BXaW5kb3cuXG4gKlxuICogQGF1dGhvciBtaGFtbWFyc3RlZHRcbiAqIEB2ZXJzaW9uIDEuMTYuMVxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRGVza3RvcFdpbmRvdy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgd2luZG93IHRvIGNyZWF0ZS5cbiAqIEB0aHJvd3Mge0Vycm9yfSAtIFdpbmRvdyBtdXN0IGhhdmUgYW4gaWQuXG4gKi9cbmZ1bmN0aW9uIERlc2t0b3BXaW5kb3coaWQpIHtcbiAgICBpZiAoIWlkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIldpbmRvdyBtdXN0IGhhdmUgYW4gaWQuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIHRvcC1uYW1lLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I25hbWVcbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJuYW1lXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5hbWVcIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIHRvcC1pY29uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgKiBAbmFtZSBEZXNrdG9wV2luZG93I2ljb25cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJpY29uXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmxvZ29cIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgRGVza3RvcFdpbmRvdydzIGZvb3RlciBtZXNzYWdlIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjbWVzc2FnZVxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIm1lc3NhZ2VcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIud2luZG93LWZvb3RlclwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgZmlyc3QgZHJvcGRvd24gbGluayBpbiB0aGUgZmlyc3Qgc3VibWVudS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0VsZW1lbnR9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNkcm9wZG93blxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImRyb3Bkb3duXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIilbMF07XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHdyYXBwZXIgZGl2IG9mIHRoZSBjdXJyZW50IERlc2t0b3BXaW5kb3cuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtFbGVtZW50fVxuICAgICAqIEBuYW1lIERlc2t0b3BXaW5kb3cjZGl2XG4gICAgICovXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZGl2XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBEZXNrdG9wV2luZG93J3MgaWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQG5hbWUgRGVza3RvcFdpbmRvdyNpZFxuICAgICAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gLSBNdXN0IGJlIGEgc3RyaW5nLlxuICAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImlkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiV2luZG93IGlkIG11c3QgYmUgYSBzdHJpbmcuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgd2luZG93LlxuICAgICAqL1xuICAgIHRoaXMuY3JlYXRlKCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB3aW5kb3cgZnJvbSB0ZW1wbGF0ZS5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dcIik7XG4gICAgbGV0IHdpbmRvd0RpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZXNrdG9wXCIpLmFwcGVuZENoaWxkKHdpbmRvd0Rpdik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN1bmNsYWltZWRcIikuaWQgPSB0aGlzLmlkO1xuXG4gICAgdGhpcy5wb3NpdGlvbigpO1xuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQoKTtcblxuICAgIHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmRpdiAhPT0gdGhpcy5kaXYucGFyZW50Tm9kZS5sYXN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgICAgICB0aGlzLmRpdi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMuZGl2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCJ0ZXh0YXJlYVwiKSB8fFxuICAgICAgICAgICAgZXZlbnQudGFyZ2V0ID09PSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIikpIHtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICAgICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFBvc2l0aW9ucyB0aGUgd2luZG93IGluIHRoZSBkZXNrdG9wLCBzdGFja3MgaWYgbmVjZXNzYXJ5LlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBzdGFja1dpbmRvd3MgPSAoYXBwKSA9PiB7XG4gICAgICAgIGxldCBhbGxXaW5kb3dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi53aW5kb3ctd3JhcHBlclwiKTtcbiAgICAgICAgbGV0IGVsZW1lbnRCZWZvcmU7XG4gICAgICAgIGlmIChhbGxXaW5kb3dzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBhbGxXaW5kb3dzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSAtPSAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFsbFdpbmRvd3NbaV0uaWQuc2xpY2UoMCwgMSkgPT09IGFwcCAmJiBwYXJzZUZsb2F0KGFsbFdpbmRvd3NbaV0uaWQuc2xpY2UoMSkpIDwgcGFyc2VGbG9hdCh0aGlzLmlkLnNsaWNlKDEpKSAmJlxuICAgICAgICAgICAgICAgICAgICAhYWxsV2luZG93c1tpXS5zdHlsZS52aXNpYmlsaXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50QmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTnVtYmVyKGFsbFdpbmRvd3NbaV0uaWQuc2xpY2UoMSkpID4gTnVtYmVyKGVsZW1lbnRCZWZvcmUuaWQuc2xpY2UoMSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudEJlZm9yZSA9IGFsbFdpbmRvd3NbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50QmVmb3JlID0gYWxsV2luZG93c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50QmVmb3JlKSB7XG4gICAgICAgICAgICBpZiAoKGVsZW1lbnRCZWZvcmUub2Zmc2V0VG9wICsgMzUpID4gKHdpbmRvdy5pbm5lckhlaWdodCAtIDUwKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRMZWZ0IC0gMzAwKSArIFwicHhcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUudG9wID0gKGVsZW1lbnRCZWZvcmUub2Zmc2V0VG9wICsgMzUpICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAoZWxlbWVudEJlZm9yZS5vZmZzZXRMZWZ0ICsgMzUpICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHN3aXRjaCAodGhpcy5pZC5zbGljZSgwLCAxKSkge1xuICAgICAgICBjYXNlIFwiY1wiOlxuICAgICAgICAgICAgc3RhY2tXaW5kb3dzKFwiY1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibVwiOlxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9ICh0aGlzLmRpdi5vZmZzZXRMZWZ0ICsgMjAwKSArIFwicHhcIjtcbiAgICAgICAgICAgIHN0YWNrV2luZG93cyhcIm1cIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInJcIjpcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSAodGhpcy5kaXYub2Zmc2V0TGVmdCArIDQwMCkgKyBcInB4XCI7XG4gICAgICAgICAgICBzdGFja1dpbmRvd3MoXCJyXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJpXCI6XG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gKHRoaXMuZGl2Lm9mZnNldExlZnQgKyA2MDApICsgXCJweFwiO1xuICAgICAgICAgICAgc3RhY2tXaW5kb3dzKFwiaVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBkcmFnZ2luZyBtb3ZlbWVudHMgb2YgdGhlIHdpbmRvdy5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUuaGFuZGxlTW92ZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgcG9zWCA9IDA7XG4gICAgbGV0IHBvc1kgPSAwO1xuXG4gICAgbGV0IHNjcm9sbERvd24gPSAoKSA9PiB7XG4gICAgICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VDb250YWluZXJcIik7XG4gICAgICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gY29udGFpbmVyLmNsaWVudEhlaWdodDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBsZXQgbW92ZVdpbmRvdyA9IChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gKGV2ZW50LmNsaWVudFggLSBwb3NYKSArIFwicHhcIjtcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUudG9wID0gKGV2ZW50LmNsaWVudFkgLSBwb3NZKSArIFwicHhcIjtcbiAgICAgICAgc2Nyb2xsRG93bigpO1xuICAgIH07XG5cbiAgICBsZXQgZ2V0UG9zaXRpb24gPSAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlXCIpKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0ID09PSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1pbmltaXplXCIpKSB7XG4gICAgICAgICAgICB0aGlzLm1pbmltaXplKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5kaXYgIT09IHRoaXMuZGl2LnBhcmVudE5vZGUubGFzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICAgICAgdGhpcy5kaXYucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLmRpdik7XG4gICAgICAgIH1cblxuICAgICAgICBwb3NYID0gZXZlbnQuY2xpZW50WCAtIHRoaXMuZGl2Lm9mZnNldExlZnQ7XG4gICAgICAgIHBvc1kgPSBldmVudC5jbGllbnRZIC0gdGhpcy5kaXYub2Zmc2V0VG9wO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlV2luZG93KTtcbiAgICAgICAgc2Nyb2xsRG93bigpO1xuICAgIH07XG5cbiAgICB0aGlzLmRpdi5maXJzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGdldFBvc2l0aW9uKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVXaW5kb3cpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBNaW5pbWl6ZXMgd2luZG93LCBvciBtYXhpbWl6ZXMgaWYgY2xpY2tlZCBvbiB0aGUgcmVmZXJlbmNlLlxuICovXG5EZXNrdG9wV2luZG93LnByb3RvdHlwZS5taW5pbWl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZGl2LnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuXG4gICAgbGV0IGFUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICBhVGFnLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCIjXCIpO1xuXG4gICAgbGV0IGFkZFdpbmRvdyA9IChpY29uTWVudSwgYXBwKSA9PiB7XG4gICAgICAgIGljb25NZW51LmFwcGVuZENoaWxkKGFUYWcpO1xuICAgICAgICBpY29uTWVudS5jbGFzc0xpc3QuYWRkKFwibWluaW1pemVkXCIpO1xuICAgICAgICBpY29uTWVudS5sYXN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gYXBwICsgXCIgXCIgKyAodGhpcy5pZC5zbGljZSgxKSk7XG5cbiAgICAgICAgaWNvbk1lbnUubGFzdEVsZW1lbnRDaGlsZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgICAgaWNvbk1lbnUucmVtb3ZlQ2hpbGQoZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICAgICAgaWYgKCFpY29uTWVudS5maXJzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICAgICAgICAgIGljb25NZW51LmNsYXNzTGlzdC5yZW1vdmUoXCJtaW5pbWl6ZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBsZXQgaWNvbk1lbnVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIm5hdiAuaWNvbi1tZW51XCIpO1xuICAgIHN3aXRjaCAodGhpcy5pZC5zbGljZSgwLCAxKSkge1xuICAgICAgICBjYXNlIFwiY1wiOlxuICAgICAgICAgICAgYWRkV2luZG93KGljb25NZW51c1swXSwgXCJDaGF0XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJtXCI6XG4gICAgICAgICAgICBhZGRXaW5kb3coaWNvbk1lbnVzWzFdLCBcIk1lbW9yeVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiclwiOlxuICAgICAgICAgICAgYWRkV2luZG93KGljb25NZW51c1syXSwgXCJSZW1lbWJlclwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiaVwiOlxuICAgICAgICAgICAgYWRkV2luZG93KGljb25NZW51c1szXSwgXCJJbmZvXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufTtcblxuLyoqXG4gKiBDbG9zZXMgdGhlIHdpbmRvdy5cbiAqL1xuRGVza3RvcFdpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmRpdi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZGl2KTtcblxuICAgIGlmICh0aGlzLnNvY2tldCkge1xuICAgICAgICB0aGlzLnNvY2tldC5jbG9zZSgpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7RGVza3RvcFdpbmRvd31cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBEZXNrdG9wV2luZG93O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIE1lbW9yeS5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERlc2t0b3BXaW5kb3cgPSByZXF1aXJlKFwiLi9EZXNrdG9wV2luZG93XCIpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYSBNZW1vcnkgZ2FtZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgd2luZG93LlxuICovXG5mdW5jdGlvbiBNZW1vcnkoaWQpIHtcbiAgICBEZXNrdG9wV2luZG93LmNhbGwodGhpcywgaWQpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNpemUgb2YgdGhlIGJvYXJkIGluIG51bWJlciBvZiBicmlja3MsIGRlZmF1bHRzIHRvIDE2LlxuICAgICAqL1xuICAgIHRoaXMuc2l6ZSA9IDE2O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGFycmF5IHRvIGNvbnRhaW4gdGhlIGJyaWNrIGltYWdlcy5cbiAgICAgKi9cbiAgICB0aGlzLmltYWdlcyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGZpcnN0IHR1cm5lZCBicmljay5cbiAgICAgKi9cbiAgICB0aGlzLnR1cm4xID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzZWNvbmQgdHVybmVkIGJyaWNrLlxuICAgICAqL1xuICAgIHRoaXMudHVybjIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBwYWlycy5cbiAgICAgKi9cbiAgICB0aGlzLnBhaXJzID0gMDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBudW1iZXIgb2YgY2xpY2tzL3RyaWVzLlxuICAgICAqL1xuICAgIHRoaXMubnJPZkNsaWNrcyA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBTdGFydHMgdGhlIE1lbW9yeSBnYW1lLlxuICAgICAqL1xuICAgIHRoaXMuc3RhcnQoKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGVza3RvcFdpbmRvdy5wcm90b3R5cGUpO1xuTWVtb3J5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1lbW9yeTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGdhbWUgYW5kIGFkZHMgZXZlbnQgbGlzdGVuZXJzLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaHVmZmxlKCk7XG4gICAgdGhpcy5zZXRCb2FyZCgpO1xuICAgIHRoaXMuc2V0TWVudSgpO1xuXG4gICAgdGhpcy5kcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMucmVzdGFydCgpO1xuICAgIH0pO1xuXG4gICAgbGV0IGxpbmtzID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXS5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duIGFcIik7XG4gICAgbGlua3MuZm9yRWFjaCgoY3VycmVudCkgPT4ge1xuICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LnRhcmdldC50ZXh0Q29udGVudCkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCIzeDJcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gNjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIjR4M1wiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSAxMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIjR4NFwiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSAxNjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucmVzdGFydCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogU2V0cyBlbGVtZW50cyBmb3IgdGhlIGRyb3AtZG93biBtZW51IHRvIGFsbG93IGNoYW5naW5nIHNpemUgb2YgdGhlIGJvYXJkLlxuICovXG5NZW1vcnkucHJvdG90eXBlLnNldE1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubWVudWxpbmtcIik7XG4gICAgbGV0IG1lbnVDbG9uZSA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgIGVsZW1lbnQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChtZW51Q2xvbmUpO1xuXG4gICAgbGV0IG5ld0xpbmsgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzFdO1xuICAgIG5ld0xpbmsuZmlyc3RFbGVtZW50Q2hpbGQudGV4dENvbnRlbnQgPSBcIlNpemVcIjtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjsgaSArPSAxKSB7XG4gICAgICAgIGxldCBkcm9wZG93bkNsb25lID0gbmV3TGluay5xdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duIGFcIikuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBuZXdMaW5rLmxhc3RFbGVtZW50Q2hpbGQuYXBwZW5kQ2hpbGQoZHJvcGRvd25DbG9uZSk7XG4gICAgfVxuXG4gICAgbGV0IGRyb3Bkb3duTGlua3MgPSBuZXdMaW5rLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKTtcbiAgICBkcm9wZG93bkxpbmtzWzBdLnRleHRDb250ZW50ID0gXCIzeDJcIjtcbiAgICBkcm9wZG93bkxpbmtzWzFdLnRleHRDb250ZW50ID0gXCI0eDNcIjtcbiAgICBkcm9wZG93bkxpbmtzWzJdLnRleHRDb250ZW50ID0gXCI0eDRcIjtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgc2l6ZSBvZiB0aGUgYm9hcmQgYW5kIHRoZSBib2FyZCBlbGVtZW50cy5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5zZXRCb2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCB0ZW1wbGF0ZURpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5XCIpLmNvbnRlbnQ7XG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQsIGZhbHNlKTtcbiAgICBsZXQgcmVzdWx0RWxlbSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYubGFzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKHRoaXMuc2l6ZSkge1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImJvYXJkNlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJib2FyZDEyXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZChcImJvYXJkMTZcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBsZXQgYTtcbiAgICB0aGlzLmltYWdlcy5mb3JFYWNoKChpbWFnZSwgaW5kZXgpID0+IHtcbiAgICAgICAgYSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgICAgICBhLmZpcnN0RWxlbWVudENoaWxkLnNldEF0dHJpYnV0ZShcImRhdGEtYnJpY2tOclwiLCBpbmRleCk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgIH0pO1xuXG4gICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBsZXQgaW1nO1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUgPT09IFwiQVwiKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgICAgICAgICAgaW1nID0gZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0LnRhZ05hbWUgPT09IFwiSU1HXCIpIHtcbiAgICAgICAgICAgIGltZyA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbWcpIHtcbiAgICAgICAgICAgIGxldCBpID0gcGFyc2VJbnQoaW1nLmdldEF0dHJpYnV0ZShcImRhdGEtYnJpY2tOclwiKSk7XG4gICAgICAgICAgICB0aGlzLnR1cm5Ccmljayh0aGlzLmltYWdlc1tpXSwgaW1nKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFwcGVuZENoaWxkKGRpdik7XG4gICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmFwcGVuZENoaWxkKHJlc3VsdEVsZW0pO1xufTtcblxuLyoqXG4gKiBTaHVmZmxlcyB0aGUgYXJyYXkgd2l0aCBpbWFnZXMuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuc2h1ZmZsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW1hZ2VzID0gWzEsMSwyLDIsMywzLDQsNCw1LDUsNiw2LDcsNyw4LDhdO1xuXG4gICAgbGV0IGluZGV4VG9Td2FwO1xuICAgIGxldCB0ZW1wSW1nO1xuICAgIGxldCBpbWdzO1xuXG4gICAgc3dpdGNoICh0aGlzLnNpemUpIHtcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgaW1ncyA9IHRoaXMuaW1hZ2VzLnNsaWNlKDAsIDYpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBpbWdzID0gdGhpcy5pbWFnZXMuc2xpY2UoMCwgMTIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICBpbWdzID0gdGhpcy5pbWFnZXM7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IHRoaXMuc2l6ZSAtIDE7IGkgPiAwOyBpIC09IDEpIHtcbiAgICAgICAgaW5kZXhUb1N3YXAgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKTtcbiAgICAgICAgdGVtcEltZyA9IGltZ3NbaV07XG4gICAgICAgIGltZ3NbaV0gPSBpbWdzW2luZGV4VG9Td2FwXTtcbiAgICAgICAgaW1nc1tpbmRleFRvU3dhcF0gPSB0ZW1wSW1nO1xuICAgIH1cblxuICAgIHRoaXMuaW1hZ2VzID0gaW1ncztcbn07XG5cbi8qKlxuICogSGFuZGxlcyB0aGUgZXZlbnQgb2YgdHVybmluZyBhIGJyaWNrLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBicmlja0ltZyAtIFRoZSBpbWFnZSBvZiB0aGUgdHVybmVkIGJyaWNrLlxuICogQHBhcmFtIHtFbGVtZW50fSBpbWdFbGVtIC0gVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgYnJpY2suXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUudHVybkJyaWNrID0gZnVuY3Rpb24oYnJpY2tJbWcsIGltZ0VsZW0pIHtcbiAgICBpZiAodGhpcy50dXJuMikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaW1nRWxlbS5zcmMgPSBcIi9pbWFnZS9tZW1vcnkvXCIgKyBicmlja0ltZyArIFwiLnBuZ1wiO1xuXG4gICAgaWYgKCF0aGlzLnR1cm4xKSB7XG4gICAgICAgIHRoaXMudHVybjEgPSBpbWdFbGVtO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpbWdFbGVtID09PSB0aGlzLnR1cm4xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5yT2ZDbGlja3MgKz0gMTtcbiAgICAgICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi50cmllc1wiKS50ZXh0Q29udGVudCA9IHRoaXMubnJPZkNsaWNrcy50b1N0cmluZygpO1xuXG4gICAgICAgIHRoaXMudHVybjIgPSBpbWdFbGVtO1xuICAgICAgICBpZiAodGhpcy50dXJuMS5zcmMgPT09IHRoaXMudHVybjIuc3JjKSB7XG4gICAgICAgICAgICB0aGlzLnBhaXJzICs9IDE7XG4gICAgICAgICAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLnBhaXJzXCIpLnRleHRDb250ZW50ID0gdGhpcy5wYWlycy50b1N0cmluZygpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYWlycyA9PT0gdGhpcy5zaXplIC8gMikge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5kR2FtZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4xLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcImVtcHR5XCIpO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwiZW1wdHlcIik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgIH0sIDQwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4xLnNyYyA9IFwiL2ltYWdlL21lbW9yeS8wLnBuZ1wiO1xuICAgICAgICAgICAgICAgIHRoaXMudHVybjIuc3JjID0gXCIvaW1hZ2UvbWVtb3J5LzAucG5nXCI7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEVuZHMgdGhlIGdhbWUgYW5kIGRpc3BsYXlzIG1lc3NhZ2UuXG4gKi9cbk1lbW9yeS5wcm90b3R5cGUuZW5kR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBtZXNzYWdlID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlXCIpO1xuXG4gICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFwiWW91IGZpbmlzaGVkIHRoZSBnYW1lIVwiO1xufTtcblxuLyoqXG4gKiBSZXN0YXJ0cyBhbmQgY2xlYXJzIHRoZSBNZW1vcnkgZ2FtZS5cbiAqL1xuTWVtb3J5LnByb3RvdHlwZS5yZXN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcbiAgICB3aGlsZSAoY29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICB0aGlzLnBhaXJzID0gMDtcbiAgICB0aGlzLm5yT2ZDbGlja3MgPSAwO1xuICAgIHRoaXMuc2h1ZmZsZSgpO1xuICAgIHRoaXMuc2V0Qm9hcmQoKTtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7TWVtb3J5fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeTtcbiIsIi8qKlxuICogTW9kdWxlIGZvciBSZW1lbWJlciBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERlc2t0b3BXaW5kb3cgPSByZXF1aXJlKFwiLi9EZXNrdG9wV2luZG93XCIpO1xuY29uc3Qgc3RvcmFnZSA9IHJlcXVpcmUoXCIuL2xvY2Fsc3RvcmFnZVwiKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFJlbWVtYmVyLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSB3aW5kb3cuXG4gKi9cbmZ1bmN0aW9uIFJlbWVtYmVyKGlkKSB7XG4gICAgRGVza3RvcFdpbmRvdy5jYWxsKHRoaXMsIGlkKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBhcnJheSB0byBob2xkIHRoZSBub3Rlcy5cbiAgICAgKi9cbiAgICB0aGlzLm5vdGVzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IG5vdGUuXG4gICAgICovXG4gICAgdGhpcy5uZXcoKTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIGluaGVyaXRhbmNlIGZyb20gRGVza3RvcFdpbmRvdy5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNrdG9wV2luZG93LnByb3RvdHlwZSk7XG5SZW1lbWJlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZW1lbWJlcjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG5vdGUuXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBub3RGaXJzdCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjcmVhdGVkIG5vdGUgaXMgdGhlIGZpcnN0IG9mIGFsbCBvciBub3QuXG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZS5uZXcgPSBmdW5jdGlvbihub3RGaXJzdCkge1xuICAgIGxldCBjb250YWluZXIgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG4gICAgaWYgKG5vdEZpcnN0KSB7XG4gICAgICAgIHRoaXMuY2xlYXIoY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5ub3RlcyA9IFtdO1xuICAgIH1cblxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVtZW1iZXJcIikuY29udGVudDtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuICAgIGxldCBpbnB1dCA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubm90ZS1pbnB1dFwiKTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIGlmICghaW5wdXQudmFsdWUpIHtcbiAgICAgICAgICAgIGlucHV0LmNsYXNzTGlzdC5hZGQoXCJyZWRiZ1wiKTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiWW91IG5lZWQgdG8gd3JpdGUgYW4gaXRlbSBmb3IgdGhlIGxpc3QuXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dC5jbGFzc0xpc3QucmVtb3ZlKFwicmVkYmdcIik7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgdGhpcy5hZGQoaW5wdXQudmFsdWUpO1xuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIW5vdEZpcnN0KSB7XG4gICAgICAgIHRoaXMuc2V0TWVudSgpO1xuICAgICAgICBpZiAoc3RvcmFnZS5nZXQoXCJub3Rlc1wiKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zYXZlZCh0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJvcGRvd24udGV4dENvbnRlbnQgPSBcIlNhdmVcIjtcbiAgICAgICAgdGhpcy5kcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubm90ZSBwXCIpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmVkKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9IFwiTm90ZSBpcyBlbXB0eS5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBkaWZmZXJlbnQgZHJvcGRvd24gbWVudXMgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLnNldE1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgc3ViTWVudSA9IHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudWxpbmtcIilbMF07XG4gICAgbGV0IG1lbnVDbG9uZSA9IHN1Yk1lbnUuY2xvbmVOb2RlKHRydWUpO1xuICAgIHN1Yk1lbnUucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChtZW51Q2xvbmUpO1xuXG4gICAgbGV0IG5ld1N1Yk1lbnUgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzFdO1xuICAgIGxldCBub3RlTGlzdCA9IG5ld1N1Yk1lbnUubGFzdEVsZW1lbnRDaGlsZDtcbiAgICBuZXdTdWJNZW51LmZpcnN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gXCJOb3Rlc1wiO1xuICAgIG5vdGVMaXN0LnJlbW92ZUNoaWxkKG5ld1N1Yk1lbnUucXVlcnlTZWxlY3RvcihcIi5kcm9wZG93biBhXCIpKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjsgaSArPSAxKSB7XG4gICAgICAgIGxldCBkcm9wZG93bkNsb25lID0gc3ViTWVudS5xdWVyeVNlbGVjdG9yKFwiLmRyb3Bkb3duIGFcIikuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzdWJNZW51Lmxhc3RFbGVtZW50Q2hpbGQuYXBwZW5kQ2hpbGQoZHJvcGRvd25DbG9uZSk7XG4gICAgfVxuXG4gICAgbGV0IGRyb3Bkb3duTGlua3MgPSBzdWJNZW51LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJvcGRvd24gYVwiKTtcbiAgICBkcm9wZG93bkxpbmtzWzFdLnRleHRDb250ZW50ID0gXCJOZXdcIjtcbiAgICBkcm9wZG93bkxpbmtzWzJdLnRleHRDb250ZW50ID0gXCJEZWxldGUgQWxsXCI7XG5cbiAgICBkcm9wZG93bkxpbmtzWzFdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5uZXcodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBkcm9wZG93bkxpbmtzWzJdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJub3Rlc1wiKTtcbiAgICAgICAgdGhpcy5jbGVhcihub3RlTGlzdCk7XG4gICAgICAgIHRoaXMubmV3KHRydWUpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBBZGRzIGlucHV0IHRvIHRoZSBub3RlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCAtIFVzZXIgaW5wdXQgZnJvbSBlbGVtZW50LlxuICovXG5SZW1lbWJlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICBsZXQgbm90ZUVsZW0gPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm5vdGUgcFwiKVswXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgbm90ZUVsZW0udGV4dENvbnRlbnQgPSBpbnB1dDtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5vdGVcIikuYXBwZW5kQ2hpbGQobm90ZUVsZW0pO1xuXG4gICAgdGhpcy5ub3Rlcy5wdXNoKGlucHV0KTtcbn07XG5cbi8qKlxuICogU2F2ZXMgY3VycmVudCBub3RlIHRvIGxvY2FsIHN0b3JhZ2UgYW5kIGFkZHMgdG8gc3VibWVudSwgb3IgZ2V0cyBvbGQgbm90ZXMuXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBvbGROb3RlcyAtIFdoZXRoZXIgb3Igbm90IHRoZXJlIGFyZSBvbGQgbm90ZXMgaW4gbG9jYWwgc3RvcmFnZS5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLnNhdmVkID0gZnVuY3Rpb24ob2xkTm90ZXMpIHtcbiAgICBsZXQgbmV3U3ViTWVudTtcbiAgICBsZXQgZHJvcGRvd25MaW5rO1xuXG4gICAgbGV0IGFkZE1lbnVOb3RlID0gKCkgPT4ge1xuICAgICAgICBuZXdTdWJNZW51ID0gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbChcIi5tZW51bGlua1wiKVsxXTtcbiAgICAgICAgbGV0IGRyb3Bkb3duQ2xvbmUgPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnVsaW5rXCIpWzBdLnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd24gYVwiKS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5ld1N1Yk1lbnUubGFzdEVsZW1lbnRDaGlsZC5hcHBlbmRDaGlsZChkcm9wZG93bkNsb25lKTtcblxuICAgICAgICBkcm9wZG93bkxpbmsgPSBuZXdTdWJNZW51LnF1ZXJ5U2VsZWN0b3IoXCIuZHJvcGRvd25cIikubGFzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgZHJvcGRvd25MaW5rLnRleHRDb250ZW50ID0gXCJOb3RlIFwiICsgKG5ld1N1Yk1lbnUucXVlcnlTZWxlY3RvckFsbChcIi5kcm9wZG93biBhXCIpLmxlbmd0aCk7XG5cbiAgICAgICAgZHJvcGRvd25MaW5rLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsZXQgbnIgPSBldmVudC50YXJnZXQudGV4dENvbnRlbnQuc2xpY2UoNSk7XG4gICAgICAgICAgICB0aGlzLmdldChucik7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBsZXQgbm90ZXMgPSAoc3RvcmFnZS5nZXQoXCJub3Rlc1wiKSA9PT0gbnVsbCkgPyAwIDogc3RvcmFnZS5nZXQoXCJub3Rlc1wiKS5ub3RlcztcbiAgICBpZiAob2xkTm90ZXMpIHtcbiAgICAgICAgbm90ZXMuZm9yRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhZGRNZW51Tm90ZSgpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobm90ZXMgPT09IDAgfHwgbm90ZXMubGVuZ3RoIDw9IDQpIHtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KFwibm90ZXNcIiwgdGhpcy5ub3Rlcyk7XG4gICAgICAgICAgICBhZGRNZW51Tm90ZSgpO1xuICAgICAgICAgICAgdGhpcy5uZXcodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIllvdSBhbHJlYWR5IGhhdmUgNSBzYXZlZCBub3Rlcy5cIjtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogR2V0cyB0aGUgaXRlbSB0aGF0IHdhcyBjbGlja2VkIG9uIGZyb20gbGlzdC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbnIgLSBUaGUgbnVtYmVyIG9mIHRoZSBjbGlja2VkIGl0ZW0gaW4gbG9jYWwgc3RvcmFnZSBhcnJheS5cbiAqL1xuUmVtZW1iZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5yKSB7XG4gICAgbGV0IG5vdGVzID0gc3RvcmFnZS5nZXQoXCJub3Rlc1wiKS5ub3RlcztcbiAgICBsZXQgbm90ZUNvbnRlbnQgPSBub3Rlc1sobnIgLSAxKV07XG5cbiAgICB0aGlzLmNsZWFyKHRoaXMuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIubm90ZVwiKSk7XG5cbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JlbWVtYmVyXCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yKFwiLm5vdGVcIikuYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gICAgdGhpcy5ub3RlcyA9IG5vdGVDb250ZW50O1xuXG4gICAgbm90ZUNvbnRlbnQuZm9yRWFjaCgoY3VycmVudCkgPT4ge1xuICAgICAgICBsZXQgbm90ZUVsZW0gPSB0aGlzLmRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiLm5vdGUgcFwiKVswXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIG5vdGVFbGVtLnRleHRDb250ZW50ID0gY3VycmVudDtcbiAgICAgICAgdGhpcy5kaXYucXVlcnlTZWxlY3RvcihcIi5ub3RlXCIpLmFwcGVuZENoaWxkKG5vdGVFbGVtKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ2xlYXJzIHRoZSBnaXZlbiBjb250YWluZXIgb2YgaXRzIGNvbnRlbnQuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIgLSBUaGUgY29udGFpbmVyIHRvIGJlIGNsZWFyZWQuXG4gKi9cblJlbWVtYmVyLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqXG4gKiBAdHlwZSB7UmVtZW1iZXJ9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gUmVtZW1iZXI7XG4iLCIvKipcbiAqIFN0YXJ0IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4xXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogSW5pdGlhdGVzIGRlc2t0b3AgYXBwbGljYXRpb24uXG4gKi9cbmNvbnN0IGRlc2t0b3AgPSByZXF1aXJlKFwiLi9kZXNrdG9wXCIpO1xuZGVza3RvcC5pbml0KCk7XG5cbi8qKlxuICogUmVnaXN0ZXJzIHNlcnZpY2Ugd29ya2VyLlxuICovXG5pZiAoXCJzZXJ2aWNlV29ya2VyXCIgaW4gbmF2aWdhdG9yKSB7XG4gICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoXCIuL3dvcmtlci5qc1wiLCB7IHNjb3BlOiBcIi4vXCJ9KS50aGVuKChyZWdpc3RyYXRpb24pID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTZXJ2aWNlIHdvcmtlciByZWdpc3RlcmVkLlwiLCByZWdpc3RyYXRpb24pO1xuICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlNlcnZpY2Ugd29ya2VyIGZhaWxlZCB0byByZWdpc3Rlci5cIiwgZXJyb3IpO1xuICAgIH0pO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIGRlc2t0b3AuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERlc2t0b3BXaW5kb3cgPSByZXF1aXJlKFwiLi9EZXNrdG9wV2luZG93XCIpO1xuY29uc3QgQ2hhdCA9IHJlcXVpcmUoXCIuL0NoYXRcIik7XG5jb25zdCBNZW1vcnkgPSByZXF1aXJlKFwiLi9NZW1vcnlcIik7XG5jb25zdCBSZW1lbWJlciA9IHJlcXVpcmUoXCIuL1JlbWVtYmVyXCIpO1xuXG4vKipcbiAqIEdldHMgdGhlIGN1cnJlbnQgdGltZSBhbmQgcHJlc2VudHMgaXQgaW4gdGhlIGdpdmVuIGNvbnRhaW5lci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciAtIFRoZSBjb250YWluZXIgb2YgdGhlIGNsb2NrLlxuICovXG5mdW5jdGlvbiBkZXNrdG9wQ2xvY2soY29udGFpbmVyKSB7XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjbG9ja1wiKTtcbiAgICB9XG5cbiAgICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCBob3VycyA9IHRvZGF5LmdldEhvdXJzKCk7XG4gICAgbGV0IG1pbnMgPSB0b2RheS5nZXRNaW51dGVzKCk7XG5cbiAgICBpZiAobWlucyA8IDEwKSB7XG4gICAgICAgIG1pbnMgPSBcIjBcIiArIG1pbnM7XG4gICAgfVxuXG4gICAgaWYgKGhvdXJzIDwgMTApIHtcbiAgICAgICAgaG91cnMgPSBcIjBcIiArIGhvdXJzO1xuICAgIH1cblxuICAgIGNvbnRhaW5lci50ZXh0Q29udGVudCA9IGhvdXJzICsgXCI6XCIgKyBtaW5zO1xufVxuXG4vKipcbiAqIEdldHMgdG9kYXkncyBkYXRlIGFuZCBwcmVzZW50cyBpdCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIC0gVGhlIGNvbnRhaW5lciBvZiB0aGUgY2xvY2suXG4gKi9cbmZ1bmN0aW9uIGdldERhdGUoY29udGFpbmVyKSB7XG4gICAgbGV0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBsZXQgbW9udGggPSBbXCJqYW5cIiwgXCJmZWJcIiwgXCJtYXJcIiwgXCJhcHJcIiwgXCJtYXlcIiwgXCJqdW5lXCIsIFwianVseVwiLCBcImF1Z1wiLCBcInNlcHRcIiwgXCJvY3RcIiwgXCJub3ZcIiwgXCJkZWNcIl07XG4gICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gdG9kYXkuZ2V0RGF0ZSgpICsgXCIgXCIgKyBtb250aFt0b2RheS5nZXRNb250aCgpXSArIFwiIFwiICsgdG9kYXkuZ2V0RnVsbFllYXIoKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBhcHBsaWNhdGlvbiBpbmZvcm1hdGlvbiBmb3IgaW5mbyB3aW5kb3cuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBUaGUgZWxlbWVudCB0byBkaXNwbGF5IHRoZSBpbmZvcm1hdGlvbiBpbi5cbiAqL1xuZnVuY3Rpb24gaW5mbyhlbGVtZW50KSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNpbmZvXCIpLmNvbnRlbnQ7XG4gICAgbGV0IGNvbnRhaW5lciA9IGVsZW1lbnQuZGl2LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLCB0cnVlKSk7XG4gICAgbGV0IHN1Yk1lbnUgPSBlbGVtZW50LmRpdi5xdWVyeVNlbGVjdG9yKFwiLm1lbnVcIik7XG4gICAgc3ViTWVudS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN1Yk1lbnUpO1xufVxuXG4vKipcbiAqIEluaXRpYXRlcyBkZXNrdG9wIGJ5IGFkZGluZyBuZWNlc3NhcnkgZXZlbnQgbGlzdGVuZXJzIHRvIG9wZW4gd2luZG93cyBhbmQgZ2V0dGluZyB0aW1lIGFuZCBkYXRlLlxuICovXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIGxldCBuZXdXaW5kb3c7XG4gICAgbGV0IG51bWJlcnMgPSBbMSwgMSwgMSwgMV07XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIm5hdiAuaWNvbnNcIikuZm9yRWFjaCgoY3VycmVudCwgaW5kZXgpID0+IHtcbiAgICAgICAgc3dpdGNoIChpbmRleCl7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdyA9IG5ldyBDaGF0KFwiY1wiICsgbnVtYmVyc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5uYW1lLnRleHRDb250ZW50ID0gXCJDaGF0XCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL2NoYXQucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIG51bWJlcnNbMF0gKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgTWVtb3J5KFwibVwiICsgbnVtYmVyc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgIG51bWJlcnNbMV0gKz0gMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdXaW5kb3cgPSBuZXcgUmVtZW1iZXIoXCJyXCIgKyBudW1iZXJzWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lm5hbWUudGV4dENvbnRlbnQgPSBcIlJlbWVtYmVyXCI7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdy5pY29uLnNyYyA9IFwiL2ltYWdlL25vdGVzLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICBudW1iZXJzWzJdICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93ID0gbmV3IERlc2t0b3BXaW5kb3coXCJpXCIgKyBudW1iZXJzWzNdKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lm5hbWUudGV4dENvbnRlbnQgPSBcIkFwcGxpY2F0aW9uIGluZm9cIjtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2luZG93Lmljb24uc3JjID0gXCIvaW1hZ2UvaW5mby5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgaW5mbyhuZXdXaW5kb3cpO1xuICAgICAgICAgICAgICAgICAgICBudW1iZXJzWzNdICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZ2V0RGF0ZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RhdGVcIikpO1xuICAgIGRlc2t0b3BDbG9jayhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Nsb2NrXCIpKTtcbiAgICBzZXRJbnRlcnZhbChkZXNrdG9wQ2xvY2ssIDUwMDApO1xufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgZ2V0Q2xvY2s6IGRlc2t0b3BDbG9jayxcbiAgICBnZXREYXRlOiBnZXREYXRlLFxuICAgIGdldEluZm86IGluZm9cbn07XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgaGFuZGxpbmcgbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAYXV0aG9yIG1oYW1tYXJzdGVkdFxuICogQHZlcnNpb24gMS4xNi4wXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogR2V0cyBhbiBpdGVtIGZyb20gbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpdGVtIHRvIGdldC5cbiAqIEByZXR1cm5zIGl0ZW0gLSBUaGUgcmVxdWVzdGVkIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZ2V0KG5hbWUpIHtcbiAgICBpZiAobmFtZSA9PT0gXCJub3Rlc1wiKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKG5hbWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFNldHMgYW4gaXRlbSBpbiBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpdGVtTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBpdGVtIHRvIHNldC5cbiAqIEBwYXJhbSBpdGVtIC0gVGhlIGl0ZW0uXG4gKi9cbmZ1bmN0aW9uIHNldChpdGVtTmFtZSwgaXRlbSkge1xuICAgIGlmIChpdGVtTmFtZSA9PT0gXCJub3Rlc1wiKSB7XG4gICAgICAgIGxldCBub3RlcyA9IChnZXQoaXRlbU5hbWUpKSA/IGdldChpdGVtTmFtZSkubm90ZXMgOiBbXTtcbiAgICAgICAgbm90ZXMucHVzaChpdGVtKTtcblxuICAgICAgICBsZXQgYWxsTm90ZXMgPSB7XG4gICAgICAgICAgICBub3Rlczogbm90ZXNcbiAgICAgICAgfTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShpdGVtTmFtZSwgSlNPTi5zdHJpbmdpZnkoYWxsTm90ZXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShpdGVtTmFtZSwgaXRlbSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4cG9ydHMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0OiBzZXQsXG4gICAgZ2V0OiBnZXRcbn07XG4iXX0=