var SystemStateSub = Meteor.subscribe("SystemState");

var SystemState = new Mongo.Collection("SystemState");

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
        Meteor.call("volume", {
            value: event.currentTarget.valueAsNumber
        });
    },

    "click a.mute-btn": function(event) {
        Meteor.call("volume", {
            muted: !!event.currentTarget.dataset.muted,
        });
    },
});

Template.volumectl.onRendered(function() {
    var tmpl = this;

    var observation = SystemState.find({}).observe({
        added: function(doc) {
            if (doc.volume && _.isNumber(doc.volume.value)) {
                var volume = doc.volume.value;
                tmpl.$("input[type=range].volume-bar").val(volume);
                observation.stop();
            }
        },
    });
});
