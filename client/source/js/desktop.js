/**
 * Module for desktop.
 */

"use strict";

const DesktopWindow = require("./Window");

/**
 * Gets the current time and presents it in the given container.
 *
 * @param {Element} container - The container of the clock.
 */
function desktopClock(container) {
    let today = new Date();
    let hours = today.getHours();
    let mins = today.getMinutes();

    if (mins < 10) {
        mins = "0" + mins;
    }

    container.textContent = hours + ":" + mins;
    setTimeout(desktopClock, 60000);
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
                    newWindow = new DesktopWindow("c" + cNr);
                    newWindow.name.textContent = "Chat";
                    newWindow.icon.src = "/image/chat.png";
                    cNr += 1;
                });

                break;
            case 1:
                current.addEventListener("click", function(event) {
                    event.preventDefault();
                    newWindow = new DesktopWindow("m" + mNr);
                    mNr += 1;
                });

                break;
            case 2:
                current.addEventListener("click", function(event) {
                    event.preventDefault();
                    newWindow = new DesktopWindow("i" + iNr);
                    newWindow.name.textContent = "Application info";
                    newWindow.icon.src = "/image/info.png";
                    iNr += 1;
                });

                break;
        }
    });

    getDate(document.querySelector("#date"));
    desktopClock(document.querySelector("#clock"));
}

/**
 * Exports.
 */
module.exports = {
    init: init,
    getClock: desktopClock,
    getDate: getDate
};
