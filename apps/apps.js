var APPS = [
    {
        id: "netflix",
        cover: "/netflix.png",
        label: "Netflix",
        filter: {
            title: "Netflix",
        },
    },
    {
        id: "steam",
        cover: "/steam.png",
        label: "Steam",
        filter: {
            class: "Steam",
        },
    },
];

if (Meteor.isClient) {
    Template.apps_overview.helpers({
        apps: function() {
            return APPS;
        },
        bar_config: function() {
            return {
                title: "Apps",
            };
        },
    });

    Template.apps_overview.events({
        "click .app-item": function(event) {
            var id = event.currentTarget.dataset.app;
            var app = _.findWhere(APPS, {
                id: id,
            });
            Meteor.call("wmctrl", {
                focus: app.filter,
            }, function(err, success) {
                // TODO
            });
        },
    });
}
