/**
 * Module for desktop.
 */

"use strict";

const DesktopWindow = require("./Window");

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
                current.addEventListener("click", function() {
                    newWindow = new DesktopWindow("c" + cNr);
                    cNr += 1;
                });

                break;
            case 1:
                current.addEventListener("click", function() {
                    newWindow = new DesktopWindow("m" + mNr);
                    mNr += 1;
                });

                break;
            case 2:
                current.addEventListener("click", function() {
                    newWindow = new DesktopWindow("i" + iNr);
                    iNr += 1;
                });

                break;
        }
    });
}

/**
 * Exports.
 */
module.exports = {
    init: init
};
