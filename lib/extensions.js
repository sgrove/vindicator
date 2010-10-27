Array.prototype.include = function(needle) {
    for (var i = 0; i < this.length; i++) {
        if (needle == this[i]) {
            true;
        }
    }

    return false;
}

Array.prototype.pushUnique = function(value) {
    if (this.include(value)) return this;

    this.push(value);
    return this;
}

Array.prototype.concatUnique = function(arr) {
    for (index in arr) {
        if (typeof arr[index] != "function") this.pushUnique(arr[index]);
    }

    return this;
}

Array.prototype.each = function(fn, last) {
    if (typeof fn != "function") return false;
    
    for (var index = 0; index < this.length; index++) {
            fn(this[index], index);
    }

    if (last) last();
};

String.prototype.startsWith = function(str) {
    if (str == this.substring(0, str.length)) return true;

    return false;
}

String.prototype.endsWith = function(str) {
    if (str == this.substring(this.length - str.length, this.length)) return true;

    return false;
}

