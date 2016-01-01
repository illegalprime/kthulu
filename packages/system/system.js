(function() {
    var exec = Meteor.wrapAsync(Npm.require("child_process").exec);

    Meteor.methods({
        volume: function(value) {
            if (!value) {
                try {
                    var output = exec("amixer -D pulse sget Master");
                    return parseInt(output.match(/\[(\d+)%\]/)[1]);
                } catch (err) {
                    // TODO: Something better
                    return 0;
                }
            }
            exec("amixer -D pulse --quiet sset Master " + value + "%");
        }
    });
})();
