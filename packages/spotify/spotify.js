(function() {
    var Log = console;

    var DEFAULT_DISPLAY = ":0";
    var DEFAULT_DBUS_ADDR = "unix:path=/run/dbus/system_bus_socket";

    process.env.DISPLAY = process.env.DISPLAY || DEFAULT_DISPLAY;
    process.env.DBUS_SESSION_BUS_ADDRESS =
        process.env.DBUS_SESSION_BUS_ADDRESS || DEFAULT_DBUS_ADDR;

    var SpotifyApi = (function() {
        var exec = Meteor.wrapAsync(Npm.require("child_process").exec);
        var self = this;
        var prefix = "dbus-send --print-reply " +
            "--dest=org.mpris.MediaPlayer2.spotify " +
            "/org/mpris/MediaPlayer2 " +
            "org.mpris.MediaPlayer2.Player.";

        var id_to_dbus = function(id) {
            return "string:spotify:track:" + id;
        };

        var methods = {
            play: "OpenUri",
        };

        self.play = function(id) {
            // TODO add verification
            var cmd = prefix + methods.play + " " + id_to_dbus(id);
            Log.info("dbus call:", cmd);

            var out = exec(cmd);
            Log.info("dbus-reply", out);
        };

        return self;
    })();

    Meteor.methods({
        spotify_play: function(id) {
            SpotifyApi.play(id);
        },
    });
})();
