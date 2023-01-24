var Structurizr = Structurizr || {

    workspace: undefined,
    diagram: undefined,
    features: {
        imageEmbed: false
    }

};

var structurizr = structurizr || {
    io: {},
    ui: {},
    util: {}
};

structurizr.constants = {
    CUSTOM_ELEMENT_TYPE: "Custom",
    PERSON_ELEMENT_TYPE: "Person",
    SOFTWARE_SYSTEM_ELEMENT_TYPE: "SoftwareSystem",
    CONTAINER_ELEMENT_TYPE: "Container",
    COMPONENT_ELEMENT_TYPE: "Component",
    DEPLOYMENT_NODE_ELEMENT_TYPE: "DeploymentNode",
    INFRASTRUCTURE_NODE_ELEMENT_TYPE: "InfrastructureNode",
    SOFTWARE_SYSTEM_INSTANCE_ELEMENT_TYPE: "SoftwareSystemInstance",
    CONTAINER_INSTANCE_ELEMENT_TYPE: "ContainerInstance",

    CUSTOM_VIEW_TYPE: "Custom",
    SYSTEM_LANDSCAPE_VIEW_TYPE: "SystemLandscape",
    SYSTEM_CONTEXT_VIEW_TYPE: "SystemContext",
    CONTAINER_VIEW_TYPE: "Container",
    COMPONENT_VIEW_TYPE: "Component",
    DYNAMIC_VIEW_TYPE: "Dynamic",
    DEPLOYMENT_VIEW_TYPE: "Deployment",
    FILTERED_VIEW_TYPE: "Filtered",

    DEFAULT_DEPLOYMENT_ENVIRONMENT_NAME: "Default"
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