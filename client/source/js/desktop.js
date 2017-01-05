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
                    newWindow.icon.src = "/image/chat.png";
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
                    newWindow.icon.src = "/image/notes.png";
                    numbers[2] += 1;
                });

                break;
            case 3:
                current.addEventListener("click", (event) => {
                    event.preventDefault();
                    newWindow = new DesktopWindow("i" + numbers[3]);
                    newWindow.name.textContent = "Application info";
                    newWindow.icon.src = "/image/info.png";
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
