(function() {
    var MODE_MOUSE = "sudo xboxdrv --silent --detach-kernel-driver --mouse";
    var MODE_XPAD = "sudo xboxdrv --silent --detach-kernel-driver --mimic-xpad-wireless";
    var KILL = "sudo pkill -SIGINT xboxdrv";

    var exec = Npm.require("child_process").exec;
    var Log = console;

    var teardown = function(done) {
        exec(KILL, function() {
            setTimeout(function() {
                done();
            }, 2000);
        });
    };

    var start = function(command, done) {
        teardown(function() {
            exec(command, function() {
                Log.info("xboxdrv closed", arguments);
            });
            done();
        });
    };

    var startSync = Meteor.wrapAsync(start);

    Meteor.methods({
        xboxdrv: function(mode) {
            mode = mode.toString();
            if (mode === "mouse") {
                startSync(MODE_MOUSE);
            } else if (mode === "xpad") {
                startSync(MODE_XPAD);
            } else {
                throw new Meteor.Error("NO_SUCH_MODE");
            }
        },
    });
})();
