var SECRETS;

(function() {
    var Log = console;

    if (process.env.IGNORE_SECRETS) {
        Log.warn("ignoring all secrets...");
        SECRETS = {
            TVDB: "",
        };
    } else {
        SECRETS = JSON.parse(Assets.getText("secrets.json"));
    }
})();
