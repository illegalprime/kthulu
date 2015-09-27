var DELUGE_ERR = {
    API: "Deluge API Error",
};

var Deluge = function(options) {
    var opts = _.extend({
        host: "127.0.0.1",
        port: 8112,
    }, options || {});
    var url = "http://" + opts.host + ":" + opts.port + "/json";
    var jar = "";
    var connected = false;
    var msg_id = 0;

    var self = {};

    var State = new ReactiveVar();
    var poll;

    var send = function(method, params) {
        var zipped = HTTP.post(url, {
            data: {
                method: method,
                params: params || [],
                id: msg_id++,
            },
            responseType: "buffer",
            headers: {
                Cookie: jar,
            },
        });
        _.each(zipped.headers["set-cookie"], function(cookie) {
            var data = cookie.match(/(.*?;)/);
            if (data) {
                jar += data[1];
            }
        });
        var res = JSON.parse(gunzipSync(zipped.content));
        if (_.isNull(res.error)) {
            return res.result;
        } else {
            throw new Meteor.Error(DELUGE_ERR.API, res.error);
        }
    };

    self.methods = function() {
        return send("system.listMethods");
    };

    self.login = function() {
        var status = send("auth.login", [opts.pass]);
        connected = true;
        return status;
    };

    self.hosts = function() {
        return send("web.get_hosts");
    };

    self.host_satus = function(host) {
        return send("web.get_host_status", [host])
    };

    self.connect_host = function(host) {
        return send("web.connect", [host]);
    };

    self.update = function(things) {
        return send("web.update_ui", [things, {}]);
    };

    self.quick_setup = Meteor.wrapAsync(function(interval, resolve) {
        if (_.isFunction(interval)) {
            resolve = interval;
            interval = 1000;
        }
        self.login();
        var check_hosts = function(done) {
            (function checker() {
                var hosts = self.hosts();
                if (hosts.length === 0) {
                    Meteor.setTimeout(checker, 1000);
                } else {
                    done(hosts);
                }
            })();
        };
        var check_online = function(host, done) {
            var ONLINE = "Connected";
            (function checker() {
                var status = self.host_satus(host);
                if (status[3] === ONLINE) {
                    done(host);
                } else {
                    Meteor.setTimeout(checker, 1000);
                }
            })();
        };
        check_hosts(function(hosts) {
            var first = hosts[0][0];
            check_online(first, function() {
                self.connect_host(first);
                resolve(undefined, first);
            });
        });
    });

    self.connected = function() {
        return connected;
    };

    self.poll = function(what, interval) {
        interval = interval || 2000;
        var checker = function() {
            State.set(self.update(what));
            if (poll) {
                poll = Meteor.setTimeout(checker, interval);
            }
        };
        poll = Meteor.setTimeout(checker, interval);
    };

    self.stop_poll = function() {
        if (poll) {
            Meteor.clearTimeout(poll);
            poll = false;
        }
    };

    self.state = function() {
        return State.get();
    };

    if (opts.setup) {
        self.quick_setup();
    }

    return self;
};
