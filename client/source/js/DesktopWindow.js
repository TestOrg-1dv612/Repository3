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
