var tvdb = {
    "episodes": function(id) {
        var url = "http://thetvdb.com/api/" + SECRETS.TVDB + "/series/" + id + "/all/en.xml";
        var req = HTTP.get(url);
        var parsed = xml2js.parseStringSync(req.content);
        return _.reduce(parsed.Data.Episode, function(episodes, episode) {
            var rating = parseFloat(episode.Rating[0]);
            var season = parseInt(episode.SeasonNumber[0]);
            if (!episodes[season]) {
                episodes[season] = [];
            }
            episodes[season].push({
                id:        episode.id[0],
                name:      episode.EpisodeName[0],
                aired:     new Date(episode.FirstAired[0]),
                number:    parseInt(episode.EpisodeNumber[0]),
                overview:  episode.Overview[0],
                rating:    isNaN(rating) ? undefined : rating,
                cache:     parseInt(episode.lastupdated[0]),
                thumbnail: "http://thetvdb.com/banners/" + episode.filename[0],
            });
            return episodes;
        }, {});
    },
    "imdb2id": function(imdb) {
        var basic_info = HTTP.get("http://thetvdb.com/api/GetSeriesByRemoteID.php", {
            params: {
                imdbid: imdb,
            }
        });
        var parsed_basic = xml2js.parseStringSync(basic_info.content);
        return parsed_basic.Data.Series[0].seriesid[0];
    },
};

Meteor.methods({
    "tv_info": function(imdb) {
        return tvdb.episodes(tvdb.imdb2id(imdb));
    },
});
