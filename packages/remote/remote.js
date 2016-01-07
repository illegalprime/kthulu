(function() {
    "use strict";

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
        "remote_set_mouse_button": function(button, is_down) {
            robot.mouseToggle(is_down, button);
        },
        "remote_scroll": function(magnitude, direction) {
            robot.scrollMouse(magnitude, direction);
        },
        "remote_type_key": function(key, modifier) {
            robot.keyTap(key, modifier);
        },
        "remote_type_text": function(text) {
            robot.typeString(text);
        },
        "remote_set_key": function(key, is_down, modifier) {
            robot.keyToggle(key, is_down, modifier);
        },
    });
})();
