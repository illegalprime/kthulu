Package.describe({
    name: "deluge",
    version: "0.0.1",
});

Package.onUse(function(api) {
    api.versionsFrom("1.1.0.3");
    api.use([
        "underscore",
        "reactive-var",
        "http",
        "aldeed:http",
        "gb96:zlib"
    ]);
    api.addFiles("deluge.js", "server");
    api.export("Deluge", "server");
    api.export("DELUGE_ERR", "server");
});

Package.onTest(function(api) {
    api.use("tinytest");
    api.use("deluge");
    api.addFiles("deluge-tests.js");
});
