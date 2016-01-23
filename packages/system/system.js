(function() {
    "use strict";
    var exec = Meteor.wrapAsync(Npm.require("child_process").exec);
    var alsa = Npm.require("alsa-monitor");

    // System is a singleton collection
    var System = new Mongo.Collection("SystemState");
    if (System.find({}).count() === 0) {
        System.insert({
            volume: {},
        });
    }

    var update = {
        // Update and optionally additionally set volume
        volume: function(data) {
            if (_.isObject(data)) {
                var value = data.value;
                var mute = data.muted;
                // Set volume if available
                if (_.isNumber(value) && value >= 0 && value <= 100) {
                    exec("amixer -D pulse --quiet sset Master " + value + "%");
                }
                // Mute if applicable
                if (_.isBoolean(mute)) {
                    var arg = mute ? "on" : "off";
                    exec("amixer -D pulse --quiet sset Master " + arg);
                }
            }
            // Parse volume info and update
            var output = exec("amixer -D pulse sget Master");
            var parsed = output.match(/\[(\d+)%\]\s+\[([^\d]+)\]/);
            var volume = parseInt(parsed[1]);
            var muted = parsed[2] === "off";

            // Update the DB
            System.update({}, {
                $set: {
                    "volume.value": volume,
                    "volume.muted": muted,
                },
            }, {
                upsert: true,
            });
        },
        // Update everything
        all: function() {
            _.each(update, function(updater, name) {
                if (name !== "all") {
                    updater();
                }
            });
        },
    };

    // Update info on boot
    update.all();

    // Keep track of volume changes
    alsa.monitor(Meteor.bindEnvironment(function() {
        update.volume();
    }));

    Meteor.publish("SystemState", function() {
        return System.find({});
    });

    Meteor.methods({
        volume: function(value) {
            update.volume(value);
        }
    });
})();
