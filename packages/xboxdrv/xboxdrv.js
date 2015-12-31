(function() {
    var MODE_MOUSE = "sudo xboxdrv --silent --detach-kernel-driver --mouse";
    var MODE_XPAD = "sudo xboxdrv --silent --detach-kernel-driver --mimic-xpad-wireless";

    var driver_proc;
    var killed = false;
    var exec = Npm.require("child_process").exec;

    var teardown = function(done) {
        if (driver_proc) {
            driver_proc.kill("SIGINT");
            setTimeout(function() {
                if (!killed) {
                    driver_proc.kill();
                }
                done();
            }, 2000);
        } else {
            done();
        }
    };

    var start = function(command, done) {
        teardown(function() {
            killed = false;
            driver_proc = exec(command, function() {
                console.log("xboxdrv closed", arguments);
                killed = true;
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
