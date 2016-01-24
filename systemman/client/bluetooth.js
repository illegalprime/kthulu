(function() {
    "use strict";

    Template.bluetoothctl.events({
        "click a.bt-restart": function(event, tmpl) {
            tmpl.is_working.set(true);
            Meteor.call("system_bluetooth_restart", function() {
                tmpl.is_working.set(false);
            });
        },
    });

    Template.bluetoothctl.helpers({
        is_working: function() {
            return Template.instance().is_working.get();
        },
    });

    Template.bluetoothctl.onCreated(function() {
        var tmpl = this;
        tmpl.is_working = new ReactiveVar(false);
    });
})();
