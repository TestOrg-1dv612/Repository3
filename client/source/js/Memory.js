/**
 * Module for Memory.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

"use strict";

const DesktopWindow = require("./Window");

/**
 * Creates an instance of a Memory game.
 *
 * @constructor
 */
function Memory() {
    DesktopWindow.call(this);
}

Memory.prototype = Object.create(DesktopWindow.prototype);
Memory.prototype.constructor = Memory;
