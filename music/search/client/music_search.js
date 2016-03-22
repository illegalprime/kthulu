(function() {
    "use strict";
    var Results = new ReactiveVar([]);
    var CardWidth = new ReactiveVar(-1);
    var Log = console;

    Template.music_search_result_item.helpers({
        pick_image: function(images) {
            var target_width = CardWidth.get();
            var largest = {
                width: -1,
            };
            var closest = {
                width: Infinity,
            };

            _.each(images, function(image) {
                var width = image.width;
                if (width > largest.width) {
                    largest = image;
                }
                if (width >= target_width && width < closest.width) {
                    closest = image;
                }
            });
            return closest.url ? closest.url : largest.url;
        },
        pick_icon: function(type) {
            if (type === "track") {
                return "audiotrack";
            }
        }
    });

    Template.music_search_result_item.onRendered(function() {
        if (CardWidth.get() === -1) {
            CardWidth.set(this.$("div.card").width());
        }
    });

    Template.music_search_result_item.events({
        "click .search-result-item .activator": function(event) {
            Meteor.call("spotify_play", Template.instance().data.id);
        },
    });

    Template.music_overview.helpers({
        bar_config: function() {
            return {
                search: true,
                float: true,
            };
        },
        search_results: function() {
            return Results.get();
        },
    });

    Template.music_overview.onRendered(function() {
        var tmpl = this;
        var SEARCH_INPUT = "nav.main-bar input.search_text";

        // div's do not fire a resize event
        $(window).resize(_.debounce(function() {
            var width = tmpl.$("div.card").width();
            if (width) {
                CardWidth.set(width);
            }
        }, 500));

        tmpl.$(SEARCH_INPUT).on("input", _.debounce(function(event) {
            var query = event.currentTarget.value;
            if (!query || query === "") {
                return;
            }
            Meteor.call("music_search_spotify", query, function(err, data) {
                if (!err) {
                    Results.set(data.tracks.items);
                } else {
                    Log.error(err);
                }
            });
        }, 500));
    });
})();
