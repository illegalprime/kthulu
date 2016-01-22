Package.describe({
    name: "secrets",
    version: "0.0.1",
});

Package.onUse(function(api) {
    api.export("SECRETS", "server");
    api.addFiles("secrets.js", "server");
    api.addAssets("secrets.json", "server");
});
