var Results = new ReactiveVar([]);
var cardSize = new ReactiveVar();
var selected = new ReactiveVar();

var proxyUrl = function(url) {
    return "/no_referer/" + encodeURIComponent(url);
};

var search_imdb = function(query, done) {
    if (query === "") {
        return done([]);
    }
    var q = query.toLowerCase().trim().replace(/\s+/, "_");
    $.ajax({
        url: "http://sg.media-imdb.com/suggests/" + q[0] + "/" + q + ".json",
        dataType: "jsonp",
        cache: true,
        jsonp: false,
        jsonpCallback: "imdb$" + q,
    }).done(function(results) {
        done(_.map(results.d, function(result) {
            var image, icon;
            if (result.i) {
                image = result.i[0];
                if (image) {
                    icon = image.replace(/_(?=.{4}$)/, "._SX96_CR0,0,96,96_");
                } else {
                    // TODO: Default image when none is available
                }
            }
            var type = result.q;
            var type_icon;
            var is_person = ! type;
            var title = result.l;

            if (type === "TV series" || type === "TV mini-series") {
                type_icon = "airplay";
            } else if (type === "feature" || type === "TV movie") {
                type_icon = "movie";
            } else if (type === "video") {
                type_icon = "video_library";
            } else if (is_person) {
                type_icon = "person_pin";
            }

            return {
                imdb:      result.id,
                title:     title,
                created:   result.y,
                type:      type,
                type_icon: type_icon,
                cover:     image,
                icon:      icon,
                is_person: is_person,
            };
        }));
    }).fail(function() {
        done();
    });
};

$(window).resize(_.debounce(function() {
    var delegate = $(".movie-cover")[0];
    if (delegate && delegate.width > cardSize.get()) {
        cardSize.set(delegate.width);
    }
}, 500));

Template.search.helpers({
    bar_config: function() {
        return {
            search: true,
            float: true,
        };
    },
});

Template.search.onRendered(function() {
    this.$(".main-bar input.search_text").on("input", function(event) {
        search_imdb(event.currentTarget.value, function(data) {
            if (data) {
                Results.set(data);
            }
        });
    });
    this.$("nav.main-bar input.search_text").focus();
    this.$("nav.main-bar i.clear-search").on("click", function() {
        selected.set();
        Results.set();
    });
    this.$("nav.main-bar input.search_text").on("focus", function() {
        selected.set();
    });
});

Template.search_results.helpers({
    "search_results": function() {
        return Results.get();
    },
});

Template.search_result_item.helpers({
    "imdb_img": function(url) {
        var size = cardSize.get();
        if (!size) {
            size = $(".movie-cover")[0].width;
            cardSize.set(size);
        }
        var crop = "._SX" + size + "_CR0,0," + size + "," + size + "_";
        url = url.replace(/_(?=.{4}$)/, crop);
        url = proxyUrl(url);
        return url;
    },
});

Template.search_result_item.events({
    "click div.search-result-item": function(event) {
        selected.set({
            loading: true,
        });
        Meteor.call("omdb_info", event.currentTarget.id, function(err, info) {
            if (err) {
                // TODO: Something better
                return;
            }
            if (info.is_tv) {
                Meteor.call("tv_info", event.currentTarget.id, function(err, tv_info) {
                    info.tv_info = tv_info;
                    selected.set(info);
                });
            } else {
                selected.set(info);
            }
        });
    },
});

Template.detailed_item.helpers({
    "item_detail": function() {
        var data = selected.get();
        if (data) {
            $(".detailed-item").show();
            $(".search-results").hide();
        } else {
            $(".search-results").show();
            $(".detailed-item").hide();
        }
        return data;
    },

    "is_loading": function() {
        var data = selected.get();
        return data && data.loading;
    },
});

Template.detailed_item.events({
    "click .hide-detail": function(event) {
        selected.set();
    }
});

Template.tv_detail.onRendered(function() {
    this.$(".collapsible").collapsible({
        accordion: true,
    });
});

Template.tv_detail.helpers({
    "seasons": function() {
        var data = selected.get();
        if (data.tv_info) {
            var info = [];
            _.each(data.tv_info, function(episodes, season) {
                info.push({
                    season: season,
                    episodes: episodes,
                    specials: season === "0",
                });
            });
            return info;
        }
    },
});
