(function() {
    "use strict";
    var kthulu_apps = {};
    var exec = Npm.require("child_process").exec;
    var Log = console;

    var Apps = new Mongo.Collection("Apps");

    Apps.remove({});
    Apps.insert({
        name: "netflix",
        cover: "/netflix.png",
        label: "Netflix",
        cmd: "google-chrome --app='http://www.netflix.com/browse'",
        timeout: 5000,
        filter: {
            class: "www.netflix.com__browse.google-chrome",
        },
        run_with: {
            focus: true,
            fullscreen: "on",
        },
    });
    Apps.insert({
        name: "steam",
        cover: "/steam.png",
        label: "Steam",
        cmd: "steam -bigpicture",
        filter: {
            class: "Steam",
        },
    });

    Meteor.publish("Apps", function() {
        return Apps.find({});
    });

    kthulu_apps.run = function(id) {
        // Find the app, we'll probably need all of it
        var app = Apps.findOne({
            _id: id,
        });
        // Only start it once
        if (!app) {
            throw new Meteor.Error("NO_SUCH_APP");
        } else if (app.working) {
            return;
        } else {
            // Don't call me again!
            Apps.update({
                _id: id,
            }, {
                $set: {
                    working: true,
                },
            });
        }
        // Start the app if its not running
        if (!kthulu_apps.find(app)) {
            exec(app.cmd);
            // Wait for a certain timeout if specified
            if (_.isNumber(app.timeout)) {
                var step = 500;
                var waiting = 0;
                do {
                    Meteor.sleep(step);
                    waiting += step;
                    if (waiting > app.timeout) {
                        Log.error("app start timed out", app.label);
                        throw new Meteor.Error("APP_START_TIMEOUT");
                    }
                } while (!kthulu_apps.find(app));
                Log.info("app started", app.name);
            }
        }
        if (app.run_with) {
            // Extract wmctrl options
            var winman = {};
            if (_.isBoolean(app.run_with.focus)) {
                winman.focus = app.run_with.focus;
            }
            if (_.isString(app.run_with.fullscreen)) {
                winman.fullscreen = app.run_with.fullscreen;
            }

            kthulu_apps.manage(app, winman);
        }
        // We are finished starting the app
        Apps.update({
            _id: id
        }, {
            $set: {
                working: false,
            },
        });
    };

    kthulu_apps.kill = function(app) {
        var descriptor = kthulu_apps.find(app);
        if (descriptor) {
            process.kill(descriptor.pid);
        }
    };

    kthulu_apps.find = function(app) {
        var matcher;
        var key;
        var windows = Meteor.call("kthulu_wmctrl", {
            list: true,
        });

        if (_.isString(app.filter.class)) {
            matcher = app.filter.class.toLowerCase();
            key = "class";
        } else if (_.isString(app.filter.title)) {
            matcher = app.filter.title.toLowerCase();
            key = "title";
        } else {
            throw new Meteor.Error("APP_MUST_PROVIDE_FILTER");
        }

        var found = _.find(windows, function(win) {
            return win[key].toLowerCase().indexOf(matcher) >= 0;
        });
        return found;
    };

    kthulu_apps.manage = function(app, opts) {
        var args = {};
        args = _.extend(args, app.filter);
        args = _.extend(args, opts);
        return Meteor.call("kthulu_wmctrl", args);
    };

    // Call kthulu_apps.run with Meteor.call("kthulu_apps_run")
    Meteor.methods(_.reduce(kthulu_apps, function(methods, method, name) {
        methods["kthulu_apps_" + name] = method;
        return methods;
    }, {}));
})();
