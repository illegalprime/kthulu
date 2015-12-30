var Url = Npm.require("url");

Router.route("/no_referer/:url", function() {
    var url = decodeURI(this.params.url);
    var method = this.request.method;
    var headers = this.request.headers;
    var response = this.response;
    var parsed = Url.parse(url);

    delete headers.referer;
    headers.host = parsed.host;

    try {
        HTTP.call(method, url, {
            headers: headers,
            responseType: "buffer",
        }, function(err, data) {
            response.statusCode = data.statusCode;
            response.end(data.content);
        });
    } catch (err) {
        response.statusCode = 404;
        response.end();
    }
}, {
    where: "server",
});
