Package.describe({
    name: "kthulu:apps",
    version: "0.0.1",
    // Brief, one-line summary of the package.
    summary: "",
    // URL to the Git repository containing the source code for this package.
    git: "",
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: "README.md"
});

Package.onUse(function(api) {
    api.versionsFrom("1.2.1");
    api.use([
        "ecmascript",
        "kthulu:wmctrl",
        "froatsnook:sleep",
        "underscore",
        "mongo",
    ]);
    api.addFiles("apps.js", "server");
});

Package.onTest(function(api) {
    api.use("ecmascript");
    api.use("tinytest");
    api.use("kthulu:apps");
    api.addFiles("apps-tests.js");
});
