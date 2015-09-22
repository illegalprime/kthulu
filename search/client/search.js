var Results = new ReactiveVar([]);
var cardSize = new ReactiveVar();
var selected = new ReactiveVar();

var search_imdb = function(query, done) {
    if (query === "") {
        return done([]);
    }
    var q = query.toLowerCase();
    $.ajax({
        url: "http://sg.media-imdb.com/suggests/" + q[0] + "/" + q + ".json",
        dataType: "jsonp",
        cache: true,
        jsonp: false,
        jsonpCallback: "imdb$" + query,
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
                type_icon = "video_library"
            } else if (is_person) {
                type_icon = "person_pin"
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

Template.search_results.helpers({
    "search_results": function() {
        return Results.get();
    },
});

Template.search_bar.onRendered(function() {
    this.$("input.search_text").on("input", function() {

    });
});

Template.search_bar.events({
    "keypress input.search_text": function(event) {
        search_imdb(event.currentTarget.value, function(data) {
            if (data) {
                Results.set(data);
            }
        });
    },

    "focus input.search_text": function(event) {
        selected.set();
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
        return url.replace(/_(?=.{4}$)/, crop);
    },
});

Template.search_result_item.events({
    "click div.search-result-item": function(event) {
        selected.set({
            loading: true,
        });
        Meteor.call("omdb_info", event.currentTarget.id, function(err, data) {
            if (!err) {
                selected.set(data);
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
