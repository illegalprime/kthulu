Template.system_manager.helpers({
    bar_config: function() {
        return {
            title: "System Manager",
        };
    },
});

var status = (function() {
    var react = new ReactiveVar(0);
    var self = {
        IDLE: 0,
        WORKING: 1,
        get: function() {
            return react.get();
        },
        set: function(state) {
            react.set(state);
        },
    };
    return self;
})();

Template.xboxdrv.events({
    "click .change-mode": function(event) {
        status.set(status.WORKING);
        var mode = event.currentTarget.dataset.mode;
        Meteor.call("xboxdrv", [mode], function(err) {
            if (err) {
                console.error(err);
            }
            status.set(status.IDLE);
        });
    },
});

Template.xboxdrv.helpers({
    is_working: function() {
        return status.get() !== status.IDLE;
    },
});
