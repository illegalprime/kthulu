Package.describe({
    name: "kthulu:system",
    version: "0.0.1",
    // Brief, one-line summary of the package.
    summary: "",
    // URL to the Git repository containing the source code for this package.
    git: "",
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: "README.md"
});

Npm.depends({
    "alsa-monitor": "https://github.com/illegalprime/alsa-monitor-node/archive/05d2e16b81da6665dfee8c06c939e872f2ac8b0e.tar.gz",
});

Package.onUse(function(api) {
    api.versionsFrom("1.2.1");
    api.use([
        "ecmascript",
        "mongo",
        "underscore",
    ]);
    api.addFiles([
        "system.js",
        "bluetooth.js",
    ], "server");
});

Package.onTest(function(api) {
    api.use("ecmascript");
    api.use("tinytest");
    api.use("kthulu:system");
    api.addFiles("system-tests.js");
});
