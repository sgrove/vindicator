require('./lib/extensions.js');

var sys    = require('sys'),
    http   = require('http'),
    jsdom  = require('jsdom'),
    window = jsdom.jsdom().createWindow(),
    w3c = require('./lib/w3c.js'),
    utils = require('./lib/utils.js');

var results = [],
    visited = [],
    pending = [],
    urlsToValidate = [],
    validations = [];

var chromeUserAgent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.X.Y.Z Safari/525.13.";

var getAllLinks = function(body, url, cb) {
    console.log(body);
    //console.log("getAllLinks [" + url + "]: " + body);

    if (body == undefined || body == null || body.length < 1) return cb([]);
    console.log("Body length: " + body.length);

    var window = jsdom.jsdom(body).createWindow(),
        links = [];

    jsdom.jQueryify(window, "lib/jquery-1.4.2.min.js", function (window, $) {
                        $('a').each(function() {
                                        var newUrl = $(this).attr("href");

                                        if (newUrl.startsWith("mailto")) return;
                                        if (newUrl.startsWith("/")) newUrl = newUrl.substring(1, newUrl.length);
                                        if (!newUrl.startsWith("http")) newUrl = url.protocol + "://" + url.host + "/" + newUrl;

                                        links.push(newUrl);
                                    });

                        cb(links);
                    });
};


var getUrl = function(urlString, cb, level) {
    level = level || 0;

    var body     = "",
        url      = utils.parseUrl(urlString),
        debug    = JSON.stringify({body: body, url: url}),
        debugBar = ""; // Just pretty debugging
    
    console.log("\tGetting url: " + sys.inspect(url));

    for (var i = 0; i < debug.length + 2; i++) debugBar += "-"; 
    
    console.log("-" + debugBar + "\\");
    console.log(" " + debug);
    console.log("-" + debugBar + "/");

    // Add https support laterz :P
    if ("https" == url.protocol) cb(null);

    // Only follow links from the same domain we started with
    if (!url.host.endsWith(primaryDomain)) cb(null);

    var site = http.createClient(url.port, url.host);
    var request = site.request('GET', url.path, {'User-Agent': chromeUserAgent,
                                                 'Host': url.host,
                                                 'Accept': '*/*'});

    request.on('response', function (response) {
                   if ((302 == response.statusCode || 301 == response.statusCode) && level < 5) {
                       console.log('REDIRECT: ' + response.headers.location);
                       results.push({status: response.statusCode, body: "", valid: "unknown", url: url})
                       return getUrl(response.headers.location, cb, level + 1);
                   } else {
                       response.setEncoding('utf8');
                       response.on('data', function (chunk) {
                                       //console.log('BODY: ' + chunk);
                                       body += chunk;
                                   });
                       response.on('end', function() {
                                       w3c.checkValidation(url, function(result) {
                                                               //results.push({status: response.statusCode, body: body, validation: result, url: url})
                                                               results.push({status: response.statusCode, validation: result, url: url})
                                                               visited.push(urlString);
                                                               getAllLinks(body, url, function(links) {
                                                                               pending.concatUnique(links);
                                                                               cb(body);
                                                                           });
                                                           });
                                   });
                   }
               });

         request.end();
};

console.log(pending);
console.log("============================================================");

var startingUrl = process.argv[2];

var processUrl = function() {
    console.log("Results: ");
    console.log(results);
    console.log("------------------------------------------------------------");

    pending.each(function(url, index) {
                     console.log("Checking through pending");
                     if (!visited.include(url)) {
                         getUrl(url, processUrl);
                     }
                 });
};

var pendingHandle,
    resultsHandle,
    primaryDomain = parseUrl(startingUrl).host;

var consumePending = function() {
    if (pending.length != 0) {
        getUrl(pending.shift(), function(){});
    } else {
        clearInterval(pendingHandle);
        clearInterval(resultsHandle);
        console.log("Final results (should be html):");
        console.log(results);
    }
};

// Kickoff the crawling process
getUrl(startingUrl, function() {
           pendingHandle = setInterval(consumePending, 100);
           resultsHandle = setInterval(function() {
                                           console.log("------------------------------------------------------------");
                                           console.log(results);
                                           console.log(validations)
                                       }, 4000);
           validateHandle = setInterval(w3c.validatePending(results, validations), 1000);
       });
