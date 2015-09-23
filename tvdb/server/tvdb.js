var tvdb = {
    "episodes": function(id) {
        var req = HTTP.get("http://thetvdb.com/api/" + key + "/series/" + id + "/all/en.xml");
        var parsed = xml2js.parseStringSync(req.content);
        var episodes = _.map(parsed.Data.Episode, function(episode) {
            return {
                id:        episode.id[0],
                name:      episode.EpisodeName[0],
                aired:     new Date(episode.FirstAired[0]),
                number:    parseInt(episode.EpisodeNumber[0]),
                overview:  episode.Overview[0],
                rating:    parseFloat(episode.Rating[0]),
                cache:     parseInt(episode.lastupdated[0]),
                thumbnail: episode.filename[0],
            };
        });
    },
};

Meteor.methods({
    "tv_info": function(imdb) {
        var basic_info = HTTP.get("http://thetvdb.com/api/GetSeriesByRemoteID.php", {
            params: {
                imdbid: imdb,
            }
        });
        var parsed_basic = xml2js.parseStringSync(basic_info.content);
        var series_id = parsed_basic.Data.Series.seriesid;
        return tvdb.episodes(series_id);
    },
});
