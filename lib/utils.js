var parseUrl = function(url) {
    var index    = url.indexOf("/", 8),
        protocol = url.substring(0, url.indexOf(":")),
        path     = url.substring(index, url.length),
        host     = index == -1
                    ? url.substring(protocol.length + 3, url.length)
                    : url.substring(0, index).replace(protocol + "://", ""),
        port     = protocol == "https"
                    ? 443
                    : 80,
        path     = (path == null || path.length < 1)
                    ? "/"
                    : path;

    return {protocol: protocol, host: host, port: port, path: path}
}    

export.parseUrl = parseUrl;
