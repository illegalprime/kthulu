var SystemStateSub = Meteor.subscribe("SystemState");

var SystemState = new Mongo.Collection("SystemState");

// TODO: Add lock while volume is changing so other users won't.

Template.volumectl.helpers({
    volume: function() {
        var data = SystemState.findOne({}, {
            fields: {
                "volume.value": true,
            },
        });
        if (data && data.volume && _.isNumber(data.volume.value)) {
            return data.volume.value;
        }
    },
    muted: function() {
        var data = SystemState.findOne({}, {
            fields: {
                "volume.muted": true,
            },
        });
        if (data && data.volume && _.isBoolean(data.volume.muted)) {
            return data.volume.muted;
        }
    },
});

Template.volumectl.events({
    "input input[type=range].volume-bar": function(event, tmpl) {
        if (tmpl.changing_volume) {
            tmpl.leftover_action += 1;
            Meteor.call("volume", {
                value: event.currentTarget.valueAsNumber
            }, function() {
                tmpl.leftover_action -= 1;
            });
        }
    },
    "click a.mute-btn": function(event) {
        Meteor.call("volume", {
            muted: !!event.currentTarget.dataset.muted,
        });
    },
    "mousedown input[type=range].volume-bar": function(event, tmpl) {
        tmpl.lock_volume_bar();
    },
    "mouseup input[type=range].volume-bar": function(event, tmpl) {
        tmpl.release_volume_bar();
    },
});

Template.volumectl.onRendered(function() {
    var tmpl = this;
    tmpl.changing_volume = false;
    tmpl.leftover_action = 0;

    var observation = SystemState.find({}).observe({
        added: function(doc) {
            if (doc.volume && _.isNumber(doc.volume.value)) {
                var volume = doc.volume.value;
                tmpl.$("input[type=range].volume-bar").val(volume);
                if (observation) {
                    observation.stop();
                }
            }
        },
    });

    tmpl.lock_volume_bar = function() {
        tmpl.changing_volume = true;
    };
    tmpl.release_volume_bar = function() {
        tmpl.changing_volume = false;
    };

    tmpl.$("input[type=range].volume-bar").on("touchstart", function() {
        tmpl.lock_volume_bar();
    });
    tmpl.$("input[type=range].volume-bar").on("touchend", function() {
        tmpl.release_volume_bar();
    });

    tmpl.autorun(function() {
        var data = SystemState.findOne({}, {
            fields: {
                "volume.value": true,
            },
        });
        if (!data || !data.volume || !_.isNumber(data.volume.value)) {
            return;
        }
        if (tmpl.changing_volume || tmpl.leftover_action !== 0) {
            return;
        }
        var volume = data.volume.value;
        tmpl.$("input[type=range].volume-bar").val(volume);
    });
});
