var sys = require('sys')
,http = require('http')
,request = require('request')
,jsdom = require('jsdom')
,window = jsdom.jsdom().createWindow();


Array.prototype.include = function(needle) {
    for (var i = 0; i < this.length; i++) {
        if (needle == this[i]) {
            true;
        }
    }

    return false;
}

String.prototype.startsWith = function(str) {
    if (str == this.substring(0, str.length)) return true;

    return false;
}

var results = []
,visited = []
,pending = [];


var operator = {
    results: [],
    visited: [],
    pending: [],
    currentConnections: 0,
    maxConnections: 20,
    addUrl: function(url) { if (!this.visited.include(url)) { console.log("Adding: " + url); this.pending.push(url); return true; } else { return false; } },
    nextUrl: function() {
        if (this.pending.length != 0) {
            this.currentConnections += 1;
            return this.pending.shift();
        } else {
            return false;
        }
    },
    hasPendingUrls: function () { return !(this.pending.length == 0); },
    logResult: function(url, status) { this.currentConnections = Math.max(0, this.currentConnections - 1); this.results.push([url, status]); this.visited.push(url); },
    crawl: function(url, cb) {
        //console.log("crawling: " + url);
        var op = this;
        request({uri:url}, function (error, response, body) {
            op.logResult(url, response.statusCode);

            if (!error && response.statusCode == 200) {
                var window = jsdom.jsdom(body).createWindow();
                jsdom.jQueryify(window, "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.js", function (window, $) {
                    $('a').each(function() {
                        var newUrl = $(this).attr("href");

                        if (newUrl.startsWith("//")) {
                            newUrl = newUrl.substring(1, newUrl.length);
                        }
                        
                        if (!newUrl.startsWith("http")) {
                            var protocol = response.socket.https ? "https://" : "http://";
                            newUrl = protocol + response.socket.host + "/" + newUrl;
                        }

                        op.addUrl(newUrl);
                        cb();
                    });
                });
            }
        });
    },
    crawlNext: function(cb) { if ((this.currentConnections < this.maxConnections)) {
        //console.log("Crawling next...");
        var next = this.nextUrl()
        if (next) {
            this.crawl(next, cb);
        }
    }
                            }
};

var startingUrl = process.argv[2];
operator.addUrl( startingUrl);

while(true) {
    //console.log(operator);
    operator.crawlNext(function() {
        console.log("/------------------------------------------------------------\\");
        console.log(operator.results);
        console.log("\\------------------------------------------------------------/");
    });
}
