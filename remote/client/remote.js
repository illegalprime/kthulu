(function() {
    "use strict";

    var R_CLICK_TIMEOUT = 500;
    var ACCELERATION = 0.1;

    // TODO: add scroll capability
    // TODO: add click and drag capability
    // TODO: complete simple keyboard control

    Template.remote.onCreated(function() {
        var tmpl = this;
        tmpl.press_timeout = null;
        tmpl.input_text_len = 0;
        tmpl.cancel_press_timeout = function() {
            if (tmpl.press_timeout !== null) {
                clearTimeout(tmpl.press_timeout);
                tmpl.press_timeout = null;
            }
        };
        // prevent mobile chrome's pull-down-to-scroll
        $("body").css("overflow", "hidden");
    });

    Template.remote.helpers({
        bar_config: {
            title: "Remote Control",
            float: true,
        },
        hammer_config: function() {
            return function(hammer) {
                hammer.get("pan").set({
                    direction: Hammer.DIRECTION_ALL,
                });
                hammer.get("press").set({
                    time: 0,
                });
                return hammer;
            };
        },
        gestures: {
            "tap .touch-region, pressup .touch-region": function(event, tmpl) {
                if (!tmpl.clicked) {
                    Meteor.call("remote_click_mouse_button", "left", false);
                    tmpl.cancel_press_timeout();
                }
            },
            "press .touch-region": function(event, tmpl) {
                tmpl.clicked = false;
                tmpl.press_timeout = setTimeout(function() {
                    Meteor.call("remote_click_mouse_button", "right", false);
                    tmpl.clicked = true;
                }, R_CLICK_TIMEOUT);
            },
            "panend .touch-region": function(event, tmpl) {
                tmpl.last_pan = undefined;
            },
            "pan .touch-region": function(event, tmpl) {
                tmpl.cancel_press_timeout();
                if (tmpl.last_pan) {
                    var dx = event.center.x - tmpl.last_pan.center.x;
                    var dy = event.center.y - tmpl.last_pan.center.y;
                    var x = dx * Math.abs(dx) * ACCELERATION;
                    var y = dy * Math.abs(dy) * ACCELERATION;
                    Meteor.call("remote_inc_mouse", x, y);
                }
                tmpl.last_pan = event;
            },
        },
    });

    var update_text = function(textbox, tmpl) {
        var text = textbox.value;
        var new_text = text.substr(tmpl.input_text_len - text.length);
        Meteor.call("remote_type_text", new_text);
        tmpl.input_text_len = text.length;
    };

    Template.remote.events({
        "keypress input.keyboard-input": function(event, tmpl) {
            update_text(event.currentTarget, tmpl);
        },
        "blur input.keyboard-input": function(event) {
            event.currentTarget.value = "";
            tmpl.input_text_len = 0;
        },
    });

    Template.remote.onRendered(function() {
        var tmpl = this;
        tmpl.$("input.keyboard-input").on("paste", function(event) {
            console.log(event);
        });
    });

    Template.remote.onDestroyed(function() {
        $("body").css("overflow", "");
    });
})();
