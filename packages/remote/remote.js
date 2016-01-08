(function() {
    "use strict";

    // NOTE: No way to set the display except for this with robot.js
    process.env.DISPLAY = process.env.DISPLAY || ":0";

    var robot = Npm.require("robotjs");

    Meteor.methods({
        "remote_move_mouse": function(x, y) {
            robot.moveMouse(x, y);
        },
        "remote_move_mouse_smooth": function(x, y) {
            robot.moveMouseSmooth(x, y);
        },
        "remote_inc_mouse_smooth": function(x, y) {
            var pos = robot.getMousePos();
            robot.moveMouseSmooth(pos.x + x, pos.y + y);
        },
        "remote_inc_mouse": function(x, y) {
            var pos = robot.getMousePos();
            robot.moveMouse(pos.x + x, pos.y + y);
        },
        "remote_mouse_pos": function() {
            return robot.getMousePos();
        },
        "remote_click_mouse_button": function(button, is_double) {
            robot.mouseClick(button, is_double);
        },
        "remote_set_mouse_button": function(button, state) {
            robot.mouseToggle(state, button);
        },
        "remote_scroll": function(magnitude, direction) {
            robot.scrollMouse(magnitude, direction);
        },
        "remote_type_key": function(key, modifier) {
            if (modifier) {
                robot.keyTap(key, modifier);
            } else {
                robot.keyTap(key);
            }
        },
        "remote_type_text": function(text) {
            robot.typeString(text);
        },
        "remote_set_key": function(key, is_down, modifier) {
            robot.keyToggle(key, is_down, modifier);
        },
    });
})();
