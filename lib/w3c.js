var sys    = require('sys'),
    http   = require('http');

var checkValidation = function(url, cb) {
    var w3c     = "x-w3c-validator-",
        site    = http.createClient(80, "validator.w3.org"),
        path    = "/check?uri=" + url,
        userAgent = "curl/7.20.0 (i386-apple-darwin10.2.0) libcurl/7.20.0 OpenSSL/0.9.8m zlib/1.2.4 libidn/1.16",
        request = site.request('GET', path, {'User-Agent': userAgent,
                                             'Host': "validator.w3.org",
                                             'Accept': '*/*'});
    
    request.on('response', function (response) {
                   response.setEncoding('utf8');

                   /* Here for when we care to actually parse the body
                   response.on('data', function (chunk) { body += chunk; }); */
                   response.on('end', function() {
                                   result = {url:       url,
                                             recursion: response.headers[w3c + "recursion"],
                                             status:    response.headers[w3c + "status"],
                                             errors:    response.headers[w3c + "errors"],
                                             warnings:  response.headers[w3c + "warnings"]}

                                   return cb(result);
                               }); 
               });

    request.end();
};

// An architecture that lets us respect the w3c validator. 
// Would rather just run it locally though. Oh well.
var validatePending = function(pending, destination) {
    if (pending.length > 0) {
        console.log("Validating another out of " + pending.length + " pending urls");
        checkValidation(pending.shift(), function(result) {
                            destination[result.url] = result;
                        });
    }
}   

// checkValidation("http://www.google.com", function(result) { console.log(result); });
exports.checkValidation = checkValidation;
exports.validatePending = validatePending;


