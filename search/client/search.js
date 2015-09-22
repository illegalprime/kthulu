var Results = new ReactiveVar([]);
var cardSize = new ReactiveVar();

var search_imdb = function(query, done) {
    if (query === "") {
        return done([]);
    }
    query = query.toLowerCase();
    $.ajax({
        url: "http://sg.media-imdb.com/suggests/" + query[0] + "/" + query + ".json",
        dataType: "jsonp",
        cache: true,
        jsonp: false,
        jsonpCallback: "imdb$" + query,
    }).done(function(results) {
        console.log(results);
        var i = 0;
        done(_.map(results.d, function(result) {
            // TODO: Default image when none is available
            var image = result.i[0];
            var type = result.q;
            var icon = image.replace(/_(?=.{4}$)/, "._SX96_CR0,0,96,96_");
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
                index:     i++,
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
        search_imdb($(this).val(), function(data) {
            if (data) {
                Results.set(data);
            }
        });
    });
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
        var index = parseInt($(event.currentTarget).attr("data-index"));
        var data = Results.get()[index];
        window.location = "http://www.imdb.com/title/" + data.imdb;
    },
});
