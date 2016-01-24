(function() {
    "use strict";

    var R_CLICK_TIMEOUT = 1000;
    var DRAG_TIMEOUT = 350;
    var ACCELERATION = 0.1;
    var SCROLL_SPEED = 0.5;
    var SCROLL_UPDATE_IVAL = 10;
    var SCROLL_DECEL = 0.0001;

    // TODO: complete simple keyboard control

    var velocity_to_scroll = function(vel) {
        return {
            speed: Math.log2(Math.abs(vel) + 1) * SCROLL_SPEED,
            dir: vel < 0 ? "down" : "up",
        };
    };

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
                tmpl.latest_press = Date.now();
            },
            "panend .touch-region": function(event, tmpl) {
                tmpl.last_pan = undefined;
                if (tmpl.dragging) {
                    tmpl.dragging = false;
                    tmpl.latest_press = NaN;
                    Meteor.call("remote_set_mouse_button", "left", "up");
                }
            },
            "panstart .touch-region": function(event, tmpl) {
                tmpl.cancel_press_timeout();
                tmpl.last_pan = event;
                if (Date.now() - tmpl.latest_press > DRAG_TIMEOUT) {
                    tmpl.dragging = true;
                    Meteor.call("remote_set_mouse_button", "left", "down");
                }
            },
            "panmove .touch-region": function(event, tmpl) {
                var dx = event.center.x - tmpl.last_pan.center.x;
                var dy = event.center.y - tmpl.last_pan.center.y;
                var x = dx * Math.abs(dx) * ACCELERATION;
                var y = dy * Math.abs(dy) * ACCELERATION;
                Meteor.call("remote_inc_mouse", x, y);
                tmpl.last_pan = event;
            },
            "panstart .scroll-region": function(event, tmpl) {
                if (tmpl.inertial_scroll) {
                     clearInterval(tmpl.inertial_scroll.interval);
                }
                tmpl.scroll_sum = 0.0;
            },
            "panmove .scroll-region": function(event, tmpl) {
                // we only care about vertical scrolling
                var vel = velocity_to_scroll(event.velocityY);
                tmpl.scroll_sum += vel.speed;
                if (event.velocityY === 0.0) {
                    if (tmpl.last_dir) {
                        vel.dir = tmpl.last_dir;
                    } else {
                        return;
                    }
                } else {
                    tmpl.last_dir = vel.dir;
                }
                if (tmpl.scroll_sum >= 1.0) {
                    var speed = Math.floor(tmpl.scroll_sum);
                    tmpl.scroll_sum -= speed;
                    Meteor.call("remote_scroll", speed, vel.dir);
                }
            },
            "panend .scroll-region": function(event, tmpl) {
                // Cleaning up
                tmpl.last_dir = undefined;

                // Inertial scrolling
                console.log("starting inertial scroll");
                tmpl.inertial_scroll = velocity_to_scroll(event.velocityY);
                tmpl.inertial_scroll += tmpl.scroll_sum;
                tmpl.inertial_scroll.count = 1;
                tmpl.inertial_scroll.interval = setInterval(function() {
                    console.log("inertial scroll", tmpl.inertial_scroll);
                    var count = tmpl.inertial_scroll.count;
                    tmpl.inertial_scroll.speed -= SCROLL_DECEL * count;
                    tmpl.inertial_scroll.count += 1;
                    var speed = tmpl.inertial_scroll.speed;
                    if (speed < 0) {
                        clearInterval(tmpl.inertial_scroll.interval);
                        return;
                    }
                    var dir = tmpl.inertial_scroll.dir;
                    Meteor.call("remote_scroll", speed, dir);
                }, SCROLL_UPDATE_IVAL);
            },
        },
    });

    var update_text = function(textbox, tmpl) {
        var text = textbox.value;
        var new_text = text.substr(tmpl.input_text_len - text.length);
        console.log(text, new_text);
        Meteor.call("remote_type_text", new_text);
        tmpl.input_text_len = text.length;
    };

    Template.remote.events({
        "keyup input.keyboard-input": function(event, tmpl) {
            update_text(event.currentTarget, tmpl);
        },
        "keydown input.keyboard-input": function(event, tmpl) {
            var prevent = function() {
                event.preventDefault();
                event.stopPropagation();
            };
            if (event.which === 8) {
                // Backspace
                prevent();
                event.currentTarget.value += "⌫";
                Meteor.call("remote_type_key", "backspace");
            } else if (event.which === 13) {
                // Return key
                prevent();
                event.currentTarget.value += "↩";
                Meteor.call("remote_type_key", "enter");
            }
        },
        "blur input.keyboard-input": function(event, tmpl) {
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
