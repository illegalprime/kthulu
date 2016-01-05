(function() {
    "use strict";
    var path = Npm.require("path");
    var Log = console;

    var DISPLAY = ":0";
    var XAUTHORITY = process.env.XAUTHORITY ||
        path.join("/home", process.env.USER, ".Xauthority");

    var exec;
    (function() {
        var npmExec = Meteor.wrapAsync(Npm.require("child_process").exec);
        exec = function(full_cmd) {
            var cmd = full_cmd.join(" ");
            Log.info("running ", cmd);
            return npmExec(cmd, {
                env: {
                    DISPLAY: DISPLAY,
                    XAUTHORITY: XAUTHORITY,
                },
            });
        };
    })();

    var optsToCmd = function(opts) {
        // We will delete options as they get used, so lets not mess up
        // someone else's object
        opts = _.clone(opts);
        var full_cmd = ["wmctrl"];
        var matcher;
        var matcher_flag;

        // Change matcher flag if focus is enabled
        if (_.isBoolean(opts.focus) && opts.focus) {
            matcher_flag = "-a";
        } else {
            matcher_flag = "-r";
        }
        delete opts.focus;

        // Find the matcher
        if (_.isString(opts.title)) {
            // match by title is default
            matcher = opts.title;
            delete opts.title;
        } else if (_.isString(opts.class)) {
            full_cmd.push("-x");
            matcher = opts.class;
            delete opts.class;
        }

        full_cmd.push(matcher_flag);
        full_cmd.push(matcher);

        // Change our on/off/toggle to wmctrl's on/off/toggle
        var toggleStateToArg = function(action, prop) {
            if (action === "on") {
                return "add," + prop;
            } else if (action === "off") {
                return "remove," + prop;
            } else if (action === "toggle") {
                return "toggle," + prop;
            } else {
                throw Meteor.Error("NO_SUCH_OPTION",
                    "must specify on, off, or toggle to '" + prop + "'");
            }
        };

        // If fullscreen is there then add it!
        if (_.isString(opts.fullscreen)) {
            full_cmd.push("-b");
            full_cmd.push(toggleStateToArg(opts.fullscreen, "fullscreen"));
            delete opts.fullscreen;
        }

        // If there are any unused options then this is an error
        if (_.keys(opts).length > 0) {
            throw new Meteor.Error("GIVEN_UNSUPPORED_OPTIONS");
        }
        return full_cmd;
    };

    var list_windows = function() {
        var result = exec(["wmctrl", "-l", "-p", "-x"]);
        var RE_LINE = /(\S+)\s+(\S+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S.+)/;
        var windows = [];
        _.each(result.toString().split("\n"), function(line) {
            var data = line.match(RE_LINE);
            if (data) {
                windows.push({
                    id: data[1],
                    pid: parseInt(data[3]),
                    class: data[4],
                    host: data[5],
                    title: data[6],
                });
            }
        });
        return windows;
    };

    Meteor.methods({
        kthulu_wmctrl: function(options) {
            if (options.list) {
                return list_windows();
            } else {
                exec(optsToCmd(options));
            }
        },
    });
})();
