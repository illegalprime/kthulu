Template.volumectl.helpers({
    volume: function() {
        return Template.instance().volume.get();
    },
});

Template.volumectl.events({
    "input input[type=range].volume-bar": function(event, tmpl) {
        tmpl.volume.set(event.currentTarget.valueAsNumber);
    },
});

Template.volumectl.onCreated(function() {
    var tmpl = this;
    tmpl.volume = new ReactiveVar(50);

    Meteor.call("volume", function(err, value) {
        tmpl.volume.set(value);
        tmpl.$("input[type=range].volume-bar").val(value);

        tmpl.autorun(function() {
            Meteor.call("volume", tmpl.volume.get());
        });
    });
});
