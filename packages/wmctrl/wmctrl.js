var exec = Meteor.wrapAsync(Npm.require("child_process").exec);

var actions = {
    focus: function(opts) {
        if (!_.isObject(opts) || !_.isString(opts.matches)) {
            throw new Meteor.Error("MUST_SPECIFY_MATCHING");
        }
        exec("wmctrl -a '" + opts.matches + "'");
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


Meteor.call("wmctrl", {
    focus: {
        matches: "Chrome",
    },
});
