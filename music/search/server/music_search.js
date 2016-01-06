(function() {
    "use strict";

    Meteor.methods({
        music_search_spotify: function(query) {
            var result;
            try {
                result = HTTP.get("https://api.spotify.com/v1/search", {
                    params: {
                        query: query,
                        type: "track",
                        limit: 10,
                    },
                });
            } catch(err) {
                throw new Meteor.Error("SPOTIFY_API_ERR");
            }
            if (result.statusCode === 200) {
                return result.data;
            } else {
                throw new Meteor.Error("SPOTIFY_SEARCH_ERROR");
            }
        },
    });
})();
