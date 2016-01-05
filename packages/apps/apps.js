(function() {
    "use strict";
    var kthulu_apps = {};
    var exec = Npm.require("child_process").exec;
    var Log = console;

    kthulu_apps.run = function(app, opts) {
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
                Log.info("app started", app.label);
            }
        }
        if (opts) {
            // Extract wmctrl options
            var winman = {};
            if (_.isBoolean(opts.focus)) {
                winman.focus = opts.focus;
            }
            if (_.isString(opts.fullscreen)) {
                winman.fullscreen = opts.fullscreen;
            }

            kthulu_apps.manage(app, winman);
        }
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
