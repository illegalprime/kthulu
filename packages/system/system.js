Meteor.methods({
    volume: function(value) {
        if (!value) {
            // TODO: Get volume
            return 80;
        }
        console.log("Changing volume to " + value);
    }
});
