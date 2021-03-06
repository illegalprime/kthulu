Meteor.methods({
    "omdb_info": function(imdb) {
        var result = HTTP.get("http://www.omdbapi.com/", {
            params: {
                i: imdb,
            }
        });
        if (result.statusCode !== 200) {
            throw new Meteor.Error("http", result.statusCode);
        }
        var data = result.data;
        if (!data || !data.Response) {
            throw new Meteor.Error("bad_request", result.Error);
        }
        data.Actors = data.Actors.split(", ");
        if (data.Type === "series") {
            data.is_tv = true;
        }
        return data;
    },
});
