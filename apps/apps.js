var APPS = {
    netflix: {
        id: "netflix",
        cover: "/netflix.png",
        label: "Netflix",
        cmd: "google-chrome --app='http://www.netflix.com/browse'",
        timeout: 5000,
        filter: {
            class: "www.netflix.com__browse.google-chrome",
        },
        run_with: {
            focus: true,
            fullscreen: "on",
        },
    },
    steam: {
        id: "steam",
        cover: "/steam.png",
        label: "Steam",
        cmd: "steam",
        filter: {
            class: "Steam",
        },
    },
};

if (Meteor.isClient) {
    Template.apps_overview.helpers({
        apps: function() {
            return _.values(APPS);
        },
        bar_config: function() {
            return {
                title: "Apps",
            };
        },
    });

    Template.apps_overview.events({
        "click .app-item": function(event) {
            var app = APPS[event.currentTarget.dataset.app];
            Meteor.call("kthulu_apps_run", app, app.run_with, function(err) {
                if (err) {
                    // TODO: Something better
                    console.error(err);
                }
            });
        },
    });
}
