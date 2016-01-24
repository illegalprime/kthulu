(function() {
    "use strict";

    var exec = Meteor.wrapAsync(Npm.require("child_process").exec);

    Meteor.methods({
        system_bluetooth_restart: function() {
            exec("sudo systemctl restart bluetooth.service");
        },
    });
})();
