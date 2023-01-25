structurizr.util.Stack = class Stack {

    #stack = [];

    pop() {
        return this.#stack.pop();
    }

    push(item){
        this.#stack.push(item);
    }

    peek() {
        if (this.isEmpty()) {
            return undefined;
        } else {
            return this.#stack[this.#stack.length - 1];
        }
    };

    isEmpty() {
        return this.#stack.length === 0;
    };

    count() {
        return this.#stack.length;
    }

}

structurizr.util.selectText = function(id) {
    if (window.getSelection()) {
        var range = document.createRange();
        range.selectNode(document.getElementById(id));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
};

structurizr.util.dataURIToBlob = function(dataURI) {
    // data:image/png;base64,xxx
    var binaryString = atob(dataURI.split(',')[1]);
    var length = binaryString.length;
    var array = new Uint8Array(length);
    var mimeType = dataURI.split(',')[0].split(':')[1].split(';')[0];

    for (var i = 0; i < length; i++) {
        array[i] = binaryString.charCodeAt(i);
    }

    return new Blob([array], {
        type: mimeType
    });
};

structurizr.util.downloadFile = function(content, contentType, filename) {
    var blob = new Blob([content], {type: contentType});
    var url = URL.createObjectURL(blob);

    var link = document.createElement("a");
    link.download = filename;
    link.href = url;

    document.body.appendChild(link);
    link.click();
    link.remove();
};

structurizr.util.toBlob = function(content, contentType) {
    return new Blob([content], {type: contentType});
};

structurizr.util.escapeHtml = function(html) {
    return html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

structurizr.util.btoa = function(plain) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(plain));
};

structurizr.util.atob = function(encoded) {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(encoded));
};

structurizr.util.exportWorkspace = function(id, json) {
    const jsonAsString = JSON.stringify(json, null, '    ');
    const filename = 'structurizr-' + id + '-workspace.json';
    structurizr.util.downloadFile(jsonAsString, "text/plain;charset=utf-8", filename);
};



if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
        return this.substr(position || 0, searchString.length) === searchString;
    };
}