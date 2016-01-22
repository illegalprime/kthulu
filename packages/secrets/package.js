Package.describe({
    name: "secrets",
    version: "0.0.1",
});

Package.onUse(function(api) {
    if (process.env.IGNORE_SECRETS) {
        api.addFiles("secrets.safe.js", "server");
    } else {
        api.addFiles("secrets.js", "server");
    }
    api.export("SECRETS", "server");
});
