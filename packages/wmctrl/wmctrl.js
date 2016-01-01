(function() {
    "use strict";

    var exec = function(cmd) {
        return Meteor.wrapAsync(Npm.require("child_process").exec)(cmd, {
            env: {
                DISPLAY: ":0",
            },
        });
    };

    var actions = {
        focus: function(opts) {
            if (!_.isObject(opts)) {
                throw new Meteor.Error("MUST_SPECIFY_CONSTRAINTS");
            }
            if (_.isString(opts.title)) {
                exec("wmctrl -a '" + opts.title + "'");
            } else if (_.isString(opts.class)) {
                exec("wmctrl -x -a '" + opts.class + "'");
            } else {
                throw new Meteor.Error("NO_SUCH_WIN_SPECIFIER");
            }
        },
    };

    Meteor.methods({
        wmctrl: function(options) {
            _.each(options, function(args, method) {
                if (_.isFunction(actions[method])) {
                    actions[method](args);
                } else {
                    throw new Meteor.Error("NO_SUCH_METHOD", method);
                }
            });
        },
    });
})();
