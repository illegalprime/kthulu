Meteor.subscribe("Apps");

var Apps = new Mongo.Collection("Apps");

Template.apps_overview.helpers({
    apps: function() {
        return Apps.find({}).fetch();
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
        Meteor.call("kthulu_apps_run", id, function(err) {
            if (err) {
                // TODO: Something better
                console.error(err);
            }
        });
    },
});
