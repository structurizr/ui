var Structurizr = Structurizr || {

    workspace: undefined,
    diagram: undefined,
    features: {
        imageEmbed: false
    }

};

var structurizr = structurizr || {
    util: {}
};

window.onerror = function (msg, url, lineNo, columnNo, error) {
    logError(msg, url, lineNo, error);
};

function logError(msg, url, lineNo, error) {
    try {
        $.ajax({
            url: '/error',
            method: 'POST',
            data: {
                userAgent: navigator.userAgent,
                pageUrl: window.location.href,
                message: msg,
                url: url,
                lineNumber: lineNo,
                stackTrace: ((error !== undefined && error !== null) ? error.stack : undefined)
            },
            dataType: 'text',
            timeout: 1000 * 10
        })
        .done(function (data, textStatus, jqXHR) {
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log("There was an error logging the error : " + textStatus + ' (HTTP status code=' + jqXHR.status + ')');
        })
        .always(function () {
        });
    } catch (err) {
        console.log(msg);
        console.log('There was an error logging the error: ' + err);
    }
}