var status = (function() {
    var react = new ReactiveVar(0);
    var self = {
        IDLE: 0,
        WORKING: 1,
        get: function() {
            return react.get();
        },
        idle: function() {
            react.set(self.IDLE);
        },
        working: function() {
            react.set(self.WORKING);
        },
    };
    return self;
})();

Template.xboxdrv.events({
    "click .change-mode": function(event) {
        status.working();
        var mode = event.currentTarget.dataset.mode;
        Meteor.call("xboxdrv", [mode], function(err) {
            if (err) {
                console.error(err);
            }
            status.idle();
        });
    },
});

Template.xboxdrv.helpers({
    status: function() {
        if (status.get() === status.IDLE) {
            return "Ready!";
        } else if (status.get() === status.WORKING) {
            return "Working...";
        }
    },
});
