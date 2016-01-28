(function() {
    var Log = console;

    var DEFAULT_DISPLAY = ":0";
    var DEFAULT_DBUS_ADDR = "unix:path=/run/dbus/system_bus_socket";
    var SPOTIFY_ID = /[0-9a-zA-Z]{22}/;

    process.env.DISPLAY = process.env.DISPLAY || DEFAULT_DISPLAY;
    process.env.DBUS_SESSION_BUS_ADDRESS =
        process.env.DBUS_SESSION_BUS_ADDRESS || DEFAULT_DBUS_ADDR;

    var SpotifyApi = (function() {
        var exec = (function() {
            var npmExec = Meteor.wrapAsync(Npm.require("child_process").exec);
            return function(cmd) {
                Log.info("dbus call:", cmd);
                try {
                    var out = npmExec(cmd);
                    Log.info("dbus-reply", out);
                } catch (err) {
                    throw new Meteor.Error("NO_SPOTIFY");
                }
            };
        })();
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
            resume: "Play",
            pause: "Pause",
            next: "Next",
            previous: "Previous",
        };

        self.play = function(id) {
            if (!_.isString(id) || !id.match(SPOTIFY_ID)) {
                throw new Meteor.Error("INVALID_SPOTIFY_ID");
            }
            exec(prefix + methods.play + " " + id_to_dbus(id));
        };

        self.resume = exec.bind(undefined, prefix + methods.resume);
        self.pause = exec.bind(undefined, prefix + methods.pause);
        self.next = exec.bind(undefined, prefix + methods.next);
        self.previous = exec.bind(undefined, prefix + methods.previous);

        return self;
    })();

    Meteor.methods({
        spotify_play: SpotifyApi.play,
        spotify_resume: SpotifyApi.resume,
        spotify_pause: SpotifyApi.pause,
        spotify_next: SpotifyApi.next,
        spotify_previous: SpotifyApi.previous,
    });
})();
