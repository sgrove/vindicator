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
   ,visited = [];

var crawl = function(url) {
    request({uri:url}, function (error, response, body) {
        results.push([response.statusCode, url]);

        console.log("[" + response.statusCode + "] " + url);

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
                        newUrl = protocol + response.socket.host + newUrl;
                    }

                    if (!visited.include(newUrl)) {
                        visited.push(newUrl);
                        crawl(newUrl);
                    }
                });
            });
        }
    });
}

var startingUrl = process.argv[2];
crawl(startingUrl);
